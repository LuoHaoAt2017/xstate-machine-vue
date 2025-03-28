import { createWebHistory, createRouter } from "vue-router";

const base = import.meta.env.VITE_SUB_PATH;
const router = createRouter({
  history: createWebHistory(base),
  routes: [
    {
      path: "/home",
      component: () => import("@/pages/Home/index.vue"),
    },
    {
      path: "/about",
      component: () => import("@/pages/About/index.vue"),
    },
  ],
});

export default router;
