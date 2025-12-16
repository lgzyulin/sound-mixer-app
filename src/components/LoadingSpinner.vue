<template>
  <div class="loading-overlay">
    <div class="loading-content">
      <div class="spinner">
        <div class="spinner-circle"></div>
      </div>
      <p class="loading-text">{{ message }}</p>
      <p v-if="progress > 0" class="loading-progress">
        加载中... {{ progress }}%
      </p>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  message: {
    type: String,
    default: '正在加载音频...'
  },
  progress: {
    type: Number,
    default: 0
  }
})
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.loading-content {
  text-align: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.spinner {
  width: 60px;
  height: 60px;
  margin: 0 auto 20px;
  position: relative;
}

.spinner-circle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4px solid transparent;
  border-top-color: #4facfe;
  border-right-color: #00f2fe;
  border-bottom-color: #667eea;
  border-left-color: #764ba2;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: white;
  font-size: 1.2rem;
  margin-bottom: 10px;
  font-weight: 300;
  letter-spacing: 1px;
}

.loading-progress {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}
</style>