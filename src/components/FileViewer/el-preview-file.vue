<template>
  <div class="flex flex-col justify-end overflow-hidden">
    <el-image
      v-if="this.src"
      @click.capture="resolveFileExceptImg($event)"
      fit="contain"
      class="flex-1 cursor-pointer"
      ref="viewer"
      :src="src"
      :preview-src-list="previewSrc"
    ></el-image>
    <div v-if="fileList.length >= 2" class="ion-bg-file-name text-center text-white pt-1 pb-1 pl-2.5 pr-2.5">
      {{ `共${fileList.length}${previewSrc.length ? '张' : '个'}` }}
    </div>
    <div v-else-if="showFileName" class="ion-bg-file-name text-center text-white pt-1 pb-1 pl-2.5 pr-2.5 truncate" :title="fileName">
      {{ fileName }}
    </div>
    <FileViewer ref="file-viewer"></FileViewer>
  </div>
</template>

<script>
  import { getFrameByPageOfPdf } from '@/api/common.js';
  import zipIcon from '@/assets/svg/zip.svg';
  import xlsIcon from '@/assets/images/excel.png';

  // 1-image，2-pdf, 3-zip, 4-ofd, 5-xls
  const IMAGE = 1,
    PDF = 2,
    ZIP = 3,
    XLS = 5;
  export default {
    name: 'el-preview-file',
    props: {
      // 文件对象
      file: {
        type: [String, Object],
        required: true
      },
      // 文件列表
      fileList: {
        type: Array,
        default: () => []
      },
      // 是否显示文件名
      showFileName: {
        type: Boolean,
        default: true
      },
      // 标题
      title: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        src: '', // 视图url
        fileType: null,
        fileName: '', // 文件名
        fileUrl: '', // 文件url
        previewSrc: [] // 预览图片列表
      };
    },
    beforeDestroy() {
      URL.revokeObjectURL(this.url);
    },
    watch: {
      file: {
        deep: true,
        immediate: true,
        handler() {
          this.init();
        }
      }
    },
    methods: {
      init() {
        if (!this.file) return;
        const pdfReg = /pdf$/i;
        const zipReg = /zip$/i;
        const xlsReg = /xlsx?$/i;
        if (typeof this.file == 'string') {
          this.fileUrl = this.file;
        } else {
          const { fileUrl, url } = this.file;
          this.fileUrl = fileUrl || url;
        }
        this.fileName = this.fileUrl.split('/').pop();
        if (pdfReg.test(this.fileName)) {
          this.renderPdf(this.fileUrl);
          this.fileType = PDF;
        } else if (zipReg.test(this.fileName)) {
          this.src = zipIcon;
          this.fileType = ZIP;
        } else if (xlsReg.test(this.fileName)) {
          this.src = xlsIcon;
          this.fileType = XLS;
        } else {
          this.src = this.fileUrl;
          this.fileType = IMAGE;
        }
      },
      clickHandler() {
        this.$refs.viewer.$el.firstElementChild?.click?.();
      },
      // 处理点击预览文件
      resolveFileExceptImg(ev) {
        if (this.fileList.length > 1) {
          if (this.fileList.every((item) => /jpg|jpeg|png|gif|bmp$/i.test(item.fileUrl || item.url))) {
            this.previewSrc = this.fileList.map((item) => item.fileUrl || item.url);
            return;
          } else {
            this.$refs['file-viewer'].showFile(this.fileList, this.title);
            ev.stopPropagation();
            return;
          }
        }
        if (this.fileType == XLS || this.fileType == ZIP) {
          this.downloadFile(this.fileUrl);
          ev.stopPropagation();
          return;
        }
        if (this.fileType == PDF) {
          this.viewPdf(this.fileUrl);
          ev.stopPropagation();
          return;
        }
        this.previewSrc.push(this.src);
      },
      // 预览pdf文件
      viewPdf(href) {
        window.open(href, '_plant');
      },
      // 下载文件
      downloadFile(url) {
        this.$download(url, {
          baseURL: '/',
          fileName: this.fileName
        });
      },
      // 渲染pdf文件
      renderPdf(pdfPath) {
        if (!pdfPath) return console.warn('文件路径不存在');
        getFrameByPageOfPdf({ url: pdfPath }).then((res) => {
          this.src = URL.createObjectURL(res);
        });
      }
    }
  };
</script>

<style lang="scss" scoped></style>
