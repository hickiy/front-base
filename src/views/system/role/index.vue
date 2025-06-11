<template>
  <div class="bg-white flex-1 p-4 m-2.5 flex flex-col overflow-hidden">
    <el-form class="ion-search-area--bg pt-4 pl-4 pr-4" ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="queryParams.roleName" placeholder="请输入角色名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="权限字符" prop="roleKey">
        <el-input v-model="queryParams.roleKey" placeholder="请输入权限字符" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="角色状态" clearable>
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

    <el-table title="角色列表" height="100%" row-class-name="setup_center" :border="true" :set-table="[]" v-loading="loading" :data="roleList">
      <template #prepend>
        <div class="flex flex-row justify-end items-center">
          <el-button size="default" @click="handleExport" v-hasPermi="['system:role:export']">导出</el-button>
          <el-button type="primary" size="default" @click="handleAdd" v-hasPermi="['system:role:add']">新增</el-button>
        </div>
      </template>
      <el-table-column type="selection" width="55" />
      <el-table-column label="角色编号" prop="roleId" min-width="120" />
      <el-table-column label="角色名称" prop="roleName" min-width="150" />
      <el-table-column label="权限字符" prop="roleKey" min-width="150" />
      <el-table-column label="显示顺序" prop="roleSort" min-width="100" />
      <el-table-column label="状态" min-width="100" #default="scope">
        <el-switch size="default" v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" min-width="180" #default="scope">
        <span>{{ parseTime(scope.row.createTime) }}</span>
      </el-table-column>
      <el-table-column label="操作" width="180" #default="scope">
        <div class="flex flex-row items-center" v-if="scope.row.roleId !== 1">
          <el-button type="primary" link @click="handleUpdate(scope.row)" v-hasPermi="['system:role:edit']">修改</el-button>
          <el-button type="primary" link @click="handleDelete(scope.row)" v-hasPermi="['system:role:remove']">删除</el-button>
          <el-dropdown size="default" @command="(command) => handleCommand(command, scope.row)" v-hasPermi="['system:role:edit']">
            <el-button type="primary" link>更多</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <span v-hasPermi="['system:role:edit']">
                  <el-dropdown-item command="handleDataScope">数据权限</el-dropdown-item>
                </span>
                <span v-hasPermi="['system:role:edit']">
                  <el-dropdown-item command="handleAuthUser">分配用户</el-dropdown-item>
                </span>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-table-column>
    </el-table>

    <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog width="760px" top="10vh" class="ion-dialog" :title="title" v-model="open">
      <el-form ref="form" class="mt-4" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item prop="roleKey">
          <template #label>
            <span>
              <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)" placement="top">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
              权限字符
            </span>
          </template>
          <el-input v-model="form.roleKey" placeholder="请输入权限字符" />
        </el-form-item>
        <el-form-item label="角色顺序" prop="roleSort">
          <el-input-number class="w-full" v-model="form.roleSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">展开/折叠</el-checkbox>
          <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">全选/全不选</el-checkbox>
          <el-checkbox v-model="form.menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">父子联动</el-checkbox>
          <div class="w-full h-50 overflow-auto">
            <el-tree
              class="tree-border"
              :data="menuOptions"
              show-checkbox
              ref="menu"
              node-key="id"
              :check-strictly="!form.menuCheckStrictly"
              empty-text="加载中，请稍候"
              :props="defaultProps"
            ></el-tree>
          </div>
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
  import { listRole, getRole, delRole, addRole, updateRole, dataScope, changeRoleStatus } from '@/api/system/role';
  import { listModule } from '@/api/system/module';
  import { treeselect as menuTreeselect, roleMenuTreeselect } from '@/api/system/menu';
  import { roleDeptTreeselect } from '@/api/system/dept';

  export default {
    name: 'Role',
    data() {
      return {
        sys_normal_disable: this.$useDict('sys_normal_disable'), // 状态
        // 遮罩层
        loading: true,
        // 总条数
        total: 0,
        // 角色表格数据
        roleList: [],
        // 弹出层标题
        title: '',
        // 是否显示弹出层
        open: false,
        // 是否显示弹出层（数据权限）
        openDataScope: false,
        menuExpand: false,
        menuNodeAll: false,
        deptExpand: true,
        deptNodeAll: false,
        // 日期范围
        dateRange: [],
        // 数据范围选项
        dataScopeOptions: [
          {
            value: '1',
            label: '全部数据权限'
          },
          {
            value: '2',
            label: '自定数据权限'
          },
          {
            value: '3',
            label: '本部门数据权限'
          },
          {
            value: '4',
            label: '本部门及以下数据权限'
          },
          {
            value: '5',
            label: '仅本人数据权限'
          }
        ],
        // 菜单列表
        menuOptions: [],
        // 部门列表
        deptOptions: [],
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 20,
          roleName: undefined,
          roleKey: undefined,
          status: undefined
        },
        moduleQueryParams: {
          pageNum: 1,
          pageSize: 100
        },
        // 表单参数
        form: {},
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        // 表单校验
        rules: {
          roleName: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
          roleKey: [{ required: true, message: '权限字符不能为空', trigger: 'blur' }],
          roleSort: [{ required: true, message: '角色顺序不能为空', trigger: 'blur' }]
        },
        menuList: [],
        moduleList: []
      };
    },
    created() {
      this.getList();
    },
    methods: {
      /** 查询角色列表 */
      getList() {
        this.loading = true;
        listRole(this.addDateRange(this.queryParams, this.dateRange)).then((response) => {
          this.roleList = response.rows;
          this.total = response.total;
          this.loading = false;
        });
      },
      /** 查询菜单树结构 */
      getMenuTreeselect() {
        return Promise.all([menuTreeselect(this.moduleQueryParams), listModule(this.moduleQueryParams)])
          .then(([resOfMenu, resOfModule]) => {
            this.menuList = resOfMenu.data;
            this.moduleList = resOfModule.rows;
            this.menuOptions = this.moduleList.map((module) => {
              const children = this.menuList.filter((menu) => menu.moduleId == module.moduleId);
              return {
                ...module,
                id: module.moduleId + '-' + module.moduleId, // 此处为了避免树中 模块id与菜单id重复， 模块id采用拼接形式避免重复
                label: module.moduleName,
                children,
                hasChildren: children && !!children.length
              };
            });
            return this.menuOptions;
          })
          .catch((err) => {
            console.error(err);
          });
      },
      // 所有菜单节点数据
      getMenuAllCheckedKeys() {
        // 目前被选中的菜单节点
        let checkedKeys = this.$refs.menu.getCheckedKeys();
        // 半选中的菜单节点
        let halfCheckedKeys = this.$refs.menu.getHalfCheckedKeys();
        checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
        return checkedKeys;
      },
      // 所有部门节点数据
      getDeptAllCheckedKeys() {
        // 目前被选中的部门节点
        let checkedKeys = this.$refs.dept.getCheckedKeys();
        // 半选中的部门节点
        let halfCheckedKeys = this.$refs.dept.getHalfCheckedKeys();
        checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
        return checkedKeys;
      },
      /** 根据角色ID查询部门树结构 */
      getRoleDeptTreeselect(roleId) {
        return roleDeptTreeselect(roleId).then((response) => {
          this.deptOptions = response.depts;
          return response;
        });
      },
      // 角色状态修改
      handleStatusChange(row) {
        let text = row.status === '0' ? '启用' : '停用';
        this.$confirm('确认要"' + text + '""' + row.roleName + '"角色吗？')
          .then(function () {
            return changeRoleStatus(row.roleId, row.status);
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
        if (this.$refs.menu != undefined) {
          this.$refs.menu.setCheckedKeys([]);
        }
        (this.menuExpand = false),
          (this.menuNodeAll = false),
          (this.deptExpand = true),
          (this.deptNodeAll = false),
          (this.form = {
            roleId: undefined,
            roleName: undefined,
            roleKey: undefined,
            roleSort: 0,
            status: '0',
            menuIds: [],
            moduleIds: [],
            deptIds: [],
            menuCheckStrictly: true,
            deptCheckStrictly: true,
            remark: undefined
          });
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
          case 'handleDataScope':
            this.handleDataScope(row);
            break;
          case 'handleAuthUser':
            this.handleAuthUser(row);
            break;
          default:
            break;
        }
      },
      // 树权限（展开/折叠）
      handleCheckedTreeExpand(value, type) {
        if (type == 'menu') {
          let treeList = this.menuOptions;
          for (let i = 0; i < treeList.length; i++) {
            this.$refs.menu.store.nodesMap[treeList[i].id].expanded = value;
          }
        } else if (type == 'dept') {
          let treeList = this.deptOptions;
          for (let i = 0; i < treeList.length; i++) {
            this.$refs.dept.store.nodesMap[treeList[i].id].expanded = value;
          }
        }
      },
      // 树权限（全选/全不选）
      handleCheckedTreeNodeAll(value, type) {
        if (type == 'menu') {
          this.$refs.menu.setCheckedNodes(value ? this.menuOptions : []);
        } else if (type == 'dept') {
          this.$refs.dept.setCheckedNodes(value ? this.deptOptions : []);
        }
      },
      // 树权限（父子联动）
      handleCheckedTreeConnect(value, type) {
        if (type == 'menu') {
          this.form.menuCheckStrictly = value ? true : false;
        } else if (type == 'dept') {
          this.form.deptCheckStrictly = value ? true : false;
        }
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.reset();
        this.getMenuTreeselect();
        this.open = true;
        this.title = '添加角色';
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        const roleId = row.roleId || this.ids;
        Promise.all([this.getMenuTreeselect(), roleMenuTreeselect(roleId), getRole(roleId)]).then(([menuOptions, ruleMenuList, roleInfo]) => {
          this.form = roleInfo.data;
          this.form.menuCheckStrictly = true;
          this.open = true;
          this.$nextTick(() => {
            // 菜单勾选
            ruleMenuList.checkedKeys.forEach((v) => {
              this.$refs.menu.setChecked(v, true, false);
            });
            // 模块勾选
            const noChildrenList = menuOptions.filter((f) => !f.hasChildren)?.map((m) => m.id);
            const checkedList = ruleMenuList.moduleList?.map((m) => `${m}-${m}`);
            const needSetCheckedList = checkedList.filter((f) => noChildrenList.includes(f));
            needSetCheckedList.length &&
              needSetCheckedList.forEach((v) => {
                this.$refs.menu.setChecked(v, true, false);
              });
          });
          this.title = '修改角色';
        });
      },
      /** 分配数据权限操作 */
      handleDataScope(row) {
        this.reset();
        const roleDeptTreeselect = this.getRoleDeptTreeselect(row.roleId);
        getRole(row.roleId).then((response) => {
          this.form = response.data;
          this.openDataScope = true;
          this.$nextTick(() => {
            roleDeptTreeselect.then((res) => {
              this.$refs.dept.setCheckedKeys(res.checkedKeys);
            });
          });
          this.title = '分配数据权限';
        });
      },
      /** 分配用户操作 */
      handleAuthUser: function (row) {
        const roleId = row.roleId;
        this.$router.push('/system/role/authUser/' + roleId);
      },
      /** 提交按钮 */
      submitForm: function () {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            const checkedIds = this.getMenuAllCheckedKeys();
            const menuIds = [];
            const moduleIds = [];
            checkedIds.forEach((id) => {
              if (/-/.test(id)) {
                moduleIds.push(Number(id.replace(/\d+-/, '')));
              } else {
                menuIds.push(id);
              }
            });
            if (this.form.roleId != undefined) {
              updateRole({ ...this.form, menuIds, moduleIds }).then((response) => {
                this.$message.success('修改成功');
                this.open = false;
                this.getList();
              });
            } else {
              addRole({ ...this.form, menuIds, moduleIds }).then((response) => {
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
        const roleIds = row.roleId || this.ids;
        this.$confirm('是否确认删除角色编号为"' + roleIds + '"的数据项？')
          .then(function () {
            return delRole(roleIds);
          })
          .then(() => {
            this.getList();
            this.$message.success('删除成功');
          })
          .catch(() => {});
      },
      /** 导出按钮操作 */
      handleExport() {
        this.$download('system/role/export', {
          method: 'post',
          params: this.queryParams,
          fileName: `role_${new Date().getTime()}.xlsx`
        });
      }
    }
  };
</script>
