import router from '@/router/index.js'
import { useSessionStorage } from '@vueuse/core'
const useTagsViewStore = defineStore(
  'views',
  {
    state: () => ({
      breadcrumbs: useSessionStorage('smt-sys-pc_breadcrumbs', []), // 面包屑
      cachedViews: [], // 缓存的视图, 用于keep-alive
    }),
    actions: {
      // 避免调用router.back(), 在刷新页面后，再次调用back会失效
      // 在具体的业务逻辑中调用router.push()方法, 对于默认情况下携带了参数的路由, 需要在返回时传递参数
      // 这就造成了参数需要来回携带，代码冗余，不利于维护
      // 因此, 通过面包屑中记录的完整路径，在此处实现工程级别的返回功能
      back() {
        router.push({ path: this.breadcrumbs[this.breadcrumbs.length - 2].fullPath })
      },
    },
  })

export default useTagsViewStore
