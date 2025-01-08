<template>
  <el-dialog class="ion-dialog" v-model="visible" top="15vh" :title="title" width="760px">
    <div class="flex flex-row flex-wrap pl-5 pb-4 mt-4 max-h-[400px] overflow-auto">
      <el-preview-file
        class="border border-solid ion-border-primary h-38 mr-5 w-50"
        v-for="(c, index) in fileList"
        :key="index"
        :file="c"
      ></el-preview-file>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    name: 'file-viewer',
    data() {
      return {
        visible: false, // 是否显示
        fileList: [], // 文件列表
        title: '附件查看' // 标题
      };
    },
    methods: {
      showFile(fileList, title) {
        if (title) this.title = title;
        if (Array.isArray(fileList) && fileList.length > 0) {
          this.fileList = fileList;
          this.visible = true;
        } else {
          this.$message.warning('无可供预览附件');
        }
      }
    }
  };
</script>

<style></style>
