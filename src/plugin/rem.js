/**
 * 导入设计图宽度和基础 REM 单位
 * uiDsingWidth 是设计图的宽度，默认值是1920
 * baseRemUnit 是基础 rem 单位，用于计算实际rem值
 */
import { uiDsingWidth, baseRemUnit } from '@/config.js'
import { debounce } from '@/utils/debounce.js'

const resizeHandler = function () {
  let doc = document.documentElement;
  let vw = window.innerWidth ?? document.documentElement.clientWidth ?? document.body.clientWidth;
  vw = Math.min(vw, 1920); // 最大宽度限制
  vw = Math.max(vw, 1280); // 最小宽度限制
  let scale = vw / uiDsingWidth;
  let size = Math.floor(baseRemUnit * scale);
  doc.style.fontSize = size + 'px';
};

resizeHandler();
window.addEventListener('resize', debounce(resizeHandler))
