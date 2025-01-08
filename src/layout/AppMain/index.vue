<template>
  <div
    v-loading="isLoading"
    :style="{ 'pointer-events': isLoading ? 'none' : 'auto' }"
    class="ion-bg-main-container flex-1 flex flex-col overflow-y-auto overflow-x-hidden"
  >
    <router-view #default="{ Component, route }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="cachedViews">
          <component :is="Component" :key="route.fullPath" />
        </keep-alive>
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import useViewsStore from '@/store/modules/views';
import { isLoading } from '@/utils/modal';
const { cachedViews } = useViewsStore();
</script>
