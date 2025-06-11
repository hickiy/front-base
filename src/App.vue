<template>
  <el-config-provider :locale="zhCn" :empty-values="[null, undefined]" size="large">
    <router-view />
  </el-config-provider>
</template>

<script setup>
  import zhCn from 'element-plus/es/locale/lang/zh-cn';
</script>
