import { ElMessage } from 'element-plus';
import NProgress from 'nprogress';
import { getToken } from '@/utils/cookies';
import { isRelogin } from '@/utils/request';
import useUserStore from '@/store/modules/user';
import usePermissionStore from '@/store/modules/permission';
import useViewsStore from '@/store/modules/views';

NProgress.configure({ showSpinner: false });

const whiteList = ['/login', '/register'];
let breadItemId = 0;
let componentId = 0;

export function beforeEach(to, from, next) {
  NProgress.start();
  if (getToken()) {
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' });
      NProgress.done();
    } else {
      if (useUserStore().roles.length === 0) {
        isRelogin.show = true;
        // 判断当前用户是否已拉取完user_info信息
        useUserStore()
          .getInfo()
          .then(() => {
            isRelogin.show = false;
            usePermissionStore()
              .generateRoutes()
              .then(() => {
                next({ ...to, replace: true }); // hack方法 确保addRoutes已完成
              });
          })
          .catch((err) => {
            useUserStore()
              .logOut()
              .then(() => {
                ElMessage.error(err);
                next({ path: '/' });
              });
          });
      } else {
        next();
      }
    }
  } else {
    // 没有token
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next();
    } else {
      next('/login'); // 否则全部重定向到登录页
      NProgress.done();
    }
  }
};

export function beforeResolve(to, from, next) {
  const { breadcrumbs, cachedViews } = useViewsStore();
  const toComponent = to.matched[to.matched.length - 1]?.components;
  const fromComponent = from.matched[from.matched.length - 1]?.components;
  const breadItemIndex = breadcrumbs.findLastIndex((crumb) => crumb.fullPath == to.fullPath);
  if (breadItemIndex > -1) {
    // 如果面包屑中已经存在，则视为回退，删除面包屑并删除缓存
    breadcrumbs.splice(breadItemIndex + 1, breadcrumbs.length - breadItemIndex);
    /**
     * 对于匹配到的组件，从breadcrumb中获得缓存时使用的componentName, 并写入到匹配到的组件中
     * 使用componentName检查是否被缓存，如果被缓存则删除缓存
     * 对于缓存的页面，检查是否存在activated方法，如果存在则调用activated方法
     * 用于处理一些回退后需要重新执行的操作
     */
    const name = breadcrumbs[breadItemIndex].componentName ?? toComponent?.default.name;
    if (name) {
      toComponent.default.name = name;
    }
    const cachedViewIndex = cachedViews.findIndex((view) => view == name);
    if (cachedViewIndex > -1) {
      cachedViews.splice(cachedViewIndex + 1, cachedViews.length - cachedViewIndex);
      if (breadcrumbs[breadItemIndex]?.activated) {
        breadcrumbs[breadItemIndex].activated();
      }
    }
  } else {
    // 如果面包屑中不存, 则根据路由类型确定是重置还是前进
    if (to.meta.routeType) {
      // 如果是菜单或者目录，则视为重置，删除所有面包屑, 删除所有缓存的视图
      const levelList = [];
      let meta = to.meta;
      while (meta) {
        const { parent, ...rest } = meta;
        levelList.unshift({ ...rest, fullPath: to.fullPath, path: to.path, id: breadItemId++ });
        meta = parent?.meta;
      }
      breadcrumbs.splice(0, breadcrumbs.length, ...levelList);
      cachedViews.splice(0, cachedViews.length);
    } else {
      // 否则视为前进
      /**
       * 对离开的路径进行处理
       * 首先检查fromComponent是否具有一个名称
       * 其次检查to.query查询参数是否具有needCache标记，如果不存在则默认缓存，
       * 如果needCache为false，则不缓存
       * 如果需要缓存，则可以通过query参数设置设置一个activated方法，用于处理一些回退后需要重新执行的操作
       * 如果存在activated则将activated写入到对应的breadcrumb中
       * 从to.query中删除activated，避免在在url中显示
       */
      const fromName = fromComponent?.default.name;
      const needCache = to.query.needCache ?? true;
      if (fromName && needCache) {
        if (breadcrumbs.length > 0 && to.query?.activated && typeof to.query.activated == 'function') {
          breadcrumbs[breadcrumbs.length - 1].activated = to.query.activated;
          Reflect.deleteProperty(to.query, 'activated');
        }
        cachedViews.push(fromName);
      }
      /**
       * 这里由于相同的路由可能不同的参数，相当于相同组件的不同实例
       * 不同路由也有可能复用相同的组件，相当于相同组件的不同实例
       * 因此需要对组件名称进行处理
       *
       * 首先检查toComponent是否具有一个名称
       * 其次检查toComponent是否已存在一被缓存的实例，如果不存在直接将名称写入到breadcrumb中
       * 如果存在则将组件进行一层浅拷贝，浅拷贝是为了防止修改组件名称影响到缓存的组件实例
       * 浅拷贝后将组件后加上一个唯一的id，最后将组件名称写入到meta中
       * meta中存储的名称，在回退复用缓存时用于恢复到之前的名称
       */
      const toName = toComponent?.default.name;
      if (toName) {
        const cachedViewIndex = cachedViews.findIndex((view) => view == toName);
        if (cachedViewIndex > -1) {
          toComponent.default = {
            ...toComponent.default,
            name: `${toName}-${componentId++}`
          };
        }
        to.meta.componentName = toComponent?.default.name ?? toName;
      }
      /**
       * 对面包屑进行处理
       * 可以通过query参数设置面包屑标题
       * 如果存在crumbTitle则设置面包屑标题，
       * 删除to.query中的crumbTitle，避免在url中显示
       * 最后生成新的面包屑并写入到breadcrumbs中
       */
      if (to?.query.crumbTitle) {
        to.meta.title = to.query.crumbTitle;
        Reflect.deleteProperty(to.query, 'crumbTitle');
      }
      const { parent, ...rest } = to.meta;
      breadcrumbs.push({ ...rest, fullPath: to.fullPath, path: to.path, query: to.query, id: breadItemId++ });
    }
  }
  next();
}

export function afterEach() {
  NProgress.done();
};
