<template>
  <div class="bg-white flex-1 p-4 m-2.5 flex flex-col overflow-hidden">
    <el-form class="ion-search-area--bg pt-4 pl-4 pr-4" ref="queryForm" label-width="68px" :model="queryParams" :inline="true">
      <el-form-item label="公告标题" prop="noticeTitle">
        <el-input v-model="queryParams.noticeTitle" placeholder="请输入公告标题" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="操作人员" prop="createBy">
        <el-input v-model="queryParams.createBy" placeholder="请输入操作人员" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="类型" prop="noticeType">
        <el-select v-model="queryParams.noticeType" placeholder="公告类型" clearable>
          <el-option v-for="dict in sys_notice_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <template #append>
        <el-button @click="resetQuery">重置</el-button>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
      </template>
    </el-form>
    <el-table height="100%" title="通知列表" :set-table="[]" v-loading="loading" :data="noticeList" :border="true">
      <template #prepend>
        <div class="flex flex-row justify-end">
          <el-button type="primary" size="default" @click="handleAdd" v-hasPermi="['system:notice:add']">新增</el-button>
        </div>
      </template>
      <el-table-column label="序号" prop="noticeId" width="70" />
      <el-table-column label="公告标题" prop="noticeTitle" min-widht="120" />
      <el-table-column label="公告类型" prop="noticeType" min-widht="120" #default="scope">
        <dict-tag :options="sys_notice_type" :value="scope.row.noticeType" />
      </el-table-column>
      <el-table-column label="状态" prop="status" min-widht="120" #default="scope">
        <dict-tag :options="sys_notice_status" :value="scope.row.status" />
      </el-table-column>
      <el-table-column label="创建者" prop="createBy" min-widht="120" />
      <el-table-column label="创建时间" prop="createTime" min-widht="180" #default="scope">
        <span>{{ parseTime(scope.row.createTime, 'YYYY-MM-DD') }}</span>
      </el-table-column>
      <el-table-column label="操作" #default="scope" widht="120">
        <el-button type="primary" link @click="handleUpdate(scope.row)" v-hasPermi="['system:notice:edit']">修改</el-button>
        <el-button type="primary" link @click="handleDelete(scope.row)" v-hasPermi="['system:notice:remove']">删除</el-button>
      </el-table-column>
    </el-table>

    <pagination  :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改公告对话框 -->
    <el-dialog width="760px" class="ion-dialog" :title="title" v-model="open">
      <el-form ref="form" label-width="80px" class="mt-4" :model="form" :rules="rules">
        <el-form-item label="公告标题" prop="noticeTitle">
          <el-input v-model="form.noticeTitle" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="公告类型" prop="noticeType">
          <el-select v-model="form.noticeType" placeholder="请选择公告类型">
            <el-option v-for="dict in sys_notice_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_notice_status" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="内容">
          <editor v-model="form.noticeContent" :min-height="192" />
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
  import { listNotice, getNotice, delNotice, addNotice, updateNotice } from '@/api/system/notice';

  export default {
    name: 'Notice',
    data() {
      return {
        sys_notice_status: this.$useDict('sys_notice_status'),
        sys_notice_type: this.$useDict('sys_notice_type'),
        // 遮罩层
        loading: true,
        // 显示搜索条件
        showSearch: true,
        // 总条数
        total: 0,
        // 公告表格数据
        noticeList: [],
        // 弹出层标题
        title: '',
        // 是否显示弹出层
        open: false,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 20,
          noticeTitle: undefined,
          createBy: undefined,
          status: undefined
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          noticeTitle: [{ required: true, message: '公告标题不能为空', trigger: 'blur' }],
          noticeType: [{ required: true, message: '公告类型不能为空', trigger: 'change' }]
        }
      };
    },
    created() {
      this.getList();
    },
    methods: {
      /** 查询公告列表 */
      getList() {
        this.loading = true;
        listNotice(this.queryParams).then((response) => {
          this.noticeList = response.rows;
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
          noticeId: undefined,
          noticeTitle: undefined,
          noticeType: undefined,
          noticeContent: undefined,
          status: '0'
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
        this.title = '添加公告';
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        const noticeId = row.noticeId || this.ids;
        getNotice(noticeId).then((response) => {
          this.form = response.data;
          this.open = true;
          this.title = '修改公告';
        });
      },
      /** 提交按钮 */
      submitForm: function () {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            if (this.form.noticeId != undefined) {
              updateNotice(this.form).then((response) => {
                this.$message.success('修改成功');
                this.open = false;
                this.getList();
              });
            } else {
              addNotice(this.form).then((response) => {
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
        const noticeIds = row.noticeId || this.ids;
        this.$confirm('是否确认删除公告编号为"' + noticeIds + '"的数据项？', '提示', { type: 'warning' })
          .then(function () {
            return delNotice(noticeIds);
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
