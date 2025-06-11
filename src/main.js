import '@/assets/styles/element-plus.scss'; // element-plus theme
import '@/assets/styles/index.scss'; // global css
import '@/assets/styles/tailwind.css'; // tailwindcss
import 'nprogress/nprogress.css'; // progress bar style


import { createApp } from 'vue'; // vue3
import ElementPlus from '@/element-plus'; // element-plus

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
app.use(ElementPlus);
// 应用挂载
app.mount('#app');

