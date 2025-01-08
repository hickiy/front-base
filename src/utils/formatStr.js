/**
 * 字符串截断
 * @param {String | Number} str 字符串
 * @param {Object} [opt] 配置项
 * @param {Number} opt.startNum 开始截取的长度
 * @param {String} opt.separator 中间的分隔符
 * @param {Number} opt.endNum 结尾截取的长度
 * @returns {String} 截断后的字符串
 */
export const strMask = (str, { startNum = 3, separator = '***', endNum = 4 } = {}) => {
  if (str == null) return '';
  const len = str.length;
  if (len <= startNum + endNum) return str;
  return str.substring(0, startNum) + separator + str.substring(len - endNum);
};
