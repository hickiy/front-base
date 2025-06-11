<template>
  <div class="bg-white flex-1 p-4 m-2.5 flex flex-col overflow-hidden">
    <el-form class="ion-search-area--bg pt-4 pl-4 pr-4" ref="queryForm" label-width="68px" :model="queryParams" :inline="true">
      <el-form-item label="登录地址" prop="ipaddr">
        <el-input v-model="queryParams.ipaddr" placeholder="请输入登录地址" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="用户名称" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="登录状态" clearable>
          <el-option v-for="dict in sys_common_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="登录时间">
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
      title="登录日志列表"
      :set-table="[]"
      :border="true"
      v-loading="loading"
      :data="list"
      @selection-change="handleSelectionChange"
      :default-sort="defaultSort"
      @sort-change="handleSortChange"
    >
      <template #prepend>
        <div class="flex flex-row justify-end">
          <el-button type="primary" size="default" :disabled="multiple" @click="handleDelete" v-hasPermi="['system:logininfor:remove']">
            删除
          </el-button>
          <el-button type="primary" size="default" @click="handleClean" v-hasPermi="['system:logininfor:remove']">清空</el-button>
        </div>
      </template>
      <el-table-column type="selection" width="60" />
      <el-table-column label="访问编号" prop="infoId" min-width="120" />
      <el-table-column label="用户名称" prop="userName" min-width="120" sortable="custom" :sort-orders="['descending', 'ascending']" />
      <el-table-column label="地址" prop="ipaddr" min-width="120" />
      <el-table-column label="登录状态" prop="status" min-width="120" #default="scope">
        <dict-tag size="small" :options="sys_common_status" :value="scope.row.status" />
      </el-table-column>
      <el-table-column label="描述" prop="msg" min-width="120" />
      <el-table-column
        label="访问时间"
        prop="accessTime"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
        min-width="180"
        #default="scope"
      >
        <span>{{ parseTime(scope.row.accessTime) }}</span>
      </el-table-column>
    </el-table>
    <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script>
  import { list, delLogininfor, cleanLogininfor } from '@/api/system/logininfor';

  export default {
    name: 'Logininfor',
    data() {
      return {
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
        // 日期范围
        dateRange: [],
        // 默认排序
        defaultSort: { prop: 'loginTime', order: 'descending' },
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 20,
          ipaddr: undefined,
          userName: undefined,
          status: undefined
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
        list(this.addDateRange(this.queryParams, this.dateRange)).then((response) => {
          this.list = response.rows;
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
        this.dateRange = [];
        this.resetForm('queryForm');
        this.$refs.tables.sort(this.defaultSort.prop, this.defaultSort.order);
        this.handleQuery();
      },
      /** 多选框选中数据 */
      handleSelectionChange(selection) {
        this.ids = selection.map((item) => item.infoId);
        this.multiple = !selection.length;
      },
      /** 排序触发事件 */
      handleSortChange(column, prop, order) {
        this.queryParams.orderByColumn = column.prop;
        this.queryParams.isAsc = column.order;
        this.getList();
      },
      /** 删除按钮操作 */
      handleDelete(row) {
        const infoIds = row.infoId || this.ids;
        this.$confirm('是否确认删除访问编号为"' + infoIds + '"的数据项？', '提示', { type: 'warning' })
          .then(function () {
            return delLogininfor(infoIds);
          })
          .then(() => {
            this.getList();
            this.$message.success('删除成功');
          })
          .catch(() => {});
      },
      /** 清空按钮操作 */
      handleClean() {
        this.$confirm('是否确认清空所有登录日志数据项？', '提示', { type: 'warning' })
          .then(function () {
            return cleanLogininfor();
          })
          .then(() => {
            this.getList();
            this.$message.success('清空成功');
          })
          .catch(() => {});
      },
      /** 导出按钮操作 */
      handleExport() {
        this.$download('system/logininfor/export', {
          method: 'post',
          params: this.queryParams,
          fileName: `logininfor_${new Date().getTime()}.xlsx`
        });
      }
    }
  };
</script>
