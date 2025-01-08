// 全局处理未捕获的promise异常
window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault();
  console.warn('未捕获的promise异常: ', event.reason || '');
});