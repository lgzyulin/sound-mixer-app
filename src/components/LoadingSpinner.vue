<template>
  <div class="loading-overlay">
    <div class="loading-container">
      <div class="spinner">
        <div class="spinner-circle"></div>
        <div class="spinner-circle"></div>
        <div class="spinner-circle"></div>
        <div class="spinner-circle"></div>
      </div>
      <p class="loading-text">正在加载音频...</p>
    </div>
  </div>
</template>

<script setup>
// 这是一个加载动画组件
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.spinner {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}

.spinner-circle {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4facfe;
  animation: spinner 1.2s linear infinite;
}

.spinner-circle:nth-child(1) {
  top: 8px;
  left: 8px;
  animation-delay: 0s;
  background: #4facfe;
}

.spinner-circle:nth-child(2) {
  top: 8px;
  right: 8px;
  animation-delay: -0.4s;
  background: #00f2fe;
}

.spinner-circle:nth-child(3) {
  bottom: 8px;
  right: 8px;
  animation-delay: -0.8s;
  background: #667eea;
}

.spinner-circle:nth-child(4) {
  bottom: 8px;
  left: 8px;
  animation-delay: -1.2s;
  background: #764ba2;
}

@keyframes spinner {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.5);
  }
}

.loading-text {
  color: white;
  font-size: 1.2rem;
  font-weight: 300;
  letter-spacing: 1px;
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