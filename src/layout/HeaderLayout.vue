<template>
  <header class="sticky top-0 z-50 w-full border-b border-white/10 bg-black">
    <div class="flex h-[4rem] items-center px-[2.4rem]">
      <!-- Left: Logo -->
      <div class="flex-1 font-semibold tracking-tight text-white">MyApp</div>

      <!-- Right: Menu + Avatar -->
      <div class="flex flex-1 items-center justify-end gap-6">
        <nav class="flex items-center gap-1">
          <RouterLink
            v-for="item in navItems"
            :key="item.name"
            :to="item.path"
            v-slot="{ isExactActive }"
          >
            <Button
              variant="ghost"
              class="flex items-center gap-2 px-3 py-1.5 transition-colors hover:bg-[#015F78]"
              :class="
                isExactActive
                  ? 'bg-[#015F78] text-[#B7950B] hover:bg-[#015F78]'
                  : 'text-white/70 hover:text-white'
              "
            >
              <component :is="item.icon" class="h-4 w-4" />
              <span>{{ item.name }}</span>
            </Button>
          </RouterLink>
        </nav>

        <Avatar class="h-[3.2rem] w-[3.2rem] cursor-pointer">
          <AvatarImage src="https://github.com/shadcn.png" alt="User avatar" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Home, Film, Shield, WashingMachine, Joystick } from "lucide-vue-next";

interface NavItem {
  name: string;
  path: string;
  icon: any;
}

const navItems: NavItem[] = [
  { name: "Home", path: "/", icon: Home },
  { name: "MCU", path: "/mcu", icon: Film },
  { name: "DCU", path: "/dcu", icon: Shield },
  { name: "Other", path: "/other", icon: WashingMachine },
  { name: "Game", path: "/game", icon: Joystick },
];
</script>
