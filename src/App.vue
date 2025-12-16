<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSoundMixer } from './composables/useSoundMixer'
import SoundCard from './components/SoundCard.vue'
import ControlPanel from './components/ControlPanel.vue'
import LoadingSpinner from './components/LoadingSpinner.vue'

// 使用 composable 管理音频逻辑
const {
  sounds,
  isPlaying,
  globalVolume,
  isLoading,
  error,
  toggleSound,
  setVolume,
  toggleAllSounds,
  preloadSounds
} = useSoundMixer()

// 组件挂载时预加载音频
onMounted(async () => {
  try {
    await preloadSounds()
  } catch (err) {
    console.error('音频预加载失败:', err)
  }
})

// 组件卸载时清理资源
onUnmounted(() => {
  sounds.value.forEach(sound => {
    if (sound.audio) {
      sound.audio.pause()
      sound.audio = null
    }
  })
})
</script>

<template>
  <div class="app">
    <!-- 加载状态 -->
    <LoadingSpinner v-if="isLoading" />
    
    <!-- 错误提示 -->
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 主界面 -->
    <div v-else class="sound-mixer">
      <header class="app-header">
        <h1>白噪音混合器</h1>
        <ControlPanel
          :is-playing="isPlaying"
          :global-volume="globalVolume"
          @toggle-all="toggleAllSounds"
          @volume-change="setVolume"
        />
      </header>

      <main class="sound-grid">
        <SoundCard
          v-for="sound in sounds"
          :key="sound.id"
          :sound="sound"
          @toggle="toggleSound"
          @volume-change="setVolume"
        />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.sound-mixer {
  max-width: 1200px;
  margin: 0 auto;
}

.app-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.app-header h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.sound-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.error-message {
  background: #ff4757;
  color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  margin: 20px;
  font-size: 1.1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app {
    padding: 10px;
  }
  
  .app-header h1 {
    font-size: 2rem;
  }
  
  .sound-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}
</style>