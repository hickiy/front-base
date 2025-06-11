<template>
  <div class="bg-white flex-1 p-4 m-2.5 flex flex-col overflow-hidden">
    <el-form class="ion-search-area--bg pt-4 pl-4 pr-4" ref="form" :inline="true" :model="form" label-width="80px">
      <el-form-item label="用户昵称" prop="nickName">
        <el-input v-model="form.nickName" disabled />
      </el-form-item>
      <el-form-item label="登录账号" prop="userName">
        <el-input v-model="form.userName" disabled />
      </el-form-item>
    </el-form>

    <el-table
      ref="table"
      title="角色列表"
      height="100%"
      :border="true"
      :set-table="[]"
      v-loading="loading"
      :row-key="getRowKey"
      @row-click="clickRow"
      @selection-change="handleSelectionChange"
      :data="roles.slice((pageNum - 1) * pageSize, pageNum * pageSize)"
    >
      <template #prepend>
        <div class="flex flex-row justify-end items-center">
          <el-button type="primary" size="default" @click="submitForm()">提交</el-button>
        </div>
      </template>
      <el-table-column type="selection" width="60" :reserve-selection="true"></el-table-column>
      <el-table-column label="序号" type="index" width="70" #default="scope">
        <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
      </el-table-column>
      <el-table-column label="角色编号" prop="roleId" min-width="120" />
      <el-table-column label="角色名称" prop="roleName" min-width="120" />
      <el-table-column label="权限字符" prop="roleKey" min-width="120" />
      <el-table-column label="创建时间" prop="createTime" min-width="180" #default="scope">
        <span>{{ parseTime(scope.row.createTime) }}</span>
      </el-table-column>
    </el-table>
    <pagination :total="total" v-model:page="pageNum" v-model:limit="pageSize" />
  </div>
</template>

<script>
  import { getAuthRole, updateAuthRole } from '@/api/system/user';

  export default {
    name: 'AuthRole',
    data() {
      return {
        // 遮罩层
        loading: true,
        // 分页信息
        total: 0,
        pageNum: 1,
        pageSize: 20,
        // 选中角色编号
        roleIds: [],
        // 角色信息
        roles: [],
        // 用户信息
        form: {}
      };
    },
    created() {
      const userId = this.$route.params && this.$route.params.userId;
      if (userId) {
        this.loading = true;
        getAuthRole(userId).then((response) => {
          this.form = response.user;
          this.roles = response.roles;
          this.total = this.roles.length;
          this.$nextTick(() => {
            this.roles.forEach((row) => {
              if (row.flag) {
                this.$refs.table.toggleRowSelection(row);
              }
            });
          });
          this.loading = false;
        });
      }
    },
    methods: {
      /** 单击选中行数据 */
      clickRow(row) {
        this.$refs.table.toggleRowSelection(row);
      },
      // 多选框选中数据
      handleSelectionChange(selection) {
        this.roleIds = selection.map((item) => item.roleId);
      },
      // 保存选中的数据编号
      getRowKey(row) {
        return row.roleId;
      },
      /** 提交按钮 */
      submitForm() {
        const userId = this.form.userId;
        const roleIds = this.roleIds.join(',');
        updateAuthRole({ userId: userId, roleIds: roleIds }).then((response) => {
          this.$message.success('授权成功');
        });
      }
    }
  };
</script>
