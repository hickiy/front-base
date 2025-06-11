// element-plus/icons-vue
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
// svg图标组件
import SvgIcon from './SvgIcon/index.vue';
// 富文本组件
import Editor from './Editor/index.vue';
// 自定义树选择组件
import TreeSelect from './TreeSelect/index.vue';
// 字典标签组件
import DictTag from './DictTag/index.vue';
// 批量附件查看组件
import FileViewer from './FileViewer/index.vue';
// 文件预览组件
import PreviewFile from './FileViewer/el-preview-file.vue';
// echarts 组件
import Echarts from './Echarts/index.vue';
// 列表表头图表组件
import TableHeadChart from './TableHeadChart/index.vue';
// 系统管理分页组件
import Pagination from './Pagination/index.vue';
export default function (app) {
  // 全局自定义组件挂载
  app.component('DictTag', DictTag);
  app.component('TreeSelect', TreeSelect);
  app.component('Editor', Editor);
  app.component('FileViewer', FileViewer);
  app.component('ElPreviewFile', PreviewFile);
  app.component('SvgIcon', SvgIcon);
  app.component('Echarts', Echarts);
  app.component('TableHeadChart', TableHeadChart);
  app.component('Pagination', Pagination);
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
  }
}
