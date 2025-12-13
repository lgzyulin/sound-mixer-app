<!-- src/views/HomeView.vue - 主页 -->
<template>
  <div class="home-view">
    <!-- 头部 -->
    <header class="app-header">
      <div class="container">
        <h1 class="app-title">🎧 宁静之声</h1>
        <p class="app-subtitle">专注放松的白噪声混合器</p>
      </div>
    </header>

    <!-- 主内容 -->
    <main class="app-main">
      <div class="container">
        <!-- 全局音量控制 -->
        <section class="global-volume">
          <div class="section-header">
            <h2>🌡️ 全局音量</h2>
            <div class="global-volume-value">
              {{ Math.round(globalVolume * 100) }}%
            </div>
          </div>
          <SoundSlider v-model="globalVolume" />
        </section>

        <!-- 声音列表 -->
        <section class="sounds-section">
          <div class="section-header">
            <h2>🎵 选择声音</h2>
            <div class="active-count">
              {{ activeCount }}/{{ sounds.length }} 播放中
            </div>
          </div>
          
          <div class="sounds-grid">
            <SoundCard
              v-for="sound in sounds"
              :key="sound.id"
              :sound="sound"
              @toggle="handleToggleSound"
              @volume-change="handleVolumeChange"
            />
          </div>
        </section>

        <!-- 控制按钮 -->
        <section class="controls">
          <div class="control-buttons">
            <BaseButton
              type="primary"
              :disabled="activeCount === 0"
              @click="playAll"
            >
              ▶️ 播放全部
            </BaseButton>
            <BaseButton
              type="outline"
              :disabled="activeCount === 0"
              @click="pauseAll"
            >
              ⏸️ 暂停全部
            </BaseButton>
          </div>
        </section>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="app-footer">
      <div class="container">
        <p>🎶 享受你的专注时刻</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SoundCard from '@/components/SoundCard.vue'
import SoundSlider from '@/components/SoundSlider.vue'
import BaseButton from '@/components/BaseButton.vue'

// 静态声音数据
const sounds = ref([
  { id: 1, name: '轻柔雨声', volume: 0.6, isActive: false, emoji: '🌧️' },
  { id: 2, name: '远方雷声', volume: 0.4, isActive: false, emoji: '⛈️' },
  { id: 3, name: '山间溪流', volume: 0.7, isActive: false, emoji: '🏞️' },
  { id: 4, name: '徐徐微风', volume: 0.5, isActive: false, emoji: '🌬️' },
  { id: 5, name: '温暖篝火', volume: 0.6, isActive: false, emoji: '🔥' },
  { id: 6, name: '海边波浪', volume: 0.5, isActive: false, emoji: '🌊' }
])

const globalVolume = ref(0.7)

// 计算属性
const activeCount = computed(() => {
  return sounds.value.filter(sound => sound.isActive).length
})

// 事件处理
const handleToggleSound = (soundId, isActive) => {
  const sound = sounds.value.find(s => s.id === soundId)
  if (sound) {
    sound.isActive = isActive
  }
}

const handleVolumeChange = (soundId, volume) => {
  const sound = sounds.value.find(s => s.id === soundId)
  if (sound) {
    sound.volume = volume
  }
}

const playAll = () => {
  sounds.value.forEach(sound => {
    sound.isActive = true
  })
}

const pauseAll = () => {
  sounds.value.forEach(sound => {
    sound.isActive = false
  })
}

// 移动端适配：禁止双击缩放
onMounted(() => {
  let lastTouchEnd = 0
  document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime()
    if (now - lastTouchEnd <= 300) {
      event.preventDefault()
    }
    lastTouchEnd = now
  }, false)
})
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f8f5f2 0%, #e5e9f0 100%);
}

.app-header {
  padding: 24px 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
}

.app-title {
  font-size: 1.8rem;
  color: var(--color-text);
  margin: 0 0 8px 0;
  font-weight: 700;
}

.app-subtitle {
  font-size: 1rem;
  color: var(--color-text-light);
  margin: 0;
  opacity: 0.8;
}

.app-main {
  flex: 1;
  padding: 24px 0 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 4px;
}

.section-header h2 {
  font-size: 1.3rem;
  color: var(--color-text);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.global-volume,
.sounds-section,
.controls {
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-large);
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.global-volume-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  background: rgba(136, 192, 208, 0.1);
  padding: 8px 16px;
  border-radius: var(--radius-medium);
}

.active-count {
  font-size: 0.9rem;
  color: var(--color-secondary);
  font-weight: 600;
  padding: 6px 12px;
  background: rgba(163, 190, 140, 0.1);
  border-radius: var(--radius-medium);
}

.sounds-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.controls {
  text-align: center;
}

.control-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.app-footer {
  padding: 20px 0;
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.app-footer p {
  margin: 0;
  color: var(--color-text-light);
  font-size: 0.9rem;
}

/* 平板适配 */
@media (min-width: 768px) {
  .sounds-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .app-title {
    font-size: 2.2rem;
  }
  
  .app-subtitle {
    font-size: 1.1rem;
  }
}

/* 桌面适配 */
@media (min-width: 1024px) {
  .sounds-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .app-header {
    padding: 32px 0;
  }
  
  .app-main {
    padding: 32px 0 60px;
  }
}

/* 横屏适配 */
@media (orientation: landscape) and (max-height: 480px) {
  .app-header {
    padding: 12px 0;
  }
  
  .app-main {
    padding: 12px 0 20px;
  }
  
  .global-volume,
  .sounds-section,
  .controls {
    padding: 16px;
    margin-bottom: 12px;
  }
}
</style>