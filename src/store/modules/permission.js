import auth from '@/utils/auth';
import router, { constantRoutes, staticRoutes } from '@/router';
import { getRouters } from '@/api/menu';
import Layout from '@/layout/index';
import ParentView from '@/layout/ParentView/index.vue';
import InnerLink from '@/layout/InnerLink/index.vue';
import { isHttp } from '@/utils/validate';

// 匹配views里面所有的.vue文件
const modules = import.meta.glob('./../../views/**/*.vue');

const usePermissionStore = defineStore('permission', {
  state: () => ({
    sidebarRouters: []
  }),
  actions: {
    setSidebarRouters(routes) {
      this.sidebarRouters = routes.map((route) => {
        if (route.meta) {
          return route
        } else {
          return route.children?.[0] ?? route
        }
      });
    },
    generateRoutes(roles) {
      // 向后端请求路由数据
      return getRouters().then((res) => {
        // 基于系统appKey过滤菜单
        let routes = res.data.filter(route => route.moduleId == 1);
        let dynamicRoutes = filterAsyncRouter(routes);
        this.setSidebarRouters(constantRoutes.concat(dynamicRoutes));

        // 静态路由根据roles权限过滤并注册到default路由下
        // const asyncRoutes = filterStaticRoutes(staticRoutes);
        const asyncRoutes = staticRoutes; // 对于静态的详情页暂不做权限控制（有需求在进行处理）
        asyncRoutes.forEach((route) => {
          router.addRoute('default', route);
        });

        // 动态路由根据roles权限过滤并注册
        dynamicRoutes.forEach((route) => {
          if (!isHttp(route.path)) {
            router.addRoute(route);
          }
        });
      });
    }
  }
});

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(children, parent) {
  return children.map((route) => {
    // 标识路由是否是目录
    if (route.meta && Array.isArray(route.children) && route.children.length) {
      route.meta.routeType = 'folder';
    } else if (route.meta) {
      route.meta.routeType = 'menu';
      parent?.meta && (route.meta.icon = 'menu-default');
    }
    // 在meta中记录父级路由
    if (parent) {
      route.meta.parent = parent;
    }
    // 处理子路由
    if (route.children) {
      route.children = filterAsyncRouter(route.children, route);
    }
    // 根据路由类型匹配对于的布局容器组件
    if (route.component) {
      if (route.component === 'Layout') {
        route.component = Layout;
      } else if (route.component === 'ParentView') {
        route.component = ParentView;
      } else if (route.component === 'InnerLink') {
        route.component = InnerLink;
      } else {
        route.component = loadView(route.component);
      }
    }
    // 处理路由参数
    route.props = (route) => route.query;
    return route;
  });
}

// 静态配置的路由遍历，验证是否具备权限
export function filterStaticRoutes(routes) {
  const res = [];
  routes.forEach((route) => {
    if (route.permissions) {
      if (auth.hasPermiOr(route.permissions)) {
        res.push(route);
      }
    } else if (route.roles) {
      if (auth.hasRoleOr(route.roles)) {
        res.push(route);
      }
    }
  });
  return res;
}

export const loadView = (view) => {
  let res;
  for (const path in modules) {
    const dir = path.split('views/')[1].split('.vue')[0];
    if (dir === view) {
      res = () => modules[path]();
    }
  }
  return res;
};

export default usePermissionStore;
