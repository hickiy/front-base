<template>
  <div class="bg-white flex-1 p-4 m-2.5 flex flex-col overflow-hidden">
    <el-form class="ion-search-area--bg pt-4 pl-4 pr-4" ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="用户名称" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="手机号码" prop="phoneNumber">
        <el-input v-model="queryParams.phoneNumber" placeholder="请输入手机号码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <template #append>
        <el-button @click="resetQuery">重置</el-button>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
      </template>
    </el-form>

    <el-table title="用户列表" height="100%" :border="true" :set-table="[]" v-loading="loading" :data="userList">
      <template #prepend>
        <div class="flex flex-row justify-end items-center">
          <el-button type="primary" size="default" @click="openSelectUser" v-hasPermi="['system:role:add']">添加用户</el-button>
        </div>
      </template>
      <el-table-column label="用户名称" prop="userName" min-width="120" />
      <el-table-column label="用户昵称" prop="nickName" min-width="120" />
      <el-table-column label="邮箱" prop="email" min-width="120" />
      <el-table-column label="手机" prop="phoneNumber" min-width="120" />
      <el-table-column label="状态" prop="status" min-width="100" #default="scope">
        <dict-tag size="default" :options="sys_normal_disable" :value="scope.row.status" />
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" min-width="180" #default="scope">
        <span>{{ parseTime(scope.row.createTime) }}</span>
      </el-table-column>
      <el-table-column label="操作" #default="scope" width="120">
        <el-button type="primary" link @click="cancelAuthUser(scope.row)" v-hasPermi="['system:role:remove']">取消授权</el-button>
      </el-table-column>
    </el-table>

    <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    <select-user ref="select" :roleId="queryParams.roleId" @ok="handleQuery" />
  </div>
</template>

<script>
  import { allocatedUserList, authUserCancel } from '@/api/system/role';
  import selectUser from './selectUser';

  export default {
    name: 'AuthUser',
    dicts: [''],
    components: { selectUser },
    data() {
      return {
        sys_normal_disable: this.$useDict('sys_normal_disable'),
        // 遮罩层
        loading: true,
        // 总条数
        total: 0,
        // 用户表格数据
        userList: [],
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 20,
          roleId: undefined,
          userName: undefined,
          phoneNumber: undefined
        }
      };
    },
    created() {
      const roleId = this.$route.params && this.$route.params.roleId;
      if (roleId) {
        this.queryParams.roleId = roleId;
        this.getList();
      }
    },
    methods: {
      /** 查询授权用户列表 */
      getList() {
        this.loading = true;
        allocatedUserList(this.queryParams).then((response) => {
          this.userList = response.rows;
          this.total = response.total;
          this.loading = false;
        });
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
      /** 打开授权用户表弹窗 */
      openSelectUser() {
        this.$refs.select.show();
      },
      /** 取消授权按钮操作 */
      cancelAuthUser(row) {
        const roleId = this.queryParams.roleId;
        this.$confirm('确认要取消该用户"' + row.userName + '"角色吗？', '提示', { type: 'warning' })
          .then(function () {
            return authUserCancel({ userId: row.userId, roleId: roleId });
          })
          .then(() => {
            this.getList();
            this.$message.success('取消授权成功');
          })
          .catch(() => {});
      }
    }
  };
</script>
