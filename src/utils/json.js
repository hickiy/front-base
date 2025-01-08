/**
 * @description: json转换中的第二个参数，实现对json按照制定的深度进行序列化
 * @param {Number} deep 深度
 * @return {Function} 序列化函数
 * @example
 * const json = {
 *  a: 1,
 *  b: [],
 *  d: { e: 3 }
 * }
 * const deep = 1
 * const str = JSON.stringify(json, jsonDeep(deep))
 * console.log(str) // {"a":1,"d":"null","b":"null"}
 */
export function jsonDeep(deep) {
  return function (key, value) {
    if (key && typeof value === 'object' && deep > 0) {
      return JSON.stringify(value, jsonDeep(deep - 1))
    } else {
      return deep ? value : null;
    }
  }
}