import '@/assets/styles/element-plus.scss'; // element-plus theme
import '@/assets/styles/index.scss'; // global css
import 'uno.css'; // uno.css
import 'nprogress/nprogress.css'; // progress bar style


import { createApp } from 'vue'; // vue3
import ElementPlus from '@/element-plus'; // element-plus
import zhCn from 'element-plus/dist/locale/zh-cn.mjs' // element-plus 中文

import App from './App.vue'; // app
import store from './store'; // pinia
import router from './router'; // router
import component from './components'; // global component
import directive from './directive'; // directive
import utils from './utils'; // utils
import './plugin/index'; // effect

// 创建应用
const app = createApp(App);
// 启用路由
app.use(router);
// 启用状态管理
app.use(store);
// 全局组件挂载
app.use(component);
// 指令挂载
app.use(directive);
// 工具挂载
app.use(utils);
// element-plus 全量引入
app.use(ElementPlus, {
  size: 'large', // 支持 large、default、small
  locale: zhCn // element-plus 中文
});
// 应用挂载
app.mount('#app');

