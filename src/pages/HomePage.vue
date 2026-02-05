<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue";
import { Input } from "@/components/ui/input";
import { getAllCharacters, type Character } from "@/services/superhero.service";
import CharacterCard from "@/components/CharacterCard.vue";
import AppSpinner from "@/components/ui/AppSpinner.vue";
import CharacterDrawer from "@/components/CharacterDrawerComponent.vue";

const drawerOpen = ref(false);
const selectedCharacter = ref<Character | null>(null);

const openDrawer = (character: Character) => {
  selectedCharacter.value = character;
  drawerOpen.value = true;
};

const characters = ref<Character[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const search = ref("");
const searchLoading = ref(false);

// Fetch all characters on mount
onMounted(async () => {
  loading.value = true;
  try {
    characters.value = await getAllCharacters();
  } catch {
    error.value = "Failed to load characters";
  } finally {
    loading.value = false;
  }
});

// Filter characters by name or fullName
const filteredCharacters = computed(() => {
  if (!search.value.trim()) return characters.value;

  const query = search.value.toLowerCase();
  return characters.value.filter(
    (c) =>
      c.name.toLowerCase().includes(query) ||
      c.biography?.fullName?.toLowerCase().includes(query)
  );
});

// Search spinner debounce
watch(search, (val, oldVal) => {
  if (val !== oldVal) {
    searchLoading.value = true;
    setTimeout(() => (searchLoading.value = false), 200);
  }
});
</script>

<template>
  <div class="w-full space-y-4">
    <!-- Search aligned to right -->
    <div class="flex justify-end">
      <Input
        v-model="search"
        placeholder="Search by name or full name..."
        class="max-w-sm bg-background text-black"
      />
    </div>

    <!-- Spinners -->
    <AppSpinner :show="loading" />
    <AppSpinner :show="searchLoading" size="sm" class="mb-2" />

    <!-- Error -->
    <div v-if="!loading && error" class="text-red-500">
      {{ error }}
    </div>

    <!-- Character Grid -->
    <div
      v-if="!loading && !error"
      class="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6"
    >
      <CharacterCard
        v-for="character in filteredCharacters"
        :key="character.id"
        :character="character"
        @select="openDrawer"
      />
    </div>

    <!-- Drawer -->
    <CharacterDrawer v-model:open="drawerOpen" :character="selectedCharacter" />
  </div>
</template>
