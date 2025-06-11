import { useDict } from './dict'; // 字典工具
import { download } from './request'; // 下载工具
import * as formatNum from './formatNum'; // 数字格式化
import * as formatStr from './formatStr'; // 字符串格式化
import * as validate from './validate'; // 校验工具
import * as auth from './auth'; // 权限工具
import * as formatTime from './formatTime'; // 时间格式化`
import modal from './modal'; // 消息提示
import * as typeOf from './typeOf'; // 类型判断
import { trackEvent } from '@/utils/trackEvent'; // 埋点
import { getConfigKey } from "@/api/system/config"; // 获取配置
import { toOa, toYsByUrl, toYsHome } from './jumper'; // oa审批单跳转
import { addDateRange, handleTree, parseTime, resetForm, selectDictLabel, selectDictLabels } from "@/utils/sys";

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
  app.config.globalProperties.$trackEvent = trackEvent;
  app.config.globalProperties.$getConfigKey = getConfigKey;
  app.config.globalProperties.handleTree = handleTree;
  app.config.globalProperties.resetForm = resetForm;
  app.config.globalProperties.addDateRange = addDateRange;
  app.config.globalProperties.selectDictLabel = selectDictLabel;
  app.config.globalProperties.selectDictLabels = selectDictLabels;
  app.config.globalProperties.parseTime = parseTime;
}
