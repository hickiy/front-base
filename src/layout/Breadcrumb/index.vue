<template>
  <el-breadcrumb class="app-breadcrumb w-full ml-15px" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="item.id">
        <svg-icon v-if="item.routeType == 'folder'" class="mr-1 text-base align-middle icon" :icon-class="item.icon" />
        <span v-if="item.routeType === 'folder' || index == breadcrumbs.length - 1" class="no-redirect">{{
          item.title
        }}</span>
        <a v-else @click.prevent="handleLink(item)" class="have-link">{{ item.title }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script setup name="Breadcrumb">
import useViewsStore from '@/store/modules/views';
const router = useRouter();
const { breadcrumbs } = useViewsStore();
function handleLink(item) {
  if (item.routeType == 'folder') return;
  router.push({ path: item.path, query: item.query });
}
</script>

<style lang="scss" scoped>
.app-breadcrumb {
  font-size: 14px;
  line-height: 40px;
  background: #fafafa;
  .icon {
    color: #86909c;
  }
  .no-redirect {
    color: #86909c;
    cursor: text;
  }
  .have-link {
    color: #0e36ac;
    &:hover {
      color: #092794;
      font-weight: bold !important;
    }
  }
}
</style>
