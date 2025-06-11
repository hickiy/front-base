<template>
  <div class="bg-white flex-1 p-4 m-2.5 flex flex-col overflow-hidden">
    <el-form class="ion-search-area--bg pt-4 pl-4 pr-4" ref="queryForm" label-width="68px" :model="queryParams" :inline="true">
      <el-form-item label="字典名称" prop="dictName">
        <el-input v-model="queryParams.dictName" placeholder="请输入字典名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="字典类型" prop="dictType">
        <el-input v-model="queryParams.dictType" placeholder="请输入字典类型" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="字典状态" clearable>
          <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRange"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <template #append>
        <el-button @click="resetQuery">重置</el-button>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
      </template>
    </el-form>
    <el-table height="100%" title="字典列表" :set-table="[]" v-loading="loading" :data="typeList" :border="true">
      <template #prepend>
        <div class="flex flex-row justify-end">
          <el-button type="primary" size="default" @click="handleRefreshCache" v-hasPermi="['system:dict:remove']">刷新缓存</el-button>
          <el-button type="primary" size="default" @click="handleAdd" v-hasPermi="['system:dict:add']">新增</el-button>
        </div>
      </template>
      <el-table-column label="字典编号" prop="dictId" min-width="120" />
      <el-table-column label="字典名称" prop="dictName" min-width="120" />
      <el-table-column label="字典类型" #default="scope" min-width="120">
        <router-link :to="'/system/dict/data/' + scope.row.dictId">
          <el-button type="primary" link>{{ scope.row.dictType }}</el-button>
        </router-link>
      </el-table-column>
      <el-table-column label="状态" prop="status" min-width="120" #default="scope">
        <dict-tag size="small" :options="sys_normal_disable" :value="scope.row.status" />
      </el-table-column>
      <el-table-column label="备注" prop="remark" min-width="160" />
      <el-table-column label="创建时间" prop="createTime" min-width="180" #default="scope">
        <span>{{ parseTime(scope.row.createTime) }}</span>
      </el-table-column>
      <el-table-column label="操作" width="140" #default="scope">
        <el-button type="primary" link @click="handleUpdate(scope.row)" v-hasPermi="['system:dict:edit']">修改</el-button>
        <el-button type="primary" link @click="handleDelete(scope.row)" v-hasPermi="['system:dict:remove']">删除</el-button>
      </el-table-column>
    </el-table>

    <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog width="760px" class="ion-dialog" :title="title" v-model="open">
      <el-form ref="form" label-width="80px" class="mt-4" :model="form" :rules="rules">
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="form.dictName" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典类型" prop="dictType">
          <el-input v-model="form.dictType" placeholder="请输入字典类型" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
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
  import { listType, getType, delType, addType, updateType, refreshCache } from '@/api/system/dict/type';

  export default {
    name: 'Dict',
    data() {
      return {
        sys_normal_disable: this.$useDict('sys_normal_disable'),
        // 遮罩层
        loading: true,
        // 总条数
        total: 0,
        // 字典表格数据
        typeList: [],
        // 弹出层标题
        title: '',
        // 是否显示弹出层
        open: false,
        // 日期范围
        dateRange: [],
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 20,
          dictName: undefined,
          dictType: undefined,
          status: undefined
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          dictName: [{ required: true, message: '字典名称不能为空', trigger: 'blur' }],
          dictType: [{ required: true, message: '字典类型不能为空', trigger: 'blur' }]
        }
      };
    },
    created() {
      this.getList();
    },
    methods: {
      /** 查询字典类型列表 */
      getList() {
        this.loading = true;
        listType(this.addDateRange(this.queryParams, this.dateRange)).then((response) => {
          this.typeList = response.rows;
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
          dictId: undefined,
          dictName: undefined,
          dictType: undefined,
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
        this.dateRange = [];
        this.resetForm('queryForm');
        this.handleQuery();
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.reset();
        this.open = true;
        this.title = '添加字典类型';
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        const dictId = row.dictId || this.ids;
        getType(dictId).then((response) => {
          this.form = response.data;
          this.open = true;
          this.title = '修改字典类型';
        });
      },
      /** 提交按钮 */
      submitForm: function () {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            if (this.form.dictId != undefined) {
              updateType(this.form).then((response) => {
                this.$message.success('修改成功');
                this.open = false;
                this.getList();
              });
            } else {
              addType(this.form).then((response) => {
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
        const dictIds = row.dictId || this.ids;
        this.$confirm('是否确认删除字典编号为"' + dictIds + '"的数据项？', '提示', {
          type: 'warning'
        })
          .then(function () {
            return delType(dictIds);
          })
          .then(() => {
            this.getList();
            this.$message.success('删除成功');
          })
          .catch(() => {});
      },
      /** 刷新缓存按钮操作 */
      handleRefreshCache() {
        refreshCache().then(() => {
          this.$message.success('刷新成功');
        });
      }
    }
  };
</script>
