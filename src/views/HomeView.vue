<!-- 更新 src/views/HomeView.vue 的 script 部分 -->
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import SoundCard from '@/components/SoundCard.vue'
import SoundSlider from '@/components/SoundSlider.vue'
import BaseButton from '@/components/BaseButton.vue'
import { useAudioStore } from '@/stores/audioStore'

const audioStore = useAudioStore()

// 响应式状态
const globalVolume = computed({
  get: () => audioStore.globalVolume,
  set: (value) => audioStore.setGlobalVolume(value)
})

const sounds = computed(() => audioStore.sounds)
const activeCount = computed(() => audioStore.activeCount)
const isLoading = computed(() => audioStore.isLoading)
const error = computed(() => audioStore.error)

// 事件处理
const handleToggleSound = (soundId, isActive) => {
  audioStore.toggleSound(soundId)
}

const handleVolumeChange = (soundId, volume) => {
  audioStore.setSoundVolume(soundId, volume)
}

const playAll = async () => {
  await audioStore.playAll()
}

const pauseAll = () => {
  audioStore.pauseAll()
}

// 添加音频文件
const addAudioFiles = () => {
  // 这里可以添加音频文件上传功能
  console.log('添加音频文件功能待实现')
}

// 生命周期
onMounted(async () => {
  // 初始化音频商店
  await audioStore.initialize()
})

onUnmounted(() => {
  // 清理资源
  audioStore.cleanup()
})
</script>

<!-- 在模板中添加加载状态和错误提示 -->
<template>
  <div class="home-view">
    <!-- 头部保持不变 -->
    
    <!-- 主内容 -->
    <main class="app-main">
      <div class="container">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>正在加载音频资源...</p>
        </div>

        <!-- 错误提示 -->
        <div v-else-if="error" class="error-state">
          <p>❌ {{ error }}</p>
          <BaseButton @click="audioStore.initialize()">
            重试
          </BaseButton>
        </div>

        <!-- 正常内容 -->
        <div v-else>
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
                :disabled="sound.isLoading"
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
                :disabled="activeCount === 0 || isLoading"
                @click="playAll"
              >
                <span v-if="activeCount === sounds.length">🔁 全部播放中</span>
                <span v-else>▶️ 播放全部</span>
              </BaseButton>
              <BaseButton
                type="outline"
                :disabled="activeCount === 0 || isLoading"
                @click="pauseAll"
              >
                ⏸️ 暂停全部
              </BaseButton>
              <BaseButton
                type="outline"
                @click="audioStore.resetVolumes"
              >
                🔄 重置音量
              </BaseButton>
            </div>
          </section>
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="app-footer">
      <div class="container">
        <p>🎶 享受你的专注时刻</p>
        <p class="footer-hint">点击任意声音图标开始播放</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* 添加加载状态样式 */
.loading-state {
  text-align: center;
  padding: 40px;
  color: var(--color-text-light);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(136, 192, 208, 0.3);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 40px;
  background: rgba(255, 100, 100, 0.1);
  border-radius: var(--radius-large);
  margin: 20px 0;
}

.error-state p {
  color: #ff6b6b;
  margin-bottom: 20px;
}

.footer-hint {
  font-size: 0.8rem;
  opacity: 0.7;
  margin-top: 8px;
}
</style>