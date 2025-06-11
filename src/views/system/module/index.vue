<template>
  <div class="bg-white flex-1 p-4 m-2.5 flex flex-col overflow-hidden">
    <el-form class="ion-search-area--bg pt-4 pl-4 pr-4" :model="queryParams" ref="queryForm" :inline="true" label-width="100px">
      <el-form-item label="模块名称" prop="moduleName">
        <el-input v-model="queryParams.moduleName" placeholder="请输入模块名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="路由地址" prop="path">
        <el-input v-model="queryParams.path" placeholder="请输入路由地址" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="路由参数" prop="paramPath">
        <el-input v-model="queryParams.paramPath" placeholder="请输入路由参数" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="模块显隐状态" prop="hideModule">
        <el-input v-model="queryParams.hideModule" placeholder="请输入模块显隐状态" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="显示顺序" prop="sort">
        <el-input v-model="queryParams.sort" placeholder="请输入显示顺序" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="公共模块" prop="isCommon">
        <el-input v-model="queryParams.isCommon" placeholder="请输入公共模块" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="默认模块" prop="isDefault">
        <el-input v-model="queryParams.isDefault" placeholder="请输入默认模块" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <template #append>
        <el-button @click="resetQuery">重置</el-button>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
      </template>
    </el-form>

    <el-table title="模块列表" height="100%" row-class-name="setup_center" :set-table="[]" v-loading="loading" :data="moduleList" :border="true">
      <template #prepend>
        <div class="flex flex-row justify-end">
          <el-button type="primary" size="default" @click="handleAdd" v-hasPermi="['system:module:add']">新增 </el-button>
        </div>
      </template>
      <el-table-column label="模块Id" prop="moduleId" min-width="100" />
      <el-table-column label="模块名称" prop="moduleName" min-width="140" />
      <el-table-column label="模块logo" prop="logo" min-width="140" />
      <el-table-column label="路由地址" prop="path" min-width="140" />
      <el-table-column label="路由参数" prop="paramPath" min-width="140" />
      <el-table-column label="模块类型" prop="type" min-width="100" />
      <el-table-column label="模块显隐状态" prop="hideModule" min-width="120" />
      <el-table-column label="显示顺序" prop="sort" min-width="120" />
      <el-table-column label="状态" prop="status" #default="{ row }" min-width="80">
        <el-switch size="default" v-model="row.status" active-value="0" inactive-value="1" @change="handleStatusChange(row)"> </el-switch>
      </el-table-column>
      <el-table-column label="备注" prop="remark" min-width="160" />
      <el-table-column label="公共模块" prop="isCommon" min-width="100" />
      <el-table-column label="默认模块" prop="isDefault" min-width="100" />
      <el-table-column label="操作" #default="scope" width="120">
        <el-button type="primary" link @click="handleUpdate(scope.row)" v-hasPermi="['system:module:edit']">修改</el-button>
        <el-button type="primary" link @click="handleDelete(scope.row)" v-hasPermi="['system:module:remove']">删除</el-button>
      </el-table-column>
    </el-table>

    <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改模块信息对话框 -->
    <el-dialog width="760px" top="10vh" class="ion-dialog" :title="title" v-model="open">
      <div class="h-140 overflow-auto mt-4">
        <el-form ref="form" :model="form" :rules="rules" label-width="auto">
          <el-form-item label="模块名称" prop="moduleName">
            <el-input v-model="form.moduleName" placeholder="请输入模块名称" />
          </el-form-item>
          <el-form-item label="模块logo" prop="logo">
            <el-upload :limit="1" :file-list="form.logoList">
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item label="路由地址" prop="path">
            <el-input v-model="form.path" placeholder="请输入路由地址" />
          </el-form-item>
          <el-form-item label="路由参数" prop="paramPath">
            <el-input v-model="form.paramPath" placeholder="请输入路由参数" />
          </el-form-item>
          <el-form-item label="模块显隐状态" prop="hideModule">
            <el-input v-model="form.hideModule" placeholder="请输入模块显隐状态" />
          </el-form-item>
          <el-form-item label="显示顺序" prop="sort">
            <el-input v-model="form.sort" placeholder="请输入显示顺序" />
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
          </el-form-item>
          <el-form-item label="公共模块" prop="isCommon">
            <el-input v-model="form.isCommon" placeholder="请输入公共模块" />
          </el-form-item>
          <el-form-item label="默认模块" prop="isDefault">
            <el-input v-model="form.isDefault" placeholder="请输入默认模块" />
          </el-form-item>
          <el-form-item label="删除标志" prop="delFlag">
            <el-input v-model="form.delFlag" placeholder="请输入删除标志" />
          </el-form-item>
          <el-form-item label="操作编码" prop="operCode">
            <el-input v-model="form.operCode" placeholder="请输入操作编码" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  import { listModule, getModule, delModule, addModule, updateModule, updateModuleInfo } from '@/api/system/module';
  export default {
    name: 'Module',
    data() {
      return {
        // 遮罩层
        loading: true,
        // 选中数组
        ids: [],
        // 非单个禁用
        single: true,
        // 非多个禁用
        multiple: true,
        // 总条数
        total: 0,
        // 模块信息表格数据
        moduleList: [],
        // 弹出层标题
        title: '',
        // 是否显示弹出层
        open: false,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 20,
          moduleName: null,
          logo: null,
          path: null,
          paramPath: null,
          type: null,
          hideModule: null,
          sort: null,
          status: null,
          isCommon: null,
          isDefault: null,
          logoList: []
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          moduleName: [{ required: true, message: '模块名称不能为空', trigger: 'blur' }],
          logo: [{ required: true, message: '模块logo不能为空', trigger: 'blur' }],
          path: [{ required: true, message: '路由地址不能为空', trigger: 'blur' }],
          type: [{ required: true, message: '模块类型不能为空', trigger: 'change' }],
          hideModule: [{ required: true, message: '模块显隐状态不能为空', trigger: 'blur' }],
          sort: [{ required: true, message: '显示顺序不能为空', trigger: 'blur' }],
          status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
          isCommon: [{ required: true, message: '公共模块不能为空', trigger: 'blur' }],
          isDefault: [{ required: true, message: '默认模块不能为空', trigger: 'blur' }],
          delFlag: [{ required: true, message: '删除标志不能为空', trigger: 'blur' }],
          operCode: [{ required: true, message: '操作编码不能为空', trigger: 'blur' }]
        }
      };
    },
    created() {
      this.getList();
    },
    methods: {
      /** 查询模块信息列表 */
      getList() {
        this.loading = true;
        listModule(this.queryParams)
          .then((response) => {
            this.moduleList = response.rows;
            this.total = response.total;
          })
          .finally(() => {
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
          moduleId: null,
          moduleName: null,
          logo: null,
          path: null,
          paramPath: null,
          type: null,
          hideModule: null,
          sort: null,
          status: '0',
          remark: null,
          createBy: null,
          createTime: null,
          updateBy: null,
          updateTime: null,
          isCommon: null,
          isDefault: null,
          delFlag: null,
          tenantId: null,
          logoList: []
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
        this.title = '添加模块信息';
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        const moduleId = row.moduleId || this.ids;
        getModule(moduleId).then((response) => {
          this.form = response.data;
          if (this.form.logo) {
            this.form.logoList = [{ url: this.form.logo }];
          }
          this.open = true;
          this.title = '修改模块信息';
        });
      },
      // 模块停用启用
      handleStatusChange(row) {
        let text = row.status === '0' ? '启用' : '停用';
        this.$confirm('确认要"' + text + '""' + row.moduleName + '"模块吗？', '提示', { type: 'warning' })
          .then(function () {
            return updateModule(row.moduleId, row.status);
          })
          .then(() => {
            this.$message.success(text + '成功');
          })
          .catch(function () {
            row.status = row.status === '0' ? '1' : '0';
          });
      },
      /** 提交按钮 */
      submitForm() {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            if (this.form.logoList?.length > 0) {
              this.form.logo = this.form.logoList?.[0]?.url;
            }
            delete this.form.logoList;
            if (this.form.moduleId != null) {
              updateModuleInfo(this.form).then((response) => {
                this.$message.success('修改成功');
                this.open = false;
                this.getList();
              });
            } else {
              addModule(this.form).then((response) => {
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
        const moduleIds = row.moduleId || this.ids;
        this.$confirm('是否确认删除模块信息编号为"' + moduleIds + '"的数据项？', '提示', { type: 'warning' })
          .then(function () {
            return delModule(moduleIds);
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
<style lang="scss" scoped></style>
