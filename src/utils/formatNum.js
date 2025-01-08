/**
 * @description: 格式化数字为三位分节法
 * @param {Number} num // 数字
 * @param {Number} precision // 精度
 * @param {Object} [opt] // 配置项
 * @param {String} opt.separator // 分隔符
 * @param {Number} opt.decimalSeparator // 数字分割位数
 * @returns {String} // 格式化后的数字
 */
export const numSection = (num, precision = 0, { separator = ',', decimalSeparator = 3 } = {}) => {
  if (typeof precision !== 'number') throw new Error('precision must be a number');
  // 检查是否为数字
  if (/^\d+(\.\d+)?$/.test(num)) {
    num = Number(num);
    // 保留小数点后几位
    if (precision > 0) {
      const factor = Math.pow(10, precision);
      const tempNumber = num * factor;
      const roundedTempNumber = Math.round(tempNumber);
      num = roundedTempNumber / factor;
    }
    if (num > 0) num = num.toFixed(precision);
    // 分节法
    const numArr = num.toString().split('.');
    const reg = new RegExp(`(\\d+?)(?=(?:\\d{${decimalSeparator}})+$)`, 'g');
    numArr[0] = numArr[0].replace(reg, `$1${separator}`);
    return numArr.join('.');
  } else {
    return num;
  }
};
