<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const navs = [
  { path: '/home', icon: '🏠', label: '首页' },
  { path: '/pet', icon: '🐾', label: '宠物' },
  { path: '/invite', icon: '💌', label: '邀请' },
  { path: '/history', icon: '📖', label: '历史' },
]
</script>

<template>
  <nav class="nav-shell">
    <div class="nav-inner">
      <button
        v-for="nav in navs"
        :key="nav.path"
        :class="['nav-item', { active: route.path === nav.path }]"
        @click="router.push(nav.path)"
      >
        <span class="nav-icon">{{ nav.icon }}</span>
        <span class="nav-label">{{ nav.label }}</span>
        <span v-if="route.path === nav.path" class="nav-dot" />
      </button>
    </div>
  </nav>
</template>

<style scoped>
.nav-shell {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 0 12px env(safe-area-inset-bottom, 8px);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--border);
}
.nav-inner {
  max-width: var(--container-max-mobile);
  margin: 0 auto;
  display: flex;
  align-items: center;
}
.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  position: relative;
  border-radius: 12px;
  transition: all 0.2s;
  color: var(--text-muted);
}
.nav-item.active { color: var(--primary); }
.nav-icon { font-size: 1.3rem; line-height: 1; transition: transform 0.2s; }
.nav-item.active .nav-icon { transform: scale(1.15); }
.nav-label { font-size: 0.72rem; font-weight: 700; }
.nav-dot {
  position: absolute;
  bottom: 4px;
  width: 4px; height: 4px;
  border-radius: 50%;
  background: var(--primary);
}

@media (min-width: 768px) {
  .nav-shell {
    top: 50%;
    bottom: auto;
    left: auto;
    right: 16px;
    transform: translateY(-50%);
    border-top: none;
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: var(--shadow);
  }

  .nav-inner {
    max-width: none;
    flex-direction: column;
    gap: 6px;
  }

  .nav-item {
    min-width: 70px;
    padding: 10px 8px;
  }

  .nav-dot {
    bottom: 2px;
  }
}
</style>
