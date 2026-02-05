<template>
  <div class="app-root flex h-screen flex-col">
    <!-- Header -->
    <Header />

    <!-- Scrollable Page Content -->
    <main class="flex-1 overflow-y-auto px-2 py-2 md:px-3 md:py-3 no-scrollbar">
      <div class="mx-0 w-full">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Header from "@/layout/HeaderLayout.vue";
import { RouterView } from "vue-router";
</script>

<style>
/* Hide scrollbar but keep scroll */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
