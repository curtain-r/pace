<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const nickname = ref('')
const errorMsg = ref('')
const loading = ref(false)
const loginHeroImage =
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80'

async function submit() {
  errorMsg.value = ''
  loading.value = true
  try {
    if (isLogin.value) {
      await authStore.signIn(email.value, password.value)
    } else {
      await authStore.signUp(email.value, password.value, nickname.value)
    }
    router.push('/home')
  } catch (e: any) {
    errorMsg.value = e.message || '操作失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <!-- 装饰背景 -->
    <div class="bg-blob blob1" />
    <div class="bg-blob blob2" />
    <div class="bg-blob blob3" />

    <div class="login-wrapper">
      <!-- Logo 区域 -->
      <div class="logo-area">
        <div class="logo-icon">🐾</div>
        <h1 class="logo-title">Pace</h1>
        <p class="logo-sub">和 TA 一起养一只专属小宠物</p>
        <div class="logo-visual">
          <img :src="loginHeroImage" alt="情侣与宠物" />
        </div>
      </div>

      <!-- 表单卡片 -->
      <div class="card form-card">
        <!-- Tab 切换 -->
        <div class="tab-bar">
          <button :class="['tab-btn', { active: isLogin }]" @click="isLogin = true">登录</button>
          <button :class="['tab-btn', { active: !isLogin }]" @click="isLogin = false">注册</button>
          <div class="tab-indicator" :style="{ left: isLogin ? '4px' : 'calc(50% + 0px)' }" />
        </div>

        <!-- 表单 -->
        <form @submit.prevent="submit" class="form-body">
          <Transition name="slide-fade" mode="out-in">
            <div v-if="!isLogin" class="field" key="nickname">
              <label>昵称</label>
              <input v-model="nickname" class="input" type="text" placeholder="你想叫什么名字？" required />
            </div>
          </Transition>

          <div class="field">
            <label>邮箱</label>
            <input v-model="email" class="input" type="email" placeholder="your@email.com" required autocomplete="email" />
          </div>

          <div class="field">
            <label>密码</label>
            <input v-model="password" class="input" type="password" placeholder="至少 6 位" required minlength="6" autocomplete="current-password" />
          </div>

          <Transition name="fade">
            <p v-if="errorMsg" class="error-msg">⚠️ {{ errorMsg }}</p>
          </Transition>

          <button type="submit" class="btn btn-primary submit-btn" :disabled="loading">
            <span v-if="loading" class="spinner" />
            {{ loading ? '请稍候...' : isLogin ? '登录' : '创建账号' }}
          </button>
        </form>

        <p class="switch-hint">
          {{ isLogin ? '还没有账号？' : '已有账号？' }}
          <a href="#" @click.prevent="isLogin = !isLogin">{{ isLogin ? '立即注册' : '去登录' }}</a>
        </p>
      </div>

      <!-- 底部装饰 -->
      <p class="footer-tip">🌸 与 TA 的每一刻，都值得被记录</p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 24px 16px;
}

.bg-blob {
  position: fixed;
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
  z-index: 0;
}
.blob1 { width: 400px; height: 400px; background: rgba(255, 154, 158, 0.25); top: -100px; right: -100px; }
.blob2 { width: 300px; height: 300px; background: rgba(192, 132, 252, 0.2); bottom: -80px; left: -80px; }
.blob3 { width: 200px; height: 200px; background: rgba(255, 211, 232, 0.4); top: 50%; left: 50%; transform: translate(-50%, -50%); }

.login-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.logo-area { text-align: center; }
.logo-icon { font-size: 3.5rem; line-height: 1; margin-bottom: 8px; filter: drop-shadow(0 4px 8px rgba(255,107,107,0.3)); }
.logo-title {
  font-family: 'Pacifico', cursive;
  font-size: 2.8rem;
  color: var(--primary);
  letter-spacing: 2px;
  line-height: 1;
  margin-bottom: 8px;
}
.logo-sub { color: var(--text-muted); font-size: 0.95rem; }
.logo-visual {
  margin: 16px auto 0;
  width: min(100%, 360px);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
}
.logo-visual img {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.form-card { width: 100%; padding: 28px 24px 24px; }

.tab-bar {
  display: flex;
  position: relative;
  background: var(--bg);
  border-radius: var(--radius-sm);
  padding: 4px;
  margin-bottom: 24px;
}
.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  border-radius: 9px;
  font-family: 'Nunito', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  position: relative;
  z-index: 1;
  transition: color 0.3s;
  color: var(--text-muted);
}
.tab-btn.active { color: var(--primary); }
.tab-indicator {
  position: absolute;
  top: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: white;
  border-radius: 9px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.form-body { display: flex; flex-direction: column; gap: 16px; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 0.85rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.5px; text-transform: uppercase; }

.error-msg { color: var(--primary-dark); font-size: 0.85rem; text-align: center; padding: 10px; background: #fff0f0; border-radius: 8px; }

.submit-btn { width: 100%; padding: 15px; font-size: 1rem; margin-top: 4px; }

.spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

.switch-hint { text-align: center; font-size: 0.85rem; color: var(--text-muted); margin-top: 16px; }
.switch-hint a { color: var(--primary); font-weight: 700; text-decoration: none; }
.switch-hint a:hover { text-decoration: underline; }

.footer-tip { font-size: 0.8rem; color: var(--text-muted); text-align: center; }

/* 动画 */
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.25s ease; overflow: hidden; }
.slide-fade-enter-from { opacity: 0; max-height: 0; margin-bottom: 0; }
.slide-fade-enter-to { opacity: 1; max-height: 80px; }
.slide-fade-leave-to { opacity: 0; max-height: 0; margin-bottom: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (min-width: 768px) {
  .login-page {
    padding: 40px var(--space-4);
  }

  .login-wrapper {
    max-width: 560px;
    gap: 30px;
  }

  .form-card {
    padding: 32px 30px 28px;
  }

  .logo-title {
    font-size: 3.2rem;
  }
}

@media (min-width: 1024px) {
  .login-wrapper {
    max-width: 620px;
  }

  .logo-sub {
    font-size: 1rem;
  }
}
</style>
