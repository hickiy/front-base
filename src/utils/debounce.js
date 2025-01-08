export function debounce(fn, wait) {
  var timerId = null
  return function (...args) {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(this, args)
    }, wait);
  }
}

