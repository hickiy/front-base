<template>
  <div class="bg-white flex-1 p-4 m-2.5 flex flex-col overflow-hidden">
    <el-form class="ion-search-area--bg pt-4 pl-4 pr-4" ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="字典名称" prop="dictType">
        <el-select v-model="queryParams.dictType">
          <el-option v-for="item in typeOptions" :key="item.dictId" :label="item.dictName" :value="item.dictType" />
        </el-select>
      </el-form-item>
      <el-form-item label="字典标签" prop="dictLabel">
        <el-input v-model="queryParams.dictLabel" placeholder="请输入字典标签" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="数据状态" clearable>
          <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <template #append>
        <el-button @click="resetQuery">重置</el-button>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
      </template>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5"> </el-col>
      <el-col :span="1.5"> </el-col>
    </el-row>

    <el-table height="100%" title="字典数据" :set-table="[]" :border="true" v-loading="loading" :data="dataList">
      <template #prepend>
        <div class="flex flex-row justify-end">
          <el-button size="default" @click="handleExport" v-hasPermi="['system:dict:export']">导出</el-button>
          <el-button type="primary" size="default" @click="handleAdd" v-hasPermi="['system:dict:add']">新增</el-button>
        </div>
      </template>
      <el-table-column type="selection" width="60" />
      <el-table-column label="字典编码" prop="dictCode" min-width="120" />
      <el-table-column label="字典标签" prop="dictLabel" min-width="120" #default="scope">
        <span v-if="scope.row.listClass == '' || scope.row.listClass == 'default'">{{ scope.row.dictLabel }}</span>
        <el-tag v-else size="small" :type="scope.row.listClass == 'primary' ? '' : scope.row.listClass">{{ scope.row.dictLabel }}</el-tag>
      </el-table-column>
      <el-table-column label="字典键值" prop="dictValue" min-width="120" />
      <el-table-column label="字典排序" prop="dictSort" min-width="120" />
      <el-table-column label="状态" prop="status" min-width="120" #default="scope">
        <dict-tag size="samll" :options="sys_normal_disable" :value="scope.row.status" />
      </el-table-column>
      <el-table-column label="备注" prop="remark" min-width="120" />
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
    <el-dialog width="560px" class="ion-dialog" top="10vh" :title="title" v-model="open">
      <el-form ref="form" label-width="auto" class="mt-4" :model="form" :rules="rules">
        <el-form-item label="字典类型">
          <el-input v-model="form.dictType" :disabled="true" />
        </el-form-item>
        <el-form-item label="数据标签" prop="dictLabel">
          <el-input v-model="form.dictLabel" placeholder="请输入数据标签" />
        </el-form-item>
        <el-form-item label="数据键值" prop="dictValue">
          <el-input v-model="form.dictValue" placeholder="请输入数据键值" />
        </el-form-item>
        <el-form-item label="样式属性" prop="cssClass">
          <el-input v-model="form.cssClass" placeholder="请输入样式属性" />
        </el-form-item>
        <el-form-item label="显示排序" prop="dictSort">
          <el-input-number v-model="form.dictSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="回显样式" prop="listClass">
          <el-select v-model="form.listClass">
            <el-option v-for="item in listClassOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
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
  import { listData, getData, delData, addData, updateData } from '@/api/system/dict/data';
  import { optionselect as getDictOptionselect, getType } from '@/api/system/dict/type';

  export default {
    name: 'Data',
    data() {
      return {
        sys_normal_disable: this.$useDict('sys_normal_disable'),
        // 遮罩层
        loading: true,
        // 总条数
        total: 0,
        // 字典表格数据
        dataList: [],
        // 默认字典类型
        defaultDictType: '',
        // 弹出层标题
        title: '',
        // 是否显示弹出层
        open: false,
        // 数据标签回显样式
        listClassOptions: [
          {
            value: 'default',
            label: '默认'
          },
          {
            value: 'primary',
            label: '主要'
          },
          {
            value: 'success',
            label: '成功'
          },
          {
            value: 'info',
            label: '信息'
          },
          {
            value: 'warning',
            label: '警告'
          },
          {
            value: 'danger',
            label: '危险'
          }
        ],
        // 类型数据字典
        typeOptions: [],
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
          dictLabel: [{ required: true, message: '数据标签不能为空', trigger: 'blur' }],
          dictValue: [{ required: true, message: '数据键值不能为空', trigger: 'blur' }],
          dictSort: [{ required: true, message: '数据顺序不能为空', trigger: 'blur' }]
        }
      };
    },
    created() {
      const dictId = this.$route.params && this.$route.params.dictId;
      this.getType(dictId);
      this.getTypeList();
    },
    methods: {
      /** 查询字典类型详细 */
      getType(dictId) {
        getType(dictId).then((response) => {
          this.queryParams.dictType = response.data.dictType;
          this.defaultDictType = response.data.dictType;
          this.getList();
        });
      },
      /** 查询字典类型列表 */
      getTypeList() {
        getDictOptionselect().then((response) => {
          this.typeOptions = response.data;
        });
      },
      /** 查询字典数据列表 */
      getList() {
        this.loading = true;
        listData(this.queryParams).then((response) => {
          this.dataList = response.rows;
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
          dictCode: undefined,
          dictLabel: undefined,
          dictValue: undefined,
          cssClass: undefined,
          listClass: 'default',
          dictSort: 0,
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
        this.resetForm('queryForm');
        this.queryParams.dictType = this.defaultDictType;
        this.handleQuery();
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.reset();
        this.open = true;
        this.title = '添加字典数据';
        this.form.dictType = this.queryParams.dictType;
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        const dictCode = row.dictCode;
        getData(dictCode).then((response) => {
          this.form = response.data;
          this.open = true;
          this.title = '修改字典数据';
        });
      },
      /** 提交按钮 */
      submitForm: function () {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            if (this.form.dictCode != undefined) {
              updateData(this.form).then((response) => {
                this.$message.success('修改成功');
                this.open = false;
                this.getList();
              });
            } else {
              addData(this.form).then((response) => {
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
        const dictCodes = row.dictCode;
        this.$confirm('是否确认删除字典编码为"' + dictCodes + '"的数据项？', '提示', { type: 'warning' })
          .then(function () {
            return delData(dictCodes);
          })
          .then(() => {
            this.getList();
            this.$message.success('删除成功');
          })
          .catch(() => {});
      },
      /** 导出按钮操作 */
      handleExport() {
        this.$download('system/dict/data/export', {
          method: 'post',
          params: this.queryParams,
          fileName: `data_${new Date().getTime()}.xlsx`
        });
      }
    }
  };
</script>
