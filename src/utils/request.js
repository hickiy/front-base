import axios from 'axios';
import { saveAs } from 'file-saver';
import { ElMessageBox, ElMessage, ElLoading } from 'element-plus';
import { getToken } from '@/utils/cookies';
import { jsonDeep } from '@/utils/json';
import errorCode from '@/utils/errorCode';
import useUserStore from '@/store/modules/user';

// loading实例
let loadingInstance;
// 是否显示重新登录
let isRelogin = { show: false };
// 已发出的请求列表，防止重复提交
let pendedRes = {};
// 默认的content-type
axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';
// 创建axios实例
const service = axios.create({
  // axios中请求配置有paramsSerializer选项，可以序列化params参数
  paramsSerializer: {
    indexes: null, // 禁用索引
    arrayFormat: 'repeat' // 设置数组格式化方式
  },
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: import.meta.env.VITE_APP_BASE_API,
  // 请求超时时间30分钟
  timeout: 30 * 60 * 1000
});

// request拦截器
service.interceptors.request.use(
  (config) => {
    const headers = config.headers ?? {};
    // 是否需要设置 token, 默认为true, 可以在请求中设置isNeedToken: false来取消
    const isNeedToken = headers.isNeedToken ?? true;
    const token = getToken();
    if (isNeedToken && token) {
      config.headers['Authorization'] = `Bearer ${token}`; // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    // 是否需要防止数据重复提交，默认为true, 可以在请求中设置isCheckRepeat: false来取消
    const isCheckRepeat = headers.isCheckRepeat ?? true;
    // 参数序列化深度
    const deep = headers.deep ?? 1;
    // 只对post, put, patch请求进行防重复提交处理
    const defaultMethodReg = /^(post|patch|put)$/i;
    if (isCheckRepeat && defaultMethodReg.test(config.method)) {
      // 生成请求唯一标识, 用于在响应拦截器中删除pendedRes中的请求记录
      let key = config.url;
      if (config.params) {
        key += `-${JSON.stringify(config.params, jsonDeep(deep))}`;
      }
      if (config.data) {
        key += `-${JSON.stringify(config.data, jsonDeep(deep))}`;
      }
      if (pendedRes[key]) {
        return Promise.reject({
          message: '请勿重复提交',
          config: config
        });
      } else {
        config._requestKey = key;
        pendedRes[key] = true;
      }
    }
    return config;
  }
);

// 响应拦截器
service.interceptors.response.use(
  (res) => {
    // 删除pendedRes中的请求记录
    if (res.config?._requestKey) {
      Reflect.deleteProperty(pendedRes, res.config._requestKey);
    }
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200;
    // 获取错误信息
    const msg = res.data.msg || errorCode[code] || errorCode['default'];
    if (code === 200) {
      return Promise.resolve(res.data);
    } else if (code === 401) {
      if (!isRelogin.show) {
        isRelogin.show = true;
        ElMessageBox.confirm('登录状态已过期，您可以继续留在该页面，或者重新登录', '系统提示', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            isRelogin.show = false;
            useUserStore()
              .logOut()
              .then(() => {
                location.href = '/index';
              });
          })
          .catch(() => {
            isRelogin.show = false;
          });
      }
      return Promise.reject('无效的会话，或者会话已过期，请重新登录。');
    } else {
      ElMessage({ message: msg, type: 'error' });
      return Promise.reject(msg);
    }
  },
  (error) => {
    // 删除pendedRes中的请求记录
    if (error.config?._requestKey) {
      Reflect.deleteProperty(pendedRes, error.config._requestKey);
    }
    let { message } = error;
    if (message == 'Network Error') {
      message = '后端接口连接异常';
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时';
    } else if (message.includes('Request failed with status code')) {
      message = '系统接口' + message.substr(message.length - 3) + '异常';
    }
    ElMessage({ message: message, type: 'error', duration: 5 * 1000 });
    return Promise.reject(error);
  }
);

// 通用下载方法
function download(url, opt) {
  loadingInstance = ElLoading.service({
    customClass: 'download-file-loading',
    text: '正在下载数据，请稍候',
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.7)'
  });
  const config = {
    url,
    method: opt.method || 'get',
    headers: opt.headers,
    data: opt.data,
    params: opt.params,
    responseType: opt.responseType || 'blob'
  };
  // 主要用于直接从文件服务器下载文件，不需要通过后台接口
  if (opt.baseURL != undefined) {
    config.baseURL = opt.baseURL;
  }
  return service(config)
    .then((res) => {
      ElMessage.success(`下载成功: ${opt.fileName}`);
      saveAs(res, opt.fileName);
    })
    .catch((e) => {
      ElMessage.error('下载文件出现错误，请稍后重试');
    })
    .finally(() => {
      loadingInstance.close();
    });
}

export {
  loadingInstance, // loading实例
  isRelogin, // 是否显示重新登录
  pendedRes, // 已发出的请求列表，防止重复提交
  download // 通用下载方法
}
export default service;
