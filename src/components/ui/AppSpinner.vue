<script setup lang="ts">
import { Spinner } from "@/components/ui/spinner";

defineProps<{
  show: boolean;
  size?: "sm" | "md" | "lg";
}>();
</script>

<template>
  <div v-if="show" class="flex items-center justify-center">
    <Spinner :size="size ?? 'md'" />
  </div>
</template>
