<template>
  <div class="flex-1 file-item" v-loading="file.status === 'uploading'">
    <el-preview-file
      v-if="file.status == 'success'"
      class="w-full h-full"
      ref="file-previer"
      :file="file"
      :show-file-name="false"
    >
    </el-preview-file>
    <span :class="['el-upload-list__item-actions', file.status == 'fail' ? 'fail' : '']">
      <!-- <span v-if="file.status == 'ready' || file.status == 'fail'" class="el-upload-list__item-upload">
        <el-icon @click="upload(file)"><Upload /></el-icon>
      </span> -->
      <span v-if="/jpg|jpeg|png|gif|bmp$/i.test(file.url)" class="el-upload-list__item-preview">
        <el-icon @click="view(file, $event)"><ZoomIn /></el-icon>
      </span>
      <span v-if="!disabled" class="el-upload-list__item-delete">
        <el-icon @click="remove(file)"><Delete /></el-icon>
      </span>
    </span>
  </div>
</template>

<script>
  export default {
    props: ['file', 'disabled', 'upload', 'remove'],
    methods: {
      view(file, $event) {
        this.$refs['file-previer'].clickHandler(file, $event);
      }
    }
  };
</script>

<style lang="scss" scoped>
  .file-item {
    --el-loading-spinner-size: 50px;
  }
  .fail {
    opacity: 1 !important;
    span {
      color: #f56c6c !important;
      display: inline-block !important;
    }
  }
</style>
