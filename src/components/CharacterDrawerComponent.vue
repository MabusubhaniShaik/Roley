<template>
  <Drawer v-model:open="modelOpen">
    <DrawerContent class="bg-gray-900 text-white">
      <button
        type="button"
        aria-label="Close"
        class="absolute right-4 top-4 rounded-md p-2 text-gray-400 hover:text-white hover:bg-gray-800 transition"
        @click="modelOpen = false"
      >
        <X class="h-5 w-5" />
      </button>
      <div class="w-full">
        <!-- Main Content -->
        <div v-if="character" class="p-6">
          <!-- Two Column Layout -->
          <div class="grid grid-cols-1 xl:grid-cols-12 gap-2">
            <!-- Left Column - Image & Basic Info -->
            <div class="xl:col-span-3 space-y-1">
              <!-- Character Image with Loading State -->
              <div class="relative">
                <div
                  v-if="!imageLoaded"
                  class="absolute inset-0 bg-gray-800 animate-pulse rounded-lg"
                />
                <img
                  :src="character.images.lg"
                  :alt="character.name"
                  loading="lazy"
                  class="rounded-lg w-[200px] h-auto object-cover"
                  :class="imageLoaded ? 'opacity-100' : 'opacity-0'"
                  @load="handleImageLoad"
                />
              </div>

              <!-- Basic Information -->
              <div class="space-y-4">
                <!-- Alignment Badge -->
                <div>
                  <span
                    class="inline-flex items-center px-4 py-2 rounded-lg font-medium"
                    :class="alignmentClass"
                  >
                    <span
                      class="w-2 h-2 rounded-full mr-2"
                      :class="alignmentDotClass"
                    />
                    {{ formattedAlignment }}
                  </span>
                </div>

                <!-- Publisher & First Appearance -->
                <div class="space-y-3">
                  <div>
                    <div class="text-gray-400 mb-1">Publisher</div>
                    <div class="font-medium">
                      {{ character.biography.publisher }}
                    </div>
                  </div>

                  <div v-if="character.biography.firstAppearance">
                    <div class="text-gray-400 mb-1">First Appearance</div>
                    <div class="font-medium">
                      {{ character.biography.firstAppearance }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column - Detailed Information -->
            <div class="xl:col-span-9 space-y-1">
              <!-- Header Section with Name and Power Stats side by side -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Character Name and Full Name -->
                <div class="space-y-2">
                  <h1 class="font-bold">{{ character.name }}</h1>
                  <div class="text-gray-300">
                    {{ character.biography.fullName }}
                  </div>
                </div>

                <!-- All Power Stats in Grid -->
                <div class="space-y-3">
                  <div class="font-medium">Power Stats</div>
                  <div class="grid grid-cols-3 gap-3">
                    <div
                      v-for="[stat, value] in powerStatsEntries"
                      :key="stat"
                      class="space-y-1"
                    >
                      <div class="flex items-center justify-between">
                        <div class="text-gray-400 text-sm uppercase">
                          {{ stat }}
                        </div>
                        <div
                          class="font-medium"
                          :style="{ color: powerStatColors[stat] }"
                        >
                          {{ value }}
                        </div>
                      </div>
                      <div class="h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          class="h-full rounded-full"
                          :style="{
                            width: `${value}%`,
                            backgroundColor: powerStatColors[stat],
                          }"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Biography Section -->
              <div class="space-y-6">
                <div class="font-medium">Biography</div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <!-- Appearance -->
                  <div class="space-y-3">
                    <div class="text-gray-300 font-medium">Appearance</div>
                    <div class="space-y-2">
                      <div
                        v-if="character.appearance.gender"
                        class="flex justify-between"
                      >
                        <span class="text-gray-400">Gender</span>
                        <span class="font-medium capitalize">
                          {{ character.appearance.gender }}
                        </span>
                      </div>

                      <div
                        v-if="character.appearance.race"
                        class="flex justify-between"
                      >
                        <span class="text-gray-400">Race</span>
                        <span class="font-medium">
                          {{ character.appearance.race }}
                        </span>
                      </div>

                      <div
                        v-if="character.appearance.height?.[0]"
                        class="flex justify-between"
                      >
                        <span class="text-gray-400">Height</span>
                        <span class="font-medium">
                          {{ character.appearance.height.join(" / ") }}
                        </span>
                      </div>

                      <div
                        v-if="character.appearance.weight?.[0]"
                        class="flex justify-between"
                      >
                        <span class="text-gray-400">Weight</span>
                        <span class="font-medium">
                          {{ character.appearance.weight.join(" / ") }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Details -->
                  <div class="space-y-3">
                    <div class="text-gray-300 font-medium">Details</div>
                    <div class="space-y-2">
                      <div
                        v-if="character.work.occupation"
                        class="flex justify-between"
                      >
                        <span class="text-gray-400">Occupation</span>
                        <span class="font-medium text-right">
                          {{ character.work.occupation }}
                        </span>
                      </div>

                      <div
                        v-if="character.work.base"
                        class="flex justify-between"
                      >
                        <span class="text-gray-400">Base</span>
                        <span class="font-medium text-right">
                          {{ character.work.base }}
                        </span>
                      </div>

                      <div
                        v-if="character.biography.placeOfBirth"
                        class="flex justify-between"
                      >
                        <span class="text-gray-400">Place of Birth</span>
                        <span class="font-medium text-right">
                          {{ character.biography.placeOfBirth }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Aliases & Group Affiliation -->
              <div class="space-y-6">
                <!-- Aliases -->
                <div v-if="hasAliases" class="space-y-3">
                  <div class="font-medium">Aliases</div>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="alias in displayedAliases"
                      :key="alias"
                      class="px-3 py-1 bg-gray-800 rounded text-sm"
                    >
                      {{ alias }}
                    </span>
                    <span
                      v-if="hasMoreAliases"
                      class="px-3 py-1 bg-gray-800/50 rounded text-sm text-gray-400"
                    >
                      +{{ remainingAliasesCount }} more
                    </span>
                  </div>
                </div>

                <!-- Group Affiliation -->
                <div
                  v-if="character.connections.groupAffiliation"
                  class="space-y-3"
                >
                  <div class="font-medium">Group Affiliation</div>
                  <div class="text-gray-300">
                    {{ character.connections.groupAffiliation }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DrawerContent>
  </Drawer>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import type { Character } from "@/services/superhero.service";
import { X } from "lucide-vue-next";

// Types
type Alignment = "good" | "bad" | "neutral" | "undefined";
type PowerStat = keyof Character["powerstats"];

interface Props {
  character: Character | null;
  open: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

// Refs
const imageLoaded = ref(false);

// Constants
const POWER_STAT_COLORS: Record<PowerStat, string> = {
  intelligence: "#60A5FA",
  strength: "#F87171",
  speed: "#34D399",
  durability: "#FBBF24",
  power: "#A78BFA",
  combat: "#F472B6",
};

const ALIGNMENT_CONFIG: Record<
  Alignment,
  {
    class: string;
    dot: string;
    label: string;
  }
> = {
  good: {
    class: "bg-green-900/20 text-green-300 border border-green-700",
    dot: "bg-green-400",
    label: "Hero",
  },
  bad: {
    class: "bg-red-900/20 text-red-300 border border-red-700",
    dot: "bg-red-400",
    label: "Villain",
  },
  neutral: {
    class: "bg-yellow-900/20 text-yellow-300 border border-yellow-700",
    dot: "bg-yellow-400",
    label: "Neutral",
  },
  undefined: {
    class: "bg-gray-800 text-gray-300 border border-gray-700",
    dot: "bg-gray-400",
    label: "Unknown",
  },
};

// Computed Properties
const modelOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit("update:open", value),
});

const characterAlignment = computed((): Alignment => {
  const alignment = props.character?.biography.alignment?.toLowerCase();
  return alignment && ["good", "bad", "neutral"].includes(alignment)
    ? (alignment as Alignment)
    : "undefined";
});

const alignmentClass = computed(
  () => ALIGNMENT_CONFIG[characterAlignment.value].class
);

const alignmentDotClass = computed(
  () => ALIGNMENT_CONFIG[characterAlignment.value].dot
);

const formattedAlignment = computed(
  () => ALIGNMENT_CONFIG[characterAlignment.value].label
);

const powerStatsEntries = computed(() => {
  if (!props.character?.powerstats) return [];
  return Object.entries(props.character.powerstats) as [PowerStat, number][];
});

const hasAliases = computed(() => !!props.character?.biography.aliases?.length);

const displayedAliases = computed(
  () => props.character?.biography.aliases?.slice(0, 6) || []
);

const hasMoreAliases = computed(
  () => (props.character?.biography.aliases?.length || 0) > 6
);

const remainingAliasesCount = computed(
  () => (props.character?.biography.aliases?.length || 0) - 6
);

const powerStatColors = computed(() => POWER_STAT_COLORS);

// Methods
const handleImageLoad = () => {
  imageLoaded.value = true;
};

// Watch for character changes to reset image load state
watchEffect(() => {
  if (props.character) {
    imageLoaded.value = false;
  }
});
</script>

<style scoped>
/* Custom scrollbar */
:deep(.drawer-content)::-webkit-scrollbar {
  width: 8px;
}

:deep(.drawer-content)::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

:deep(.drawer-content)::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

:deep(.drawer-content)::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
