<template>
  <!-- 授权用户 -->
  <el-dialog title="选择用户" width="960px" top="8vh" class="ion-dialog" v-model="visible">
    <el-form ref="queryForm" class="mt-4" :model="queryParams" :inline="true">
      <el-form-item label="用户名称" prop="userName">
        <el-input placeholder="请输入用户名称" v-model="queryParams.userName" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="手机号码" prop="phoneNumber">
        <el-input placeholder="请输入手机号码" v-model="queryParams.phoneNumber" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <template #append>
        <el-button @click="resetQuery">重置</el-button>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
      </template>
    </el-form>
    <el-table @row-click="clickRow" ref="table" :data="userList" @selection-change="handleSelectionChange" height="400px">
      <el-table-column type="selection" width="60"></el-table-column>
      <el-table-column label="用户名称" prop="userName" min-width="120" />
      <el-table-column label="用户昵称" prop="nickName" min-width="120" />
      <el-table-column label="邮箱" prop="email" min-width="120" />
      <el-table-column label="手机" prop="phoneNumber" min-width="120" />
      <el-table-column label="状态" prop="status" min-width="120" #default="scope">
        <dict-tag size="small" :options="sys_normal_disable" :value="scope.row.status" />
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" min-width="180" #default="scope">
        <span>{{ parseTime(scope.row.createTime) }}</span>
      </el-table-column>
    </el-table>
    <pagination class="mb-4" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    <template #footer>
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="handleSelectUser">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script>
  import { unallocatedUserList, authUserSelectAll } from '@/api/system/role';
  export default {
    props: {
      // 角色编号
      roleId: {
        type: [Number, String]
      }
    },
    data() {
      return {
        sys_normal_disable: this.$useDict('sys_normal_disable'),
        // 遮罩层
        visible: false,
        // 选中数组值
        userIds: [],
        // 总条数
        total: 0,
        // 未授权用户数据
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
    methods: {
      // 显示弹框
      show() {
        this.queryParams.roleId = this.roleId;
        this.getList();
        this.visible = true;
      },
      clickRow(row) {
        this.$refs.table.toggleRowSelection(row);
      },
      // 多选框选中数据
      handleSelectionChange(selection) {
        this.userIds = selection.map((item) => item.userId);
      },
      // 查询表数据
      getList() {
        unallocatedUserList(this.queryParams).then((res) => {
          this.userList = res.rows;
          this.total = res.total;
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
      /** 选择授权用户操作 */
      handleSelectUser() {
        const roleId = this.queryParams.roleId;
        const userIds = this.userIds.join(',');
        if (userIds == '') {
          this.$message.error('请选择要分配的用户');
          return;
        }
        authUserSelectAll({ roleId: roleId, userIds: userIds }).then((res) => {
          this.$message.success(res.msg);
          if (res.code === 200) {
            this.visible = false;
            this.$emit('ok');
          }
        });
      }
    }
  };
</script>
