<template>
  <div class="control-panel">
    <!-- 全局控制按钮 -->
    <div class="control-buttons">
      <button 
        class="control-button"
        :class="{ 'active': isPlaying }"
        @click="toggleAll"
      >
        {{ isPlaying ? '⏸️ 暂停所有' : '▶️ 播放所有' }}
      </button>
    </div>

    <!-- 全局音量控制 -->
    <div class="volume-control">
      <label for="global-volume">
        <span>🌐 全局音量</span>
        <span class="volume-value">{{ Math.round(globalVolume * 100) }}%</span>
      </label>
      <input
        id="global-volume"
        type="range"
        min="0"
        max="1"
        step="0.01"
        :value="globalVolume"
        @input="handleVolumeChange"
        class="volume-slider"
      />
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  isPlaying: {
    type: Boolean,
    default: false
  },
  globalVolume: {
    type: Number,
    default: 0.5
  }
})

const emit = defineEmits(['toggle-all', 'volume-change'])

const toggleAll = () => {
  emit('toggle-all')
}

const handleVolumeChange = (event) => {
  emit('volume-change', { 
    soundId: null, 
    volume: parseFloat(event.target.value) 
  })
}
</script>

<style scoped>
.control-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 0 auto;
}

.control-buttons {
  display: flex;
  gap: 10px;
}

.control-button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 150px;
}

.control-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.control-button.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.volume-control {
  width: 100%;
  text-align: center;
}

.volume-control label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  color: white;
  font-weight: 500;
  font-size: 1.1rem;
}

.volume-value {
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
}

.volume-slider {
  width: 100%;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(90deg, #4facfe, #00f2fe);
  border-radius: 4px;
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
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: 2px solid #667eea;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}

.volume-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: 2px solid #667eea;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .control-panel {
    padding: 15px;
    gap: 15px;
  }
  
  .control-button {
    padding: 10px 20px;
    font-size: 0.9rem;
    min-width: 120px;
  }
}
</style>