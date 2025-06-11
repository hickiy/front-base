<template>
  <div class="bg-white flex-1 p-4 m-2.5 flex flex-rwo gap-x-5 overflow-hidden">
    <!--部门数据-->
    <div class="w-60">
      <el-tree
        :data="deptOptions"
        :props="defaultProps"
        :expand-on-click-node="false"
        :filter-node-method="filterNode"
        ref="tree"
        default-expand-all
        highlight-current
        @node-click="handleNodeClick"
      />
    </div>
    <!--用户数据-->
    <div class="flex flex-col overflow-hidden flex-1">
      <el-form class="ion-search-area--bg pt-4 pl-4 pr-4" :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
        <el-form-item label="输入搜索" prop="phoneNumber">
          <el-input v-model="queryParams.phoneNumber" placeholder="请输入工号、姓名或手机号" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="用户状态" clearable>
            <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <template #append>
          <el-button @click="resetQuery">重置</el-button>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
        </template>
      </el-form>
      <el-table title="用户列表" row-class-name="setup_center" v-loading="loading" :data="userList" :set-table="[]" :border="true" height="100%">
        <template #prepend>
          <div class="flex justify-end">
            <el-button size="default" @click="handleExport" v-hasPermi="['system:user:export']">导出</el-button>
            <el-button type="primary" size="default" @click="handleAdd" v-hasPermi="['system:user:add']">新增</el-button>
          </div>
        </template>
        <el-table-column label="用户编号" prop="userId" min-width="100" />
        <el-table-column label="用户账号" prop="userName" min-width="140" />
        <el-table-column label="用户姓名" prop="nickName" min-width="140" />
        <el-table-column label="部门" prop="dept.deptName" min-width="180" />
        <el-table-column label="手机号码" prop="phoneNumber" min-width="140" />
        <el-table-column label="状态" #default="scope" min-width="100">
          <el-switch
            v-model="scope.row.status"
            size="default"
            active-value="0"
            inactive-value="1"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="180" #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" #default="scope">
          <div class="flex flex-row items-center" v-if="scope.row.userId !== 1">
            <el-button type="primary" link @click="handleUpdate(scope.row)" v-hasPermi="['system:user:edit']">修改</el-button>
            <el-button type="primary" link @click="handleDelete(scope.row)" v-hasPermi="['system:user:remove']">删除</el-button>
            <el-dropdown
              size="default"
              @command="(command) => handleCommand(command, scope.row)"
              v-hasPermi="['system:user:resetPwd', 'system:user:edit']"
            >
              <el-button class="ml-1" type="primary" link> 更多 </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <span v-hasPermi="['system:user:resetPwd']">
                    <el-dropdown-item command="handleResetPwd">重置密码</el-dropdown-item>
                  </span>
                  <span v-hasPermi="['system:user:edit']">
                    <el-dropdown-item command="handleAuthRole">分配角色</el-dropdown-item>
                  </span>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-table-column>
      </el-table>
      <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </div>
    <!-- 添加或修改用户配置对话框 -->
    <el-dialog class="ion-dialog" :title="title" v-model="open" width="960px">
      <el-form class="grid grid-cols-2 gap-x-2 mt-4" ref="form" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="用户姓名" prop="nickName">
          <el-input v-model="form.nickName" placeholder="请输入用户姓名" maxlength="30" />
        </el-form-item>
        <el-form-item label="归属部门" prop="deptId">
          <el-tree-select
            v-model="form.deptId"
            :data="deptOptions"
            :props="{ value: 'id', label: 'label', children: 'children' }"
            value-key="id"
            placeholder="请选择归属部门"
            check-strictly
          />
        </el-form-item>
        <el-form-item label="手机号码" prop="phoneNumber">
          <el-input v-model.trim="form.phoneNumber" placeholder="请输入手机号码" maxlength="11" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
        </el-form-item>
        <el-form-item v-if="form.userId == undefined" label="用户账号" prop="userName">
          <el-input v-model.trim="form.userName" placeholder="请输入用户账号" maxlength="30" />
        </el-form-item>
        <el-form-item v-if="form.userId == undefined" label="用户密码" prop="password">
          <el-input v-model="form.password" placeholder="请输入用户密码" type="password" maxlength="20" show-password />
        </el-form-item>
        <el-form-item label="用户性别">
          <el-select v-model="form.sex" placeholder="请选择性别">
            <el-option v-for="dict in sys_user_sex" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="工号" prop="jobNumber">
          <el-input v-model="form.jobNumber" placeholder="请输入工号"></el-input>
        </el-form-item>
        <el-form-item label="岗位">
          <el-select v-model="form.postIds" multiple placeholder="请选择岗位">
            <el-option
              v-for="item in postOptions"
              :key="item.postId"
              :label="item.postName"
              :value="item.postId"
              :disabled="item.status == 1"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.roleIds" multiple placeholder="请选择角色">
            <el-option
              v-for="item in roleOptions"
              :key="item.roleId"
              :label="item.roleName"
              :value="item.roleId"
              :disabled="item.status == 1"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="入职日期" prop="entryDate">
          <el-date-picker v-model="form.entryDate" value-format="YYYY-MM-DD" type="date" :picker-options="optionsDisable"></el-date-picker>
        </el-form-item>
        <el-form-item label="备注">
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
  import { listUser, getUser, delUser, addUser, updateUser, resetUserPwd, changeUserStatus } from '@/api/system/user';
  import { treeselect } from '@/api/system/dept';

  export default {
    name: 'User',
    data() {
      return {
        sys_normal_disable: this.$useDict('sys_normal_disable'),
        sys_user_sex: this.$useDict('sys_user_sex'),
        optionsDisable: {
          disabledDate(time) {
            return time.getTime() > Date.now();
          }
        },
        // 遮罩层
        loading: true,
        // 总条数
        total: 0,
        // 用户表格数据
        userList: null,
        // 弹出层标题
        title: '',
        // 部门树选项
        deptOptions: undefined,
        // 是否显示弹出层
        open: false,
        // 部门名称
        deptName: undefined,
        // 默认密码
        initPassword: undefined,
        // 日期范围
        dateRange: [],
        // 岗位选项
        postOptions: [],
        // 角色选项
        roleOptions: [],
        // 表单参数
        form: {},
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 20,
          userName: undefined,
          phoneNumber: undefined,
          status: undefined,
          deptId: undefined
        },
        // 表单校验
        rules: {
          userName: [
            { required: true, message: '用户名称不能为空', trigger: 'blur' },
            { min: 2, max: 20, message: '用户名称长度必须介于 2 和 20 之间', trigger: 'blur' }
          ],
          nickName: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
          password: [
            { required: true, message: '用户密码不能为空', trigger: 'blur' },
            { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间', trigger: 'blur' }
          ],
          email: [
            {
              type: 'email',
              message: '请输入正确的邮箱地址',
              trigger: ['blur', 'change']
            }
          ],
          phoneNumber: [
            { required: true, message: '请输入用户手机号', trigger: 'blur' },
            {
              pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
              message: '请输入正确的手机号码',
              trigger: 'blur'
            }
          ],
          jobNumber: [
            {
              required: true,
              message: '请输入用户工号',
              trigger: 'blur'
            },
            {
              pattern: /^\d{6}$/,
              message: '请输入正确的工号',
              trigger: 'blur'
            }
          ],
          entryDate: [
            {
              required: true,
              message: '请选择入职日期',
              trigger: 'blur'
            }
          ]
        }
      };
    },
    watch: {
      // 根据名称筛选部门树
      deptName(val) {
        this.$refs.tree.filter(val);
      }
    },
    created() {
      this.getList();
      this.getTreeselect();
      this.$getConfigKey('sys.user.initPassword').then((response) => {
        this.initPassword = response.msg;
      });
    },
    methods: {
      /** 查询用户列表 */
      getList() {
        this.loading = true;
        listUser(this.addDateRange(this.queryParams, this.dateRange)).then((response) => {
          this.userList = response.rows;
          this.total = response.total;
          this.loading = false;
        });
      },
      /** 查询部门下拉树结构 */
      getTreeselect() {
        treeselect().then((response) => {
          this.deptOptions = response.data;
        });
      },
      // 筛选节点
      filterNode(value, data) {
        if (!value) return true;
        return data.label.indexOf(value) !== -1;
      },
      // 节点单击事件
      handleNodeClick(data) {
        this.queryParams.deptId = data.id;
        this.handleQuery();
      },
      // 用户状态修改
      handleStatusChange(row) {
        let text = row.status === '0' ? '启用' : '停用';
        this.$confirm('确认要"' + text + '""' + row.userName + '"用户吗？')
          .then(function () {
            return changeUserStatus(row.userId, row.accountId, row.status);
          })
          .then(() => {
            this.$message.success(text + '成功');
          })
          .catch(function () {
            row.status = row.status === '0' ? '1' : '0';
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
          userId: undefined,
          deptId: undefined,
          userName: undefined,
          nickName: undefined,
          password: undefined,
          phoneNumber: undefined,
          email: undefined,
          sex: undefined,
          status: '0',
          jobNumber: undefined,
          entryDate: undefined,
          remark: undefined,
          postIds: [],
          roleIds: []
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
      // 更多操作触发
      handleCommand(command, row) {
        switch (command) {
          case 'handleResetPwd':
            this.handleResetPwd(row);
            break;
          case 'handleAuthRole':
            this.handleAuthRole(row);
            break;
          default:
            break;
        }
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.reset();
        this.getTreeselect();
        getUser().then((response) => {
          this.postOptions = response.posts;
          this.roleOptions = response.roles;
          this.open = true;
          this.title = '添加用户';
          this.form.password = this.initPassword;
        });
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        this.getTreeselect();
        const userId = row.userId || this.ids;
        getUser(userId).then((response) => {
          this.form = response.data;
          this.postOptions = response.posts;
          this.roleOptions = response.roles;
          this.form.postIds = response.postIds;
          this.form.roleIds = response.roleIds;
          this.open = true;
          this.title = '修改用户';
          this.form.password = '';
        });
      },
      /** 重置密码按钮操作 */
      handleResetPwd(row) {
        this.$prompt('请输入"' + row.userName + '"的新密码', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          closeOnClickModal: false,
          inputPattern: /^.{5,20}$/,
          inputErrorMessage: '用户密码长度必须介于 5 和 20 之间'
        })
          .then(({ value }) => {
            resetUserPwd(row.userId, row.accountId, value).then((response) => {
              this.$message.success('修改成功，新密码是：' + value);
            });
          })
          .catch(() => {});
      },
      /** 分配角色操作 */
      handleAuthRole: function (row) {
        const userId = row.userId;
        this.$router.push('/system/user/authRole/' + userId);
      },
      /** 提交按钮 */
      submitForm: function () {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            if (this.form.userId != undefined) {
              updateUser(this.form).then((response) => {
                this.$message.success('修改成功');
                this.open = false;
                this.getList();
              });
            } else {
              addUser(this.form).then((response) => {
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
        const userIds = row.userId || this.ids;
        this.$confirm('是否确认删除用户编号为"' + userIds + '"的数据项？')
          .then(function () {
            return delUser(userIds);
          })
          .then(() => {
            this.getList();
            this.$message.success('删除成功');
          })
          .catch(() => {});
      },
      /** 导出按钮操作 */
      handleExport() {
        this.$download('system/user/export', {
          method: 'post',
          params: this.queryParams,
          fileName: `user_${new Date().getTime()}.xlsx`
        });
      }
    }
  };
</script>
