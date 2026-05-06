<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { RouterView, useRoute } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'

const authStore = useAuthStore()
const route = useRoute()
const showNav = computed(() => Boolean(route.meta.requiresAuth))

onMounted(() => {
  authStore.init()
})
</script>

<template>
  <div class="app-shell">
    <main class="app-main" :class="{ 'with-nav': showNav }">
      <RouterView v-slot="{ Component, route: r }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="r.path" />
        </Transition>
      </RouterView>
    </main>
    <BottomNav v-if="showNav" />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.app-main {
  min-height: 100vh;
}

.app-main.with-nav {
  padding-bottom: calc(var(--nav-height-mobile) + env(safe-area-inset-bottom, 0px));
}

@media (min-width: 768px) {
  .app-main.with-nav {
    padding-bottom: 0;
    padding-right: 108px;
  }
}
</style>
