import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

// Layout
import MainLayout from "@/layout/MainLayout.vue";

// Pages
import Home from "@/pages/HomePage.vue";
import MarvelPage from "@/pages/MarvelPage.vue";
import DCUPage from "@/pages/DCUPage.vue";
import OthersPage from "@/pages/OthersPage.vue";
import GamePage from "@/pages/GamePage.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: MainLayout,
    children: [
      {
        path: "",
        name: "Home",
        component: Home,
      },
      {
        path: "mcu",
        name: "MCU",
        component: MarvelPage,
      },
      {
        path: "dcu",
        name: "DCU",
        component: DCUPage,
      },
      {
        path: "other",
        name: "Other",
        component: OthersPage,
      },
      {
        path: "game",
        name: "Game",
        component: GamePage,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
