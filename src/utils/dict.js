import { getDicts } from '@/api/dict';

// 字典缓存
const cachedDict = {};

/**
 * @description: 对字典数据进行修剪
 * @param {*} dictData
 * @returns
 */
function pruneDict(dictData) {
  return dictData.map((item) => ({
    label: item.dictLabel,
    value: item.dictValue,
  }));
}

/**
 * @description 获取字典数据
 * @param {String} type 字典类型
 * @returns {Array} 字典数据
 */
export function useDict(type) {
  const result = ref([]);
  if (cachedDict[type]) {
    result.value = cachedDict[type];
  } else {
    getDicts(type).then(res => {
      result.value = cachedDict[type] = pruneDict(res.data)
    });
  }
  return result;
}
