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

onMounted(async () => {
  if (authStore.user) {
    await coupleStore.fetchCouple(authStore.user.id)
    if (coupleStore.couple) {
      await petStore.fetchPet()
    }
  }
})
</script>

<template>
  <div class="home-page">
    <header>
      <h2>🐾 Pace</h2>
      <button class="logout-btn" @click="authStore.signOut()">退出</button>
    </header>

    <div class="content">
      <!-- 已绑定伴侣 -->
      <template v-if="coupleStore.couple">
        <div class="pet-card" @click="router.push('/pet')">
          <div class="pet-emoji">🐱</div>
          <div class="pet-info">
            <h3>{{ petStore.pet?.name ?? '小团子' }}</h3>
            <p>点击查看宠物 →</p>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat">
            <span>🍖 饥饿</span>
            <div class="bar"><div class="fill" :style="{ width: petStore.pet?.hunger + '%' }" /></div>
          </div>
          <div class="stat">
            <span>😊 心情</span>
            <div class="bar"><div class="fill mood" :style="{ width: petStore.pet?.mood + '%' }" /></div>
          </div>
          <div class="stat">
            <span>💕 亲密度：{{ petStore.pet?.intimacy ?? 0 }}</span>
          </div>
        </div>
      </template>

      <!-- 未绑定伴侣 -->
      <template v-else>
        <div class="empty-state">
          <div class="emoji">💌</div>
          <h3>还没有绑定伴侣</h3>
          <p>邀请 TA 一起来养宠物吧！</p>
          <button class="primary-btn" @click="router.push('/invite')">绑定伴侣</button>
        </div>
      </template>

      <!-- 底部导航 -->
      <nav class="bottom-nav">
        <button @click="router.push('/home')">🏠 首页</button>
        <button @click="router.push('/pet')">🐾 宠物</button>
        <button @click="router.push('/invite')">💌 邀请</button>
        <button @click="router.push('/history')">📖 历史</button>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.home-page { min-height: 100vh; background: #fff8f5; display: flex; flex-direction: column; }
header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
header h2 { margin: 0; }
.logout-btn { border: none; background: none; color: #aaa; cursor: pointer; }
.content { flex: 1; padding: 20px; padding-bottom: 80px; }
.pet-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); cursor: pointer; margin-bottom: 16px; }
.pet-emoji { font-size: 3rem; }
.pet-info h3 { margin: 0 0 4px; }
.pet-info p { margin: 0; color: #aaa; font-size: 0.85rem; }
.stats-row { background: white; border-radius: 16px; padding: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.stat { margin-bottom: 12px; }
.stat span { font-size: 0.85rem; color: #666; }
.bar { height: 8px; background: #f0f0f0; border-radius: 4px; margin-top: 4px; }
.fill { height: 100%; background: #ff7043; border-radius: 4px; transition: width 0.5s; }
.fill.mood { background: #ab47bc; }
.empty-state { text-align: center; padding: 60px 20px; }
.emoji { font-size: 4rem; margin-bottom: 16px; }
.empty-state h3 { margin-bottom: 8px; }
.empty-state p { color: #aaa; margin-bottom: 24px; }
.primary-btn { background: #ff7043; color: white; border: none; padding: 14px 32px; border-radius: 12px; font-size: 1rem; cursor: pointer; }
.bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; display: flex; background: white; border-top: 1px solid #f0f0f0; }
.bottom-nav button { flex: 1; border: none; background: none; padding: 14px 0; font-size: 0.8rem; cursor: pointer; color: #666; }
</style>
