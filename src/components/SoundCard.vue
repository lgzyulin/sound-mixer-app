<template>
  <div 
    class="sound-card"
    :class="{ 
      'active': sound.isActive,
      'loading': sound.isLoading 
    }"
    :style="{ 
      '--card-color': sound.color || '#667eea',
      'background': `linear-gradient(135deg, ${sound.color}20, transparent)`
    }"
  >
    <!-- 卡片头部 -->
    <div class="card-header">
      <div class="sound-icon">
        {{ sound.icon }}
      </div>
      <h3 class="sound-name">{{ sound.name }}</h3>
      <div 
        class="status-indicator"
        :class="{ 'active': sound.isActive }"
      ></div>
    </div>

    <!-- 播放/暂停按钮 -->
    <button 
      class="play-button"
      @click="toggleSound"
      :disabled="sound.isLoading"
    >
      {{ sound.isActive ? '⏸️' : '▶️' }}
    </button>

    <!-- 音量控制 -->
    <div class="volume-control">
      <div class="volume-label">
        <span>🔈 音量</span>
        <span class="volume-percentage">
          {{ Math.round(sound.volume * 100) }}%
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        :value="sound.volume"
        @input="handleVolumeChange"
        class="volume-slider"
        :style="{
          'background': `linear-gradient(90deg, ${sound.color} ${sound.volume * 100}%, #ddd ${sound.volume * 100}%)`
        }"
      />
    </div>

    <!-- 加载状态 -->
    <div v-if="sound.isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  sound: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['toggle', 'volume-change'])

const toggleSound = () => {
  emit('toggle', props.sound.id)
}

const handleVolumeChange = (event) => {
  emit('volume-change', { 
    soundId: props.sound.id, 
    volume: parseFloat(event.target.value) 
  })
}
</script>

<style scoped>
.sound-card {
  position: relative;
  padding: 20px;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 15px;
  cursor: pointer;
  overflow: hidden;
}

.sound-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.sound-card.active {
  border-color: var(--card-color);
  box-shadow: 0 0 20px var(--card-color)40;
}

.sound-card.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.sound-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.sound-card:hover .sound-icon {
  transform: scale(1.1);
}

.sound-name {
  flex: 1;
  margin: 0;
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  text-align: left;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff4757;
  transition: background-color 0.3s ease;
}

.status-indicator.active {
  background: #2ed573;
  box-shadow: 0 0 10px #2ed573;
}

.play-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--card-color), #667eea);
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: center;
  margin: 10px 0;
}

.play-button:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 0 20px var(--card-color);
}

.play-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.volume-control {
  width: 100%;
}

.volume-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  color: white;
  font-size: 0.9rem;
}

.volume-percentage {
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
}

.volume-slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  border-radius: 3px;
  outline: none;
  opacity: 0.9;
  transition: opacity 0.2s;
}

.volume-slider:hover {
  opacity: 1;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: 2px solid var(--card-color);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}

.volume-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: 2px solid var(--card-color);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: white;
  border-radius: 15px;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid transparent;
  border-top-color: var(--card-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sound-card {
    padding: 15px;
    gap: 12px;
  }
  
  .sound-icon {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
  
  .sound-name {
    font-size: 1.1rem;
  }
  
  .play-button {
    width: 50px;
    height: 50px;
    font-size: 1.3rem;
  }
}
</style>