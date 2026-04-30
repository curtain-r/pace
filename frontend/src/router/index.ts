import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  // GitHub Pages 使用 Hash 模式，无需服务端配置
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/pet',
      name: 'pet',
      component: () => import('@/views/PetView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/invite',
      name: 'invite',
      component: () => import('@/views/InviteView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('@/views/HistoryView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// 路由守卫
router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // 等待 Auth 初始化完成
  if (authStore.loading) {
    await new Promise((resolve) => {
      const unwatch = setInterval(() => {
        if (!authStore.loading) {
          clearInterval(unwatch)
          resolve(null)
        }
      }, 50)
    })
  }

  if (to.meta.requiresAuth && !authStore.user) {
    return { name: 'login' }
  }
  if (to.meta.requiresGuest && authStore.user) {
    return { name: 'home' }
  }
})

export default router
