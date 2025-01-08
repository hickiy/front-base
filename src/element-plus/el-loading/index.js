import { ElLoading } from 'element-plus'
import svg from '@/assets/images/ion_loading.svg?raw'

export default {
  install(app) {
    ElLoading.directive.created = function (el) {
      const originalGetAttribute = el.getAttribute
      el.getAttribute = function (name) {
        const value = originalGetAttribute.call(this, name)
        if (name == 'element-loading-svg') {
          return value ?? svg
        }
        if (name == 'element-loading-custom-class') {
          return value ?? 'ion-loading'
        }
        return value
      }
    }
    let originalService = ElLoading.service
    ElLoading.service = function (options) {
      return originalService({
        ...options,
        svg: options.svg || svg,
        customClass: options.customClass || 'ion-loading'
      })
    }
    app.directive('loading', ElLoading.directive)
    app.config.globalProperties.$loading = ElLoading.service
  }
}


