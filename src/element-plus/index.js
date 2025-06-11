import * as ElementPlus from 'element-plus';
import MyInput from './el-input';
import MyUpload from './el-upload';
import MyTable from './el-table';
import MyTableColumn from './el-table/column';
import MyForm from './el-form';
import MyLoading from './el-loading';
import MyPagination from './el-pagination';
// 重写ElementPlus的install方法，将自定义的组件也注册到Vue中
const { ElInput, ElUpload, ElTable, ElTableColumn, ElForm, ElLoading, ElPagination, ...component } = ElementPlus;
export default {
  install(app, options) {
    if (app[ElementPlus.INSTALLED_KEY]) return;
    app[ElementPlus.INSTALLED_KEY] = true;
    Object.keys(component).forEach((key) => {
      if (/^El.+/.test(key) && component[key].install) {
        app.use(component[key]);
      }
    });
    app.use(MyLoading);
    app.component('ElInput', MyInput);
    app.component('ElUpload', MyUpload);
    app.component('ElTable', MyTable);
    app.component('ElTableColumn', MyTableColumn);
    app.component('ElForm', MyForm);
    app.component('ElFormItem', ElForm.FormItem);
    app.component('ElPagination', MyPagination);
    if (options) ElementPlus.provideGlobalConfig(options, app, true);
  },
  version: ElementPlus.version
};
