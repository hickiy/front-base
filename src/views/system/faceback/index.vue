<template>
  <div class="bg-white flex-1 p-4 m-2.5 flex flex-col overflow-hidden">
    <div class="flex-1 overflow-auto">
      <div class="faceback-title">反馈列表</div>
      <div class="faceback-content">
        <div class="cell" v-for="(i, index) in list" :key="index">
          <img :src="i.feedBackType === '1' ? icon1 : icon2" alt="" />
          <div>
            <div>{{ i.feedBackTitle }}</div>
            <div class="desc">
              <div class="mr10">{{ i.feedBackType === '1' ? '公司管理相关' : '系统使用相关' }}</div>
              <el-divider direction="vertical" />
              <div class="mr20 ml10">{{ i.createTime }}</div>
              <div><el-button type="primary" link @click="openDialog(i)">查看详情</el-button></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-row justify-end mt-4">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageInfo.pageNum"
        :page-sizes="[20, 50, 100]"
        :page-size="pageInfo.pageSize"
        layout="total,prev,pager,next,sizes"
        :total="total"
        background
      />
    </div>
    <el-dialog width="560px" class="ion-dialog" :title="currentRow.feedBackTitle" v-model="visible">
      <el-row class="desc mb-2.5 mt-4">
        <el-col :span="6">{{ currentRow.feedBackType === '1' ? '公司管理相关' : '系统使用相关' }}</el-col>
        <el-col :span="8">{{ currentRow.createTime }}</el-col>
      </el-row>
      <div class="dialog-content" v-html="pageHtml"></div>
      <template #footer>
        <el-button type="primary" @click="visible = false">知道了</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  import { backList } from './api';
  export default {
    data() {
      return {
        pageInfo: {
          pageNum: 1,
          pageSize: 20
        },
        list: [],
        total: 0,
        icon1: new URL('./imgs/icon1.png', import.meta.url).href,
        icon2: new URL('./imgs/icon2.png', import.meta.url).href,
        visible: false,
        currentRow: {},
        pageHtml: ''
      };
    },
    created() {
      this.init();
    },
    methods: {
      // 初始化
      init() {
        backList(this.pageInfo)
          .then((res) => {
            this.total = res?.total;
            this.list = res?.rows || [];
          })
          .catch((err) => console.log(err));
      },
      handleSizeChange(val) {
        this.pageInfo.pageSize = val;
        this.init();
      },
      handleCurrentChange(val) {
        this.pageInfo.pageNum = val;
        this.init();
      },
      // 查看详情
      openDialog(row) {
        this.visible = true;
        this.currentRow = row;
        this.pageHtml = this.currentRow.feedBackContent?.replace(/\n/g, '<br/>');
      }
    }
  };
</script>
<style scoped lang="scss">
  .faceback-title {
    font-size: 16px;
    font-weight: bold;
    color: #1e2e4e;
    position: relative;
    padding-left: 10px;
    margin-bottom: 20px;
    &:before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 2px;
      height: 80%;
      background-color: blue;
    }
  }
  .faceback-content {
    flex: 1;
    overflow: scroll;
  }
  .cell {
    border: 1px solid #f2f3f5;
    padding: 24px 30px;
    display: flex;
    line-height: 2em;
    margin-bottom: 16px;
    img {
      width: 52px;
      height: 52px;
      margin-right: 16px;
    }
  }
  .desc {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #86909c;
    > div {
      line-height: 1;
    }
  }
  .dialog-content {
    color: #1e2e4e;
    line-height: 1.8;
    min-height: 120px;
  }
</style>
