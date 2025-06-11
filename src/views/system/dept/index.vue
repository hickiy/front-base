<template>
  <div class="bg-white flex-1 p-4 m-2.5 flex flex-col overflow-hidden">
    <el-form class="ion-search-area--bg pt-4 pl-4 pr-4" :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="部门名称" prop="deptName">
        <el-input v-model="queryParams.deptName" placeholder="请输入部门名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="部门状态" clearable>
          <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <template #append>
        <el-button @click="resetQuery">重置</el-button>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
      </template>
    </el-form>
    <el-table
      row-key="deptId"
      height="100%"
      title="部门列表"
      row-class-name="setup_center"
      :border="true"
      :set-table="[]"
      v-loading="loading"
      :data="deptList"
      :default-expand-all="true"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <template #prepend>
        <div class="flex flex-rwo justify-end">
          <el-button type="primary" size="default" @click="handleAdd" v-hasPermi="['system:dept:add']">新增</el-button>
        </div>
      </template>
      <el-table-column prop="deptName" label="部门名称" width="300"></el-table-column>
      <el-table-column prop="orderNum" label="排序" min-width="100"></el-table-column>
      <el-table-column prop="status" label="状态" min-width="100" #default="scope">
        <dict-tag size="small" :options="sys_normal_disable" :value="scope.row.status" />
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" min-width="180" #default="scope">
        <span>{{ parseTime(scope.row.createTime) }}</span>
      </el-table-column>
      <el-table-column label="操作" width="200" #default="scope">
        <el-button type="primary" link @click="handleUpdate(scope.row)" v-hasPermi="['system:dept:edit']">修改</el-button>
        <el-button type="primary" link @click="handleAdd(scope.row)" v-hasPermi="['system:dept:add']">新增</el-button>
        <el-button type="primary" link v-if="scope.row.parentId != 0" @click="handleDelete(scope.row)" v-hasPermi="['system:dept:remove']"
          >删除</el-button
        >
      </el-table-column>
    </el-table>

    <!-- 添加或修改部门对话框 -->
    <el-dialog width="760px" class="ion-dialog" :title="title" v-model="open">
      <el-form ref="form" class="mt-4" label-width="auto" :model="form" :rules="rules">
        <el-form-item v-if="form.parentId !== 0" label="上级部门" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="deptOptions"
            :props="{ value: 'deptId', label: 'deptName', children: 'children' }"
            value-key="deptId"
            placeholder="选择上级部门"
            check-strictly
          />
        </el-form-item>
        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="部门名称" prop="deptName">
            <el-input v-model="form.deptName" placeholder="请输入部门名称" />
          </el-form-item>
          <el-form-item label="显示排序" prop="orderNum">
            <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
          </el-form-item>
          <el-form-item label="负责人" prop="leader">
            <el-input v-model="form.leader" placeholder="请输入负责人" maxlength="20" />
          </el-form-item>
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
          </el-form-item>
          <el-form-item label="部门状态">
            <el-radio-group v-model="form.status">
              <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  import { listDept, getDept, delDept, addDept, updateDept, listDeptExcludeChild } from '@/api/system/dept';

  export default {
    dicts: [''],

    data() {
      return {
        sys_normal_disable: this.$useDict('sys_normal_disable'),
        // 遮罩层
        loading: true,
        // 表格树数据
        deptList: [],
        // 部门树选项
        deptOptions: [],
        // 弹出层标题
        title: '',
        // 是否显示弹出层
        open: false,
        // 查询参数
        queryParams: {
          deptName: undefined,
          status: undefined
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          parentId: [{ required: true, message: '上级部门不能为空', trigger: 'blur' }],
          deptName: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }],
          orderNum: [{ required: true, message: '显示排序不能为空', trigger: 'blur' }],
          email: [
            {
              type: 'email',
              message: '请输入正确的邮箱地址',
              trigger: ['blur', 'change']
            }
          ],
          phone: [
            {
              pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
              message: '请输入正确的手机号码',
              trigger: 'blur'
            }
          ]
        }
      };
    },
    created() {
      this.getList();
    },
    methods: {
      /** 查询部门列表 */
      getList() {
        this.loading = true;
        listDept(this.queryParams).then((response) => {
          this.deptList = this.handleTree(response.data, 'deptId');
          this.loading = false;
        });
      },
      /** 转换部门数据结构 */
      normalizer(node) {
        if (node.children && !node.children.length) {
          delete node.children;
        }
        return {
          id: node.deptId,
          label: node.deptName,
          children: node.children
        };
      },
      // 取消按钮
      cancel() {
        this.open = false;
        this.reset();
      },
      // 表单重置
      reset() {
        this.form = {
          deptId: undefined,
          parentId: undefined,
          deptName: undefined,
          orderNum: undefined,
          leader: undefined,
          phone: undefined,
          email: undefined,
          status: '0'
        };
        this.resetForm('form');
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.getList();
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.resetForm('queryForm');
        this.handleQuery();
      },
      /** 新增按钮操作 */
      handleAdd(row) {
        this.reset();
        if (row != undefined) {
          this.form.parentId = row.deptId;
        }
        this.open = true;
        this.title = '添加部门';
        listDept().then((response) => {
          this.deptOptions = this.handleTree(response.data, 'deptId');
        });
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        getDept(row.deptId).then((response) => {
          this.form = response.data;
          this.open = true;
          this.title = '修改部门';
        });
        listDeptExcludeChild(row.deptId).then((response) => {
          this.deptOptions = this.handleTree(response.data, 'deptId');
        });
      },
      /** 提交按钮 */
      submitForm: function () {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            if (this.form.deptId != undefined) {
              updateDept(this.form).then((response) => {
                this.$message.success('修改成功');
                this.open = false;
                this.getList();
              });
            } else {
              addDept(this.form).then((response) => {
                this.$message.success('新增成功');
                this.open = false;
                this.getList();
              });
            }
          }
        });
      },
      /** 删除按钮操作 */
      handleDelete(row) {
        this.$confirm('是否确认删除名称为"' + row.deptName + '"的数据项？', '删除部门', {
          type: 'warning'
        })
          .then(function () {
            return delDept(row.deptId);
          })
          .then(() => {
            this.getList();
            this.$message.success('删除成功');
          })
          .catch(() => {});
      }
    }
  };
</script>
