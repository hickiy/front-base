<template>
  <div v-if="!item.hidden">
    <template v-if="!Array.isArray(item.children)">
      <app-link :to="resolvePath(item.path, item.query)">
        <el-menu-item :index="item.path" :class="{ 'submenu-title-noDropdown': !isNest }">
          <svg-icon class="mr-2 text-base" :icon-class="item.meta.icon || (item.meta && item.meta.icon)"></svg-icon>
          <template #title>
            <span class="menu-title" :title="hasTitle(item.meta.title)">{{ item.meta.title }}</span>
          </template>
        </el-menu-item>
      </app-link>
    </template>
    <el-sub-menu :class="{ 'is-collapse': !isCollapse }" v-else ref="subMenu" :index="item.path" teleported>
      <template #title>
        <svg-icon class="mr-2 text-base" :icon-class="item.meta && item.meta.icon"></svg-icon>
        <span v-if="item.meta && isCollapse" class="menu-title" :title="hasTitle(item.meta.title)">{{
          item.meta.title
        }}</span>
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :isCollapse="true"
        class="nest-menu"
      />
    </el-sub-menu>
  </div>
</template>

<script setup>
import { isExternal } from '@/utils/validate';
import AppLink from './Link';

const props = defineProps({
  // route object
  item: {
    type: Object,
    required: true
  },
  isNest: {
    type: Boolean,
    default: false
  },
  isCollapse: {
    type: Boolean,
    default: false
  }
});

function resolvePath(routePath, routeQuery) {
  if (isExternal(routePath)) {
    return routePath;
  }
  if (routeQuery) {
    return { path: routePath, query: JSON.parse(routeQuery) };
  } else {
    return { path: routePath };
  }
}

function hasTitle(title) {
  if (title?.length > 5) {
    return title;
  } else {
    return '';
  }
}
</script>
<style scoped lang="scss">
.is-collapse:deep() {
  .el-sub-menu__title {
    padding-right: 0 !important;
  }
  .el-sub-menu__icon-arrow {
    right: 12px;
  }
}
</style>
