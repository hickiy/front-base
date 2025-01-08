import { useDict } from './dict'; // 字典工具
import { download } from './request'; // 下载工具
import * as formatNum from './formatNum'; // 数字格式化
import * as formatStr from './formatStr'; // 字符串格式化
import * as validate from './validate'; // 校验工具
import * as auth from './auth'; // 权限工具
import * as formatTime from './formatTime'; // 时间格式化`
import modal from './modal'; // 消息提示
import * as typeOf from './typeOf'; // 类型判断
import { toOa, toYsByUrl, toYsHome } from './jumper'; // oa审批单跳转

export default function (app) {
  app.config.globalProperties.$useDict = useDict;
  app.config.globalProperties.$download = download;
  app.config.globalProperties.$modal = modal;
  app.config.globalProperties.$formatNum = formatNum;
  app.config.globalProperties.$formatStr = formatStr;
  app.config.globalProperties.$validate = validate;
  app.config.globalProperties.$auth = auth;
  app.config.globalProperties.$formatTime = formatTime;
  app.config.globalProperties.$typeOf = typeOf;
  app.config.globalProperties.$toOa = toOa;
  app.config.globalProperties.$toYsByUrl = toYsByUrl;
  app.config.globalProperties.$toYsHome = toYsHome;
  app.config.globalProperties.parseTime = function () { };
  app.config.globalProperties.resetForm = function () { };
  app.config.globalProperties.handleTree = function () { };
  app.config.globalProperties.addDateRange = function () { };
  app.config.globalProperties.selectDictLabel = function () { };
  app.config.globalProperties.selectDictLabels = function () { };
}
