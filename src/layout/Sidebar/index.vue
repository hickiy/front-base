<template>
  <aside
    class="sidebar-container sidebar-wrap h-full"
    :class="{ 'has-logo': showLogo }"
    :style="{
      backgroundColor: variables.menuBackground,
      width: !isCollapse ? variables.sideBarWidth : variables.sideBarMiniWidth
    }"
  >
    <el-scrollbar class="theme-dark" wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBackground"
        :text-color="variables.menuColor"
        :unique-opened="true"
        :active-text-color="theme"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item
          v-for="(route, index) in sidebarRouters"
          :key="route.path + index"
          :item="route"
          :base-path="route.path"
          :isCollapse="!isCollapse"
        />
      </el-menu>
    </el-scrollbar>
  </aside>
</template>

<script setup name="Sidebar">
  import SidebarItem from './SidebarItem';
  import variables from '@/assets/styles/variables.module.scss';
  import useAppStore from '@/store/modules/app';
  import useSettingsStore from '@/store/modules/app';
  import usePermissionStore from '@/store/modules/permission';
  import useViewsStore from '@/store/modules/views';

  const appStore = useAppStore();
  const settingsStore = useSettingsStore();
  const permissionStore = usePermissionStore();
  const { breadcrumbs } = useViewsStore();

  const sidebarRouters = computed(() => permissionStore.sidebarRouters);
  const showLogo = computed(() => settingsStore.sidebarLogo);
  const theme = computed(() => settingsStore.theme);
  const isCollapse = computed(() => !appStore.sidebar.opened);

  const activeMenu = computed(() => {
    return breadcrumbs[0]?.path;
  });
</script>
<style scoped lang="scss">
  .sidebar-wrap:deep() {
    .el-menu-item {
      &.is-active {
        color: #fff;
        background-color: #0e36ac;
        &:hover {
          background-color: #282e3c !important;
        }
      }
    }
  }
  .sidebar-wrap {
    transition: width 0.28s;
    box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
  }
</style>
