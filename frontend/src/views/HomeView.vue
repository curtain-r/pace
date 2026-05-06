<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCoupleStore } from '@/stores/couple'
import { usePetStore } from '@/stores/pet'

const authStore = useAuthStore()
const coupleStore = useCoupleStore()
const petStore = usePetStore()
const router = useRouter()
const homePetImage =
  'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=1200&q=80'
const emptyStateImage =
  'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=1200&q=80'

onMounted(async () => {
  if (authStore.user) {
    await coupleStore.fetchCouple(authStore.user.id)
    if (coupleStore.couple) {
      await petStore.fetchPet()
    }
  }
})

function getPetStatus(val: number) {
  if (val >= 70) return { text: '棒极了', color: '#4ade80' }
  if (val >= 40) return { text: '还不错', color: '#fb923c' }
  return { text: '需要关注', color: '#f87171' }
}

function getSpeciesLabel(species: string) {
  const map: Record<string, string> = {
    cat: '小猫咪',
    dog: '小狗狗',
    rabbit: '小兔兔',
  }
  return map[species] ?? species
}
</script>

<template>
  <div class="page-layout">
    <!-- 顶部 Header -->
    <header class="app-header">
      <div class="header-inner">
        <div class="header-logo">
          <span class="header-paw">🐾</span>
          <span class="header-title page-title-text">Pace</span>
        </div>
        <div class="header-right">
          <span class="user-greeting">Hi, {{ authStore.user?.user_metadata?.nickname || '主人' }} 👋</span>
          <button class="btn btn-ghost icon-btn" @click="authStore.signOut()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- 页面内容 -->
    <main class="page-content">
      <div class="container">

        <!-- 已绑定伴侣 -->
        <template v-if="coupleStore.couple && petStore.pet">
          <!-- 宠物卡片 -->
          <div class="pet-hero card" @click="router.push('/pet')">
            <div class="pet-hero-bg">
              <img :src="homePetImage" alt="宠物生活场景" />
            </div>
            <div class="pet-avatar-wrap">
              <div class="pet-avatar">🐱</div>
              <div class="pet-avatar-ring" />
            </div>
            <div class="pet-hero-info">
              <h2 class="pet-name">{{ petStore.pet.name }}</h2>
              <p class="pet-species">{{ getSpeciesLabel(petStore.pet.species) }}</p>
              <div class="intimacy-badge">
                <span>💕</span>
                <span>亲密度 {{ petStore.pet.intimacy }}</span>
              </div>
            </div>
            <div class="pet-arrow">→</div>
          </div>

          <!-- 状态卡片 -->
          <div class="stats-card card">
            <h3 class="section-title">今日状态</h3>
            <div class="stat-list">
              <div class="stat-row">
                <div class="stat-label">
                  <span class="stat-emoji">🍖</span>
                  <span>饥饿值</span>
                  <span class="stat-badge" :style="{ color: getPetStatus(petStore.pet.hunger).color }">
                    {{ getPetStatus(petStore.pet.hunger).text }}
                  </span>
                </div>
                <div class="stat-value">{{ petStore.pet.hunger }}</div>
              </div>
              <div class="progress-bar">
                <div class="progress-fill hunger" :style="{ width: petStore.pet.hunger + '%' }" />
              </div>

              <div class="stat-row" style="margin-top: 14px;">
                <div class="stat-label">
                  <span class="stat-emoji">😊</span>
                  <span>心情值</span>
                  <span class="stat-badge" :style="{ color: getPetStatus(petStore.pet.mood).color }">
                    {{ getPetStatus(petStore.pet.mood).text }}
                  </span>
                </div>
                <div class="stat-value">{{ petStore.pet.mood }}</div>
              </div>
              <div class="progress-bar">
                <div class="progress-fill mood" :style="{ width: petStore.pet.mood + '%' }" />
              </div>
            </div>
          </div>

          <!-- 快速操作 -->
          <div class="quick-actions">
            <button class="action-card" @click="router.push('/pet')">
              <span class="action-icon">🍖</span>
              <span>喂食</span>
            </button>
            <button class="action-card" @click="router.push('/pet')">
              <span class="action-icon">✋</span>
              <span>抚摸</span>
            </button>
            <button class="action-card" @click="router.push('/pet')">
              <span class="action-icon">💬</span>
              <span>聊天</span>
            </button>
          </div>
        </template>

        <!-- 未绑定伴侣 -->
        <template v-else-if="!coupleStore.couple">
          <div class="empty-card card">
            <div class="empty-illustration">
              <img :src="emptyStateImage" alt="等待绑定伴侣" class="empty-photo" />
              <div class="empty-dots">
                <span /><span /><span />
              </div>
            </div>
            <h2>还没有伴侣</h2>
            <p>邀请 TA 一起来共养一只宠物，记录每一个温暖瞬间 🌸</p>
            <button class="btn btn-primary" @click="router.push('/invite')">绑定伴侣</button>
          </div>
        </template>

        <!-- 加载中 -->
        <template v-else>
          <div class="loading-card card">
            <div class="loading-spinner" />
            <p>加载中...</p>
          </div>
        </template>

      </div>
    </main>

  </div>
