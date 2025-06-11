<template>
  <div class="bg-white flex-1 p-4 m-2.5 flex flex-col overflow-hidden">
    <el-form class="ion-search-area--bg pt-4 pl-4 pr-4" label-width="68px" ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="任务名称" prop="jobName">
        <el-input v-model="queryParams.jobName" placeholder="请输入任务名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="任务组名" prop="jobGroup">
        <el-select v-model="queryParams.jobGroup" placeholder="请选择任务组名" clearable>
          <el-option v-for="dict in sys_job_group" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="执行状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择执行状态" clearable>
          <el-option v-for="dict in sys_common_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="执行时间">
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
      title="调度日志"
      height="100%"
      :set-table="[]"
      :border="true"
      v-loading="loading"
      :data="jobLogList"
      @selection-change="handleSelectionChange"
    >
      <template #prepend>
        <div class="flex flex-row justify-end">
          <el-button size="default" :disabled="multiple" @click="handleDelete" v-hasPermi="['monitor:job:remove']">删除</el-button>
          <el-button size="default" @click="handleClean" v-hasPermi="['monitor:job:remove']">清空</el-button>
          <el-button type="primary" size="default" @click="handleExport" v-hasPermi="['monitor:job:export']">导出</el-button>
        </div>
      </template>
      <el-table-column type="selection" width="60" />
      <el-table-column label="日志编号" prop="jobLogId" min-width="120" />
      <el-table-column label="任务名称" prop="jobName" min-width="120" />
      <el-table-column label="任务组名" prop="jobGroup" min-width="120" #default="scope">
        <dict-tag size="small" :options="sys_job_group" :value="scope.row.jobGroup" />
      </el-table-column>
      <el-table-column label="调用目标字符串" prop="invokeTarget" min-width="120" />
      <el-table-column label="日志信息" prop="jobMessage" min-width="120" />
      <el-table-column label="执行状态" prop="status" min-width="120" #default="scope">
        <dict-tag size="small" :options="sys_common_status" :value="scope.row.status" />
      </el-table-column>
      <el-table-column label="执行时间" prop="createTime" min-width="180" #default="scope">
        <span>{{ parseTime(scope.row.createTime) }}</span>
      </el-table-column>
      <el-table-column label="操作" width="120" #default="scope">
        <el-button type="primary" link @click="handleView(scope.row)" v-hasPermi="['monitor:job:query']">详细</el-button>
      </el-table-column>
    </el-table>

    <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 调度日志详细 -->
    <el-dialog title="调度日志详细" width="960px" top="10vh" class="ion-dialog" v-model="open">
      <div class="h-120 overflow-auto">
        <el-form ref="form" label-width="auto" class="mt-2" :model="form">
          <el-form-item label="日志序号：">{{ form.jobLogId }}</el-form-item>
          <el-form-item label="任务名称：">{{ form.jobName }}</el-form-item>
          <el-form-item label="任务分组：">{{ form.jobGroup }}</el-form-item>
          <el-form-item label="执行时间：">{{ form.createTime }}</el-form-item>
          <el-form-item label="调用方法：">{{ form.invokeTarget }}</el-form-item>
          <el-form-item label="日志信息：">{{ form.jobMessage }}</el-form-item>
          <el-form-item label="执行状态：">
            <div v-if="form.status == 0">正常</div>
            <div v-else-if="form.status == 1">失败</div>
          </el-form-item>
          <el-form-item label="异常信息：" v-if="form.status == 1">{{ form.exceptionInfo }}</el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="open = false">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  import { getJob } from '@/api/monitor/job';
  import { listJobLog, delJobLog, cleanJobLog } from '@/api/monitor/jobLog';

  export default {
    name: 'JobLog',
    data() {
      return {
        sys_common_status: this.$useDict('common_status'),
        sys_job_group: this.$useDict('sys_job_group'),
        // 遮罩层
        loading: true,
        // 选中数组
        ids: [],
        // 非多个禁用
        multiple: true,
        // 总条数
        total: 0,
        // 调度日志表格数据
        jobLogList: [],
        // 是否显示弹出层
        open: false,
        // 日期范围
        dateRange: [],
        // 表单参数
        form: {},
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 20,
          jobName: undefined,
          jobGroup: undefined,
          status: undefined
        }
      };
    },
    created() {
      const jobId = this.$route.query.jobId;
      if (jobId !== undefined && jobId != 0) {
        getJob(jobId).then((response) => {
          this.queryParams.jobName = response.data.jobName;
          this.queryParams.jobGroup = response.data.jobGroup;
          this.getList();
        });
      } else {
        this.getList();
      }
    },
    methods: {
      /** 查询调度日志列表 */
      getList() {
        this.loading = true;
        listJobLog(this.addDateRange(this.queryParams, this.dateRange)).then((response) => {
          this.jobLogList = response.rows;
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
        this.handleQuery();
      },
      // 多选框选中数据
      handleSelectionChange(selection) {
        this.ids = selection.map((item) => item.jobLogId);
        this.multiple = !selection.length;
      },
      /** 详细按钮操作 */
      handleView(row) {
        this.open = true;
        this.form = row;
      },
      /** 删除按钮操作 */
      handleDelete(row) {
        const jobLogIds = this.ids;
        this.$confirm('是否确认删除调度日志编号为"' + jobLogIds + '"的数据项？', '提示', { type: 'warning' })
          .then(function () {
            return delJobLog(jobLogIds);
          })
          .then(() => {
            this.getList();
            this.$message.success('删除成功');
          })
          .catch(() => {});
      },
      /** 清空按钮操作 */
      handleClean() {
        this.$confirm('是否确认清空所有调度日志数据项？', '提示', { type: 'warning' })
          .then(function () {
            return cleanJobLog();
          })
          .then(() => {
            this.getList();
            this.$message.success('清空成功');
          })
          .catch(() => {});
      },
      /** 导出按钮操作 */
      handleExport() {
        this.$download('schedule/job/log/export', {
          method: 'post',
          pamars: this.queryParams,
          fileName: `log_${new Date().getTime()}.xlsx`
        });
      }
    }
  };
</script>
