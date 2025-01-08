<template>
  <section class="h-screen w-screen min-w-[1280PX] flex flex-col">
    <navbar />
    <section class="flex flex-row flex-1 overflow-hidden">
      <sidebar />
      <main class="flex flex-col flex-1 overflow-hidden">
        <breadcrumb />
        <app-main />
      </main>
    </section>
  </section>
</template>

<script setup name="Layout">
import Sidebar from './Sidebar/index.vue';
import Breadcrumb from './Breadcrumb/index.vue';
import AppMain from './AppMain/index.vue';
import Navbar from './Navbar/index.vue';
</script>
