<template>
  <div class="bg-white flex-1 p-4 m-2.5 flex flex-col overflow-hidden">
    <el-form class="ion-search-area--bg pt-4 pl-4 pr-4" label-width="68px" ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="系统模块" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入系统模块" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="操作人员" prop="operName">
        <el-input v-model="queryParams.operName" placeholder="请输入操作人员" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="类型" prop="businessType">
        <el-select v-model="queryParams.businessType" placeholder="操作类型" clearable>
          <el-option v-for="dict in sys_oper_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="操作状态" clearable>
          <el-option v-for="dict in sys_common_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作时间">
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
    <el-table
      ref="tables"
      height="100%"
      title="操作日志列表"
      :border="true"
      :set-table="[]"
      v-loading="loading"
      :data="list"
      @selection-change="handleSelectionChange"
      :default-sort="defaultSort"
      @sort-change="handleSortChange"
    >
      <template #prepend>
        <div class="flex flex-row justify-end">
          <el-button type="primary" size="default" :disabled="multiple" @click="handleDelete" v-hasPermi="['system:operlog:remove']">删除</el-button>
          <el-button type="primary" size="default" @click="handleClean" v-hasPermi="['system:operlog:remove']">清空</el-button>
        </div>
      </template>
      <el-table-column type="selection" width="70" />
      <el-table-column label="日志编号" prop="operId" min-width="120" />
      <el-table-column label="系统模块" prop="title" min-width="120" />
      <el-table-column label="操作类型" prop="businessType" min-width="120" #default="scope">
        <dict-tag size="small" :options="sys_oper_type" :value="scope.row.businessType" />
      </el-table-column>
      <el-table-column label="请求方式" prop="requestMethod" min-width="120" />
      <el-table-column label="操作人员" prop="operName" min-width="120" sortable="custom" :sort-orders="['descending', 'ascending']" />
      <el-table-column label="主机" prop="operIp" min-width="120" />
      <el-table-column label="操作状态" prop="status" #default="scope">
        <dict-tag size="small" :options="sys_common_status" :value="scope.row.status" />
      </el-table-column>
      <el-table-column label="操作日期" prop="operTime" sortable="custom" min-width="180" :sort-orders="['descending', 'ascending']" #default="scope">
        <span>{{ parseTime(scope.row.operTime) }}</span>
      </el-table-column>
      <el-table-column label="操作" #default="scope" width="100">
        <el-button type="primary" link @click="handleView(scope.row, scope.index)" v-hasPermi="['system:operlog:query']">详细</el-button>
      </el-table-column>
    </el-table>

    <pagination :total="total" v-model:page.sync="queryParams.pageNum" v-model:limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 操作日志详细 -->
    <el-dialog title="操作日志详细" width="760px" top="10vh" class="ion-dialog" v-model="open">
      <el-form ref="form" class="mt-4" :model="form" label-width="100px" size="small">
        <el-form-item label="操作模块：">{{ form.title }} / {{ typeFormat(form) }}</el-form-item>
        <el-form-item label="登录信息：">{{ form.operName }} / {{ form.operIp }}</el-form-item>
        <el-form-item label="请求地址：">{{ form.operUrl }}</el-form-item>
        <el-form-item label="请求方式：">{{ form.requestMethod }}</el-form-item>
        <el-form-item label="操作方法：">{{ form.method }}</el-form-item>
        <el-form-item label="请求参数：">{{ form.operParam }}</el-form-item>
        <el-form-item label="返回参数：">{{ form.jsonResult }}</el-form-item>
        <el-form-item label="操作状态：">
          <div v-if="form.status === 0">正常</div>
          <div v-else-if="form.status === 1">失败</div>
        </el-form-item>
        <el-form-item label="操作时间：">{{ parseTime(form.operTime) }}</el-form-item>
        <el-form-item label="异常信息：" v-if="form.status === 1">{{ form.errorMsg }}</el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="open = false">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  import { list, delOperlog, cleanOperlog } from '@/api/system/operlog';

  export default {
    name: 'Operlog',
    data() {
      return {
        sys_oper_type: this.$useDict('sys_oper_type'),
        sys_common_status: this.$useDict('sys_common_status'),
        // 遮罩层
        loading: true,
        // 选中数组
        ids: [],
        // 非多个禁用
        multiple: true,
        // 总条数
        total: 0,
        // 表格数据
        list: [],
        // 是否显示弹出层
        open: false,
        // 日期范围
        dateRange: [],
        // 默认排序
        defaultSort: { prop: 'operTime', order: 'descending' },
        // 表单参数
        form: {},
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 20,
          title: undefined,
          operName: undefined,
          businessType: undefined,
          status: undefined
        }
      };
    },
    created() {
      this.getList();
    },
    methods: {
      /** 查询登录日志 */
      getList() {
        this.loading = true;
        list(this.addDateRange(this.queryParams, this.dateRange)).then((response) => {
          this.list = response.rows;
          this.total = response.total;
          this.loading = false;
        });
      },
      // 操作日志类型字典翻译
      typeFormat(row, column) {
        return this.selectDictLabel(this.sys_oper_type, row.businessType);
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
        this.$refs.tables.sort(this.defaultSort.prop, this.defaultSort.order);
        this.handleQuery();
      },
      /** 多选框选中数据 */
      handleSelectionChange(selection) {
        this.ids = selection.map((item) => item.operId);
        this.multiple = !selection.length;
      },
      /** 排序触发事件 */
      handleSortChange(column, prop, order) {
        this.queryParams.orderByColumn = column.prop;
        this.queryParams.isAsc = column.order;
        this.getList();
      },
      /** 详细按钮操作 */
      handleView(row) {
        this.open = true;
        this.form = row;
      },
      /** 删除按钮操作 */
      handleDelete(row) {
        const operIds = row.operId || this.ids;
        this.$confirm('是否确认删除日志编号为"' + operIds + '"的数据项？', '提示', { type: 'warning' })
          .then(function () {
            return delOperlog(operIds);
          })
          .then(() => {
            this.getList();
            this.$message.success('删除成功');
          })
          .catch(() => {});
      },
      /** 清空按钮操作 */
      handleClean() {
        this.$confirm('是否确认清空所有操作日志数据项？', '提示', { type: 'warning' })
          .then(function () {
            return cleanOperlog();
          })
          .then(() => {
            this.getList();
            this.$message.success('清空成功');
          })
          .catch(() => {});
      }
    }
  };
</script>
