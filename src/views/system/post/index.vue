<template>
  <div class="bg-white flex-1 p-4 m-2.5 flex flex-col overflow-hidden">
    <el-form class="ion-search-area--bg pt-4 pl-4 pr-4" ref="queryForm" label-width="68px" :model="queryParams" :inline="true">
      <el-form-item label="岗位编码" prop="postCode">
        <el-input v-model="queryParams.postCode" placeholder="请输入岗位编码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="岗位名称" prop="postName">
        <el-input v-model="queryParams.postName" placeholder="请输入岗位名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="岗位状态" clearable>
          <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <template #append>
        <el-button @click="resetQuery">重置</el-button>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
      </template>
    </el-form>
    <el-table height="100%" title="岗位列表" :set-table="[]" v-loading="loading" :data="postList" :border="true">
      <template #prepend>
        <div class="flex flex-row justify-end">
          <el-button type="primary" size="default" @click="handleAdd" v-hasPermi="['system:post:add']">新增</el-button>
        </div>
      </template>
      <el-table-column label="岗位编号" prop="postId" min-width="100" />
      <el-table-column label="岗位编码" prop="postCode" min-width="100" />
      <el-table-column label="岗位名称" prop="postName" min-width="100" />
      <el-table-column label="岗位排序" prop="postSort" min-width="100" />
      <el-table-column label="状态" prop="status" min-width="100" #default="scope">
        <dict-tag size="small" :options="sys_normal_disable" :value="scope.row.status" />
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" min-width="180" #default="scope">
        <span>{{ parseTime(scope.row.createTime) }}</span>
      </el-table-column>
      <el-table-column label="操作" width="120" #default="scope">
        <el-button type="primary" link @click="handleUpdate(scope.row)" v-hasPermi="['system:post:edit']">修改</el-button>
        <el-button type="primary" link @click="handleDelete(scope.row)" v-hasPermi="['system:post:remove']">删除</el-button>
      </el-table-column>
    </el-table>

    <pagination  :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改岗位对话框 -->
    <el-dialog width="760px" class="ion-dialog" :title="title" v-model="open">
      <el-form ref="form" class="mt-4" label-width="auto" :model="form" :rules="rules">
        <el-form-item label="岗位名称" prop="postName">
          <el-input v-model="form.postName" placeholder="请输入岗位名称" />
        </el-form-item>
        <el-form-item label="岗位编码" prop="postCode">
          <el-input v-model="form.postCode" placeholder="请输入编码名称" />
        </el-form-item>
        <el-form-item label="岗位顺序" prop="postSort">
          <el-input-number v-model="form.postSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="岗位状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  import { listPost, getPost, delPost, addPost, updatePost } from '@/api/system/post';

  export default {
    name: 'Post',
    data() {
      return {
        sys_normal_disable: this.$useDict('sys_normal_disable'),
        // 遮罩层
        loading: true,
        // 总条数
        total: 0,
        // 岗位表格数据
        postList: [],
        // 弹出层标题
        title: '',
        // 是否显示弹出层
        open: false,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 20,
          postCode: undefined,
          postName: undefined,
          status: undefined
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          postName: [{ required: true, message: '岗位名称不能为空', trigger: 'blur' }],
          postCode: [{ required: true, message: '岗位编码不能为空', trigger: 'blur' }],
          postSort: [{ required: true, message: '岗位顺序不能为空', trigger: 'blur' }]
        }
      };
    },
    created() {
      this.getList();
    },
    methods: {
      /** 查询岗位列表 */
      getList() {
        this.loading = true;
        listPost(this.queryParams).then((response) => {
          this.postList = response.rows;
          this.total = response.total;
          this.loading = false;
        });
      },
      // 取消按钮
      cancel() {
        this.open = false;
        this.reset();
      },
      // 表单重置
      reset() {
        this.form = {
          postId: undefined,
          postCode: undefined,
          postName: undefined,
          postSort: 0,
          status: '0',
          remark: undefined
        };
        this.resetForm('form');
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.queryParams.pageNum = 1;
        this.getList();
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.resetForm('queryForm');
        this.handleQuery();
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.reset();
        this.open = true;
        this.title = '添加岗位';
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        const postId = row.postId || this.ids;
        getPost(postId).then((response) => {
          this.form = response.data;
          this.open = true;
          this.title = '修改岗位';
        });
      },
      /** 提交按钮 */
      submitForm: function () {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            if (this.form.postId != undefined) {
              updatePost(this.form).then((response) => {
                this.$message.success('修改成功');
                this.open = false;
                this.getList();
              });
            } else {
              addPost(this.form).then((response) => {
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
        const postIds = row.postId || this.ids;
        this.$confirm('是否确认删除岗位编号为"' + postIds + '"的数据项？', '删除岗位', {
          type: 'warning'
        })
          .then(function () {
            return delPost(postIds);
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
