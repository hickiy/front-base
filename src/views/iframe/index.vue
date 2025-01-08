<!-- hickey 2024/08/01 -->
<template>
  <div class="flex-1 overflow-hidden">
    <iframe :src="src" width="100%" height="100%" frameborder="0" scrolling="auto"></iframe>
  </div>
</template>

<script>
import { getToken } from '@/utils/cookies';
export default {
  props: {
    url: {
      type: String,
      required: true
    }
  },
  computed: {
    src() {
      const token = getToken();
      let targetUrl = this.url;
      const isBi = this.url.includes('bi');
      if (isBi) {
        let connectStr = this.url.includes('?') ? '&' : '?';
        targetUrl = `${decodeURIComponent(this.url)}${connectStr}token=${token}`;
      }
      return targetUrl;
    }
  }
};
</script>

<style scoped lang="scss"></style>
