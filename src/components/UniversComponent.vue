<!-- Your main component (CharacterGrid or whatever it's called) -->
<template>
  <div class="space-y-4 w-full">
    <!-- Tabs -->
    <Tabs v-model="activeTab" default-value="all">
      <!-- Centered Tabs Wrapper -->
      <div class="flex justify-center">
        <TabsList
          class="inline-flex rounded-md"
          :style="{ backgroundColor: tabColors.bg }"
        >
          <TabsTrigger
            v-for="tab in tabs"
            :key="tab.value"
            :value="tab.value"
            :style="
              activeTab === tab.value
                ? {
                    backgroundColor: tabColors.activeBg,
                    color: tabColors.activeText,
                  }
                : { color: tabColors.text }
            "
            class="px-4 py-2 font-semibold rounded-md mx-1 hover:opacity-80 transition"
          >
            {{ tab.label }}
          </TabsTrigger>
        </TabsList>
      </div>

      <!-- Grid content for the active tab -->
      <TabsContent :value="activeTab" class="mt-4">
        <!-- Loading -->
        <div v-if="loading" class="text-white/70 text-center py-4">
          Loading...
        </div>

        <!-- Error -->
        <div v-else-if="error" class="text-red-400 text-center py-4">
          {{ error }}
        </div>

        <!-- Grid -->
        <div
          v-else
          class="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6"
        >
          <CharacterCard
            v-for="character in filteredCharacters"
            :key="character.id"
            :character="character"
            @click="selectCharacter(character)"
          />
        </div>
      </TabsContent>
    </Tabs>

    <!-- Character Drawer (Reusable Component) -->
    <CharacterDrawer
      v-model:open="isDrawerOpen"
      :character="selectedCharacter"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CharacterCard from "@/components/CharacterCard.vue";
import CharacterDrawer from "@/components/CharacterDrawerComponent.vue";
import { getAllCharacters, type Character } from "@/services/superhero.service";

// Define strict alignment type
type Alignment = "good" | "bad" | "neutral";
type TabValue = "all" | Alignment;

const props = defineProps<{ publisher: string }>();

// Reactive state
const characters = ref<Character[]>([]);
const activeTab = ref<TabValue>("all");
const loading = ref(false);
const error = ref<string | null>(null);
const isDrawerOpen = ref(false);
const selectedCharacter = ref<Character | null>(null);

// Constants
const tabs = [
  { label: "All", value: "all" as const },
  { label: "Heroes", value: "good" as const },
  { label: "Villains", value: "bad" as const },
  { label: "Neutral", value: "neutral" as const },
] as const;

// Computed properties
const filteredCharacters = computed(() => {
  if (activeTab.value === "all") return characters.value;

  // Type guard for alignment filtering
  return characters.value.filter(
    (c) => c.biography.alignment === activeTab.value
  );
});

const tabColors = computed(() => {
  switch (props.publisher) {
    case "Marvel Comics":
      return {
        bg: "#000000",
        activeBg: "#B71C1C",
        activeText: "#FFFFFF",
        text: "#FFFFFF",
      };
    case "DC Comics":
      return {
        bg: "#000000",
        activeBg: "#138D75",
        activeText: "#FFFFFF",
        text: "#FFFFFF",
      };
    default:
      return {
        bg: "#000000",
        activeBg: "#FFFFFF",
        activeText: "#000000",
        text: "#FFFFFF",
      };
  }
});

// Methods
const fetchCharacters = async () => {
  loading.value = true;
  error.value = null;

  try {
    const allCharacters = await getAllCharacters();

    // Filter based on publisher prop
    if (props.publisher) {
      characters.value = allCharacters.filter(
        (c) => c.biography.publisher === props.publisher
      );
    } else {
      // Exclude major publishers
      characters.value = allCharacters.filter(
        (c) =>
          c.biography.publisher !== "Marvel Comics" &&
          c.biography.publisher !== "DC Comics"
      );
    }
  } catch (err) {
    error.value = "Failed to load characters";
    console.error("Error fetching characters:", err);
  } finally {
    loading.value = false;
  }
};

const selectCharacter = (character: Character) => {
  selectedCharacter.value = character;
  isDrawerOpen.value = true;
};

// Lifecycle
onMounted(fetchCharacters);

// Watchers
watch(
  () => props.publisher,
  () => {
    // Reset tab when publisher changes
    activeTab.value = "all";
    fetchCharacters();
  },
  { immediate: false }
);
</script>
