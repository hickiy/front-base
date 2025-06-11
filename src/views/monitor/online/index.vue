<template>
  <div class="bg-white flex-1 p-4 m-2.5 flex flex-col overflow-hidden">
    <el-form class="ion-search-area--bg pt-4 pl-4 pr-4" :model="queryParams" ref="queryForm" label-width="68px" :inline="true">
      <el-form-item label="登录地址" prop="ipaddr">
        <el-input v-model="queryParams.ipaddr" placeholder="请输入登录地址" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="用户名称" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <template #append>
        <el-button @click="resetQuery">重置</el-button>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
      </template>
    </el-form>
    <el-table
      height="100%"
      title="在线用户"
      :border="true"
      :set-table="[]"
      v-loading="loading"
      :data="list.slice((pageNum - 1) * pageSize, pageNum * pageSize)"
    >
      <el-table-column label="序号" type="index" #default="scope" width="70">
        <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
      </el-table-column>
      <el-table-column label="会话编号" prop="tokenId" min-width="120" />
      <el-table-column label="登录名称" prop="userName" min-width="120" />
      <el-table-column label="主机" prop="ipaddr" min-width="120" />
      <el-table-column label="登录时间" prop="loginTime" min-width="180" #default="scope">
        <span>{{ parseTime(scope.row.loginTime) }}</span>
      </el-table-column>
      <el-table-column label="操作" #default="scope">
        <el-button type="primary" link @click="handleForceLogout(scope.row)" v-hasPermi="['monitor:online:forceLogout']">强退</el-button>
      </el-table-column>
    </el-table>
    <pagination :total="total" v-model:page="pageNum" v-model:limit="pageSize" />
  </div>
</template>

<script>
  import { list, forceLogout } from '@/api/monitor/online';

  export default {
    name: 'Online',
    data() {
      return {
        // 遮罩层
        loading: true,
        // 总条数
        total: 0,
        // 表格数据
        list: [],
        pageNum: 1,
        pageSize: 20,
        // 查询参数
        queryParams: {
          ipaddr: undefined,
          userName: undefined
        }
      };
    },
    created() {
      this.getList();
    },
    methods: {
      /** 查询登录日志列表 */
      getList() {
        this.loading = true;
        list(this.queryParams)
          .then((response) => {
            this.list = response.rows;
            this.total = response.total;
          })
          .finally(() => {
            this.loading = false;
          });
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.pageNum = 1;
        this.getList();
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.resetForm('queryForm');
        this.handleQuery();
      },
      /** 强退按钮操作 */
      handleForceLogout(row) {
        this.$confirm('是否确认强退名称为"' + row.userName + '"的用户？', '提示', { type: 'warning' })
          .then(function () {
            return forceLogout(row.tokenId);
          })
          .then(() => {
            this.getList();
            this.$message.success('强退成功');
          });
      }
    }
  };
</script>
