<template>
  <div class="bg-white flex-1 p-4 m-2.5 flex flex-col overflow-hidden">
    <el-form class="ion-search-area--bg pt-4 pl-4 pr-4" :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="菜单名称" prop="menuName">
        <el-input v-model="queryParams.menuName" placeholder="请输入菜单名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="菜单状态" clearable>
          <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <template #append>
        <el-button @click="resetQuery">重置</el-button>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
      </template>
    </el-form>

    <el-table
      row-key="menuId"
      height="100%"
      title="菜单列表"
      row-class-name="setup_center"
      :set-table="[]"
      :border="true"
      v-loading="loading"
      :data="menuTree"
      :default-expand-all="isExpandAll"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <template #prepend>
        <div class="text-right">
          <el-button type="primary" size="default" @click="handleAdd" v-hasPermi="['system:menu:add']">新增</el-button>
        </div>
      </template>
      <el-table-column prop="menuName" label="菜单名称" min-width="180"></el-table-column>
      <el-table-column prop="icon" label="图标" min-width="80" #default="scope">
        <svg-icon :icon-class="scope.row.icon" />
      </el-table-column>
      <el-table-column prop="orderNum" label="排序" min-width="70"></el-table-column>
      <el-table-column prop="perms" label="权限标识" min-width="120"></el-table-column>
      <el-table-column prop="component" label="组件路径" min-width="280"></el-table-column>
      <el-table-column prop="status" label="状态" min-width="80" #default="scope">
        <dict-tag size="default" :options="sys_normal_disable" :value="scope.row.status" />
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" min-width="180" #default="scope">
        <span>{{ parseTime(scope.row.createTime) }}</span>
      </el-table-column>
      <el-table-column label="操作" width="200" #default="scope">
        <el-button type="primary" link v-if="!scope.row.moduleName" @click="handleUpdate(scope.row)" v-hasPermi="['system:menu:edit']"
          >修改</el-button
        >
        <el-button type="primary" link @click="handleAdd(scope.row)" v-hasPermi="['system:menu:add']">新增</el-button>
        <el-button type="primary" link v-if="!scope.row.moduleName" @click="handleDelete(scope.row)" v-hasPermi="['system:menu:remove']"
          >删除</el-button
        >
      </el-table-column>
    </el-table>

    <!-- 添加或修改菜单对话框 -->
    <el-dialog width="760px" top="5vh" class="ion-dialog" :title="title" v-model="open">
      <el-form ref="form" class="grid grid-cols-2 gap-x-4 mt-4" label-width="auto" :model="form" :rules="rules">
        <el-form-item label="上级菜单" prop="parentId" class="col-span-2">
          <el-tree-select
            v-model="form.parentId"
            :data="menuTree"
            :props="{ value: 'menuId', label: 'menuName', children: 'children' }"
            value-key="menuId"
            placeholder="选择上级菜单"
            check-strictly
          />
        </el-form-item>
        <el-form-item label="菜单类型" prop="menuType">
          <el-radio-group v-model="form.menuType">
            <el-radio label="M">目录</el-radio>
            <el-radio label="C">菜单</el-radio>
            <el-radio label="F">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="status" v-if="form.menuType != 'F'">
          <template #label>
            <el-tooltip content="选择停用则路由将不会出现在侧边栏，也不能被访问" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
            菜单状态
          </template>
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="显示排序" prop="orderNum">
          <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item prop="isFrame" v-if="form.menuType != 'F'">
          <template #label>
            <el-tooltip content="选择是外链则路由地址需要以`http(s)://`开头" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
            是否外链
          </template>
          <el-radio-group v-model="form.isFrame">
            <el-radio label="0">是</el-radio>
            <el-radio label="1">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="menuName" class="col-span-2">
          <el-input v-model="form.menuName" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="菜单图标" prop="icon" class="col-span-2" v-if="form.menuType != 'F'">
          <el-popover placement="bottom-start" width="600" trigger="click" @show="$refs['iconSelect'].reset()">
            <IconSelect ref="iconSelect" @selected="selected" />
            <template #reference>
              <el-input v-model="form.icon" placeholder="点击选择图标">
                <template #prefix>
                  <svg-icon v-if="form.icon" :icon-class="form.icon" class="el-input__icon" style="height: 32px; width: 16px" />
                  <el-icon v-else><Search /></el-icon>
                </template>
              </el-input>
            </template>
          </el-popover>
        </el-form-item>
        <el-form-item prop="path" class="col-span-2" v-if="form.menuType != 'F'">
          <template #label>
            <el-tooltip content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
            路由地址
          </template>
          <el-input v-model="form.path" placeholder="请输入路由地址" />
        </el-form-item>
        <el-form-item prop="component" class="col-span-2" v-if="form.menuType == 'C'">
          <template #label>
            <el-tooltip content="访问的组件路径，如：`system/user/index`，默认在`views`目录下" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
            组件路径
          </template>
          <el-input v-model="form.component" placeholder="请输入组件路径" />
        </el-form-item>
        <el-form-item prop="query" class="col-span-2" v-if="form.menuType == 'C'">
          <el-input v-model="form.query" placeholder="请输入路由参数" maxlength="255" />
          <template #label>
            <el-tooltip content='访问路由的默认传递参数，如：`{"id": 1, "name": "ry"}`' placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
            路由参数
          </template>
        </el-form-item>
        <el-form-item prop="perms" v-if="form.menuType != 'M'">
          <el-input v-model="form.perms" placeholder="请输入权限标识" maxlength="100" />
          <template #label>
            <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasPermi('system:user:list')`)" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
            权限字符
          </template>
        </el-form-item>
        <el-form-item label="操作编码" prop="operCode" v-if="form.menuType == 'C'">
          <el-input v-model="form.operCode" placeholder="请输入操作编码" />
        </el-form-item>
        <el-form-item prop="visible" v-if="form.menuType != 'F'">
          <template #label>
            <el-tooltip content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
            显示状态
          </template>
          <el-radio-group v-model="form.visible">
            <el-radio v-for="dict in sys_show_hide" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="isCache" v-if="form.menuType == 'C'">
          <template #label>
            <el-tooltip content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
            是否缓存
          </template>
          <el-radio-group v-model="form.isCache">
            <el-radio value="0">缓存</el-radio>
            <el-radio value="1">不缓存</el-radio>
          </el-radio-group>
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
  import { listMenu, getMenu, delMenu, addMenu, updateMenu } from '@/api/system/menu';
  import { listModule } from '@/api/system/module';
  import IconSelect from '@/components/IconSelect/index.vue';

  export default {
    name: 'Menu',
    components: { IconSelect },
    data() {
      return {
        sys_show_hide: this.$useDict('sys_show_hide'),
        sys_normal_disable: this.$useDict('sys_normal_disable'),
        // 遮罩层
        loading: true,
        // 菜单表格树数据
        menuTree: [],
        // 弹出层标题
        title: '',
        // 是否显示弹出层
        open: false,
        // 是否展开，默认全部折叠
        isExpandAll: false,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 100,
          menuName: undefined,
          visible: undefined
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          menuName: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
          orderNum: [{ required: true, message: '菜单顺序不能为空', trigger: 'blur' }],
          path: [{ required: true, message: '路由地址不能为空', trigger: 'blur' }],
          operCode: [{ required: true, message: '操作编码不能为空', trigger: 'blur' }]
        },
        // 模块列表
        moduleList: [],
        // 菜单列表
        menuList: []
      };
    },
    created() {
      this.getList();
    },
    methods: {
      // 选择图标
      selected(name) {
        this.form.icon = name;
      },
      /** 查询菜单列表 */
      getList() {
        this.loading = true;
        Promise.all([listMenu(this.queryParams), listModule(this.queryParams)])
          .then(([resOfMenu, resOfModule]) => {
            this.menuList = this.handleTree(resOfMenu.data, 'menuId');
            this.moduleList = resOfModule.rows;
            this.menuTree = this.moduleList.map((module) => {
              return {
                ...module,
                icon: '',
                menuName: module.moduleName,
                menuId: module.moduleId + '-' + module.moduleId, // 此处为了避免树中 模块id与菜单id重复， 模块id采用拼接形式避免重复
                children: this.menuList.filter((menu) => menu.moduleId == module.moduleId)
              };
            });
          })
          .catch((err) => {
            console.error(err);
          })
          .finally(() => {
            this.loading = false;
          });
      },
      /** 转换菜单数据结构 */
      normalizer(node) {
        if (node.children && !node.children.length) {
          delete node.children;
        }
        return {
          id: node.menuId,
          label: node.menuName,
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
          menuId: undefined,
          parentId: this.menuTree[0].menuId,
          moduleId: undefined,
          menuName: undefined,
          icon: undefined,
          menuType: 'M',
          orderNum: undefined,
          isFrame: '1',
          isCache: '0',
          visible: '0',
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
        if (row != null && row.menuId) {
          this.form.parentId = row.menuId;
        } else {
          this.form.parentId = this.menuTree[0].menuId;
        }
        this.open = true;
        this.title = '添加菜单';
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        getMenu(row.menuId).then((response) => {
          const data = response.data;
          if (data.parentId == 0) {
            // 菜单父id为0表示 上级为模块, 此处为了避免树中 模块id与菜单id重复， 模块id采用拼接形式避免重复
            data.parentId = data.moduleId + '-' + data.moduleId;
          }
          this.form = data;
          this.open = true;
          this.title = '修改菜单';
        });
      },
      /** 提交按钮 */
      submitForm: function () {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            /**
             * 修改或者新增时处理菜单的模块id及parentId
             * parentId为纯数字说明上级为菜单， parentId不变，moduleId取上级菜单的moduleId
             * 否则上级为模块，moduleId直接通过拆分parentId获得，parentId默认为0
             */
            if (/^\d+$/.test(this.form.parentId)) {
              // 原代码 匹配不到parentId时会报错
              // const { moduleId } = this.menuList.find((menu) => menu.menuId == this.form.parentId);
              // this.form.moduleId = moduleId;
              const menu = this.menuList.find((menu) => menu.menuId == this.form.parentId);
              this.form.moduleId = menu ? menu.moduleId : null;
            } else {
              this.form.moduleId = this.form.parentId.split('-')[0];
              this.form.parentId = 0;
            }
            if (this.form.menuId != undefined) {
              updateMenu(this.form).then((response) => {
                this.$message.success('修改成功');
                this.open = false;
                this.getList();
              });
            } else {
              addMenu(this.form).then((response) => {
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
        this.$confirm('是否确认删除名称为"' + row.menuName + '"的数据项？', '提示', {
          type: 'warning',
          customClass: 'ion-message-box'
        })
          .then(function () {
            return delMenu(row.menuId);
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