</template>

<style scoped>
.page-layout { min-height: 100%; display: flex; flex-direction: column; background: var(--bg); }

/* Header */
.app-header {
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 50;
}
.header-inner {
  max-width: var(--container-max-desktop);
  margin: 0 auto;
  padding: 12px var(--space-3);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-logo { display: flex; align-items: center; gap: 6px; }
.header-paw { font-size: 1.3rem; }
.header-title { font-family: 'Pacifico', cursive; font-size: 1.4rem; color: var(--primary); }
.header-right { display: flex; align-items: center; gap: 8px; }
.user-greeting {
  font-size: 0.82rem;
  color: var(--text-muted);
  font-weight: 600;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.icon-btn { padding: 8px; border-radius: 10px; }

/* 内容区 */
.page-content { flex: 1; padding: var(--space-3) 0 var(--space-4); }
.container { display: flex; flex-direction: column; gap: 14px; }

/* 宠物 Hero 卡片 */
.pet-hero {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}
.pet-hero:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
.pet-hero:active { transform: scale(0.99); }
.pet-hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.pet-hero-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 245, 247, 0.8), rgba(252, 231, 243, 0.68));
}
.pet-hero-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.pet-avatar-wrap {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}
.pet-avatar {
  width: 72px; height: 72px;
  display: flex; align-items: center; justify-content: center;
  font-size: 2.6rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(255,107,107,0.2);
}
.pet-avatar-ring {
  position: absolute;
  inset: -3px;
  border-radius: 23px;
  border: 2px dashed var(--secondary);
  animation: rotate 8s linear infinite;
}
@keyframes rotate { to { transform: rotate(360deg); } }

.pet-hero-info { position: relative; z-index: 1; flex: 1; min-width: 0; }
.pet-name { font-size: 1.3rem; font-weight: 800; color: var(--text); margin-bottom: 2px; }
.pet-species {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.intimacy-badge {
  display: inline-flex; align-items: center; gap: 4px;
  background: white; border-radius: 999px;
  padding: 4px 10px; font-size: 0.8rem; font-weight: 700;
  color: var(--primary); box-shadow: 0 2px 8px rgba(255,107,107,0.15);
}
.pet-arrow { position: relative; z-index: 1; font-size: 1.2rem; color: var(--text-muted); }

/* 状态卡片 */
.stats-card { padding: 20px; }
.section-title { font-size: 0.9rem; font-weight: 800; color: var(--text-muted); letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 16px; }
.stat-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.stat-label { display: flex; align-items: center; gap: 6px; font-size: 0.9rem; font-weight: 700; }
.stat-emoji { font-size: 1rem; }
.stat-badge { font-size: 0.75rem; font-weight: 700; padding: 2px 8px; background: rgba(0,0,0,0.04); border-radius: 999px; }
.stat-value { font-size: 0.9rem; font-weight: 800; color: var(--text-muted); }

/* 快速操作 */
.quick-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.action-card {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 16px 8px;
  background: white; border: 1px solid var(--border);
  border-radius: var(--radius); cursor: pointer;
  font-family: 'Nunito', sans-serif; font-size: 0.85rem; font-weight: 700; color: var(--text);
  transition: all 0.2s; box-shadow: var(--shadow);
}
.action-card:hover { border-color: var(--primary); transform: translateY(-2px); }
.action-card:active { transform: scale(0.96); }
.action-icon { font-size: 1.6rem; }
.action-card:focus-visible { border-color: var(--primary); }

/* 空状态 */
.empty-card { padding: 40px 24px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.empty-illustration { margin-bottom: 8px; }
.empty-circle {
  width: 90px; height: 90px;
  background: linear-gradient(135deg, var(--secondary), #fce7f3);
  border-radius: 50%; font-size: 2.5rem;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 12px;
  box-shadow: 0 8px 24px rgba(255,107,107,0.2);
}
.empty-photo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 12px;
  box-shadow: 0 8px 24px rgba(255,107,107,0.2);
}
.empty-dots { display: flex; gap: 6px; justify-content: center; }
.empty-dots span { width: 6px; height: 6px; background: var(--border); border-radius: 50%; }
.empty-card h2 { font-size: 1.3rem; font-weight: 800; }
.empty-card p { font-size: 0.9rem; color: var(--text-muted); max-width: 260px; line-height: 1.6; }

/* 加载 */
.loading-card { padding: 60px; display: flex; flex-direction: column; align-items: center; gap: 12px; color: var(--text-muted); }
.loading-spinner { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (min-width: 768px) {
  .header-inner {
    padding: 14px var(--space-4);
  }

  .page-content {
    padding-top: var(--space-4);
  }

  .container {
    display: grid;
    gap: var(--space-4);
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .pet-hero {
    grid-column: 1 / -1;
  }

  .stats-card {
    height: 100%;
  }

  .quick-actions {
    grid-template-columns: 1fr;
    align-content: start;
  }
}

@media (min-width: 1024px) {
  .header-inner {
    padding-inline: var(--space-5);
  }

  .container {
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  }

  .quick-actions {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-column: 1 / -1;
  }
}
</style>
