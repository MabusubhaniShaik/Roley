<template>
  <div
    class="relative overflow-hidden rounded-xl bg-black shadow-lg hover:scale-105 transform transition-all duration-300 cursor-pointer"
    @click="emit('select', character)"
  >
    <!-- Background Image -->
    <img
      :src="character.images.md"
      :alt="character.name"
      class="h-56 w-full object-cover"
      ref="imgRef"
      crossOrigin="anonymous"
    />

    <!-- Overlay -->
    <div class="absolute inset-0 bg-black/40"></div>

    <!-- Content -->
    <div
      class="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
    >
      <!-- Name -->
      <p class="text-white font-bold text-sm truncate">
        {{ character.name }}
      </p>

      <!-- Publisher -->
      <p class="text-xs text-white/70 truncate">
        {{ character.biography.publisher || "-" }}
      </p>

      <!-- Alignment Badge -->
      <Badge
        v-if="alignmentColor"
        class="mt-1 text-[10px] font-semibold"
        :style="{ backgroundColor: alignmentColor, color: '#fff' }"
      >
        {{ character.biography.alignment || "-" }}
      </Badge>
    </div>

    <!-- Hover Stats -->
    <div
      class="absolute top-0 left-0 w-full h-full p-3 flex flex-col justify-end opacity-0 hover:opacity-100 transition-opacity duration-300"
    >
      <div class="bg-black/70 rounded-lg p-2 space-y-1 text-xs text-white">
        <p>Intelligence: {{ character.powerstats.intelligence }}</p>
        <p>Strength: {{ character.powerstats.strength }}</p>
        <p>Speed: {{ character.powerstats.speed }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Character } from "@/services/superhero.service";
import { ref, onMounted, watch } from "vue";
import ColorThief from "colorthief";
import { Badge } from "@/components/ui/badge";

const props = defineProps<{ character: Character }>();
const character = props.character;

const emit = defineEmits<{
  select: [character: Character];
}>();

const imgRef = ref<HTMLImageElement | null>(null);
const alignmentColor = ref<string | null>(null);

const extractColor = () => {
  if (!imgRef.value) return;

  const colorThief = new ColorThief();
  try {
    const rgb = colorThief.getColor(imgRef.value);
    alignmentColor.value = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  } catch {
    alignmentColor.value = "#6B7280";
  }
};

onMounted(() => {
  if (imgRef.value?.complete) extractColor();
  else imgRef.value?.addEventListener("load", extractColor);
});

watch(
  () => character.images.md,
  () => {
    if (imgRef.value?.complete) extractColor();
  }
);
</script>
