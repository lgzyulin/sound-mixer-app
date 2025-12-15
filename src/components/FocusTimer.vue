<template>
  <div class="focus-timer">
    <div class="timer-display">
      <svg class="progress-ring" width="200" height="200">
        <circle
          stroke="var(--color-primary)"
          stroke-width="8"
          fill="transparent"
          r="90"
          cx="100"
          cy="100"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="progressOffset"
        />
      </svg>
      <div class="timer-text">
        <div class="time">{{ formattedTime }}</div>
        <div class="status">{{ timerStatus }}</div>
      </div>
    </div>
    
    <div class="timer-controls">
      <button @click="startTimer" :disabled="isRunning">开始专注</button>
      <button @click="pauseTimer" :disabled="!isRunning">暂停</button>
      <button @click="resetTimer">重置</button>
    </div>
    
    <div class="timer-settings">
      <label>专注时长: {{ focusDuration }}分钟</label>
      <input type="range" min="5" max="60" step="5" v-model="focusDuration">
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

const focusDuration = ref(25) // 默认25分钟
const timeLeft = ref(focusDuration.value * 60)
const isRunning = ref(false)
const timerId = ref(null)

const circumference = 2 * Math.PI * 90
const progress = computed(() => {
  const totalTime = focusDuration.value * 60
  return 1 - (timeLeft.value / totalTime)
})

const progressOffset = computed(() => circumference * (1 - progress.value))

const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const timerStatus = computed(() => {
  if (!isRunning.value) return '准备开始'
  return '专注中...'
})

const startTimer = () => {
  if (timeLeft.value <= 0) resetTimer()
  isRunning.value = true
  timerId.value = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      clearInterval(timerId.value)
      isRunning.value = false
      // 播放完成音效
      playCompletionSound()
    }
  }, 1000)
}

const pauseTimer = () => {
  isRunning.value = false
  clearInterval(timerId.value)
}

const resetTimer = () => {
  pauseTimer()
  timeLeft.value = focusDuration.value * 60
}

const playCompletionSound = () => {
  // 添加完成提示音
  const audio = new Audio('/sounds/complete.mp3')
  audio.play().catch(e => console.log('音频播放失败:', e))
}

onUnmounted(() => {
  clearInterval(timerId.value)
})
</script>

<style scoped>
.focus-timer {
  text-align: center;
  padding: 2rem;
}

.timer-display {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 2rem;
}

.progress-ring {
  transform: rotate(-90deg);
}

.timer-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.time {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--color-text);
}

.status {
  font-size: 0.9rem;
  color: var(--color-text-light);
  margin-top: 0.5rem;
}

.timer-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.timer-controls button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--radius-medium);
  background: var(--color-primary);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.timer-controls button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-soft);
}

.timer-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.timer-settings {
  background: rgba(255, 255, 255, 0.8);
  padding: 1rem;
  border-radius: var(--radius-medium);
}

.timer-settings label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.timer-settings input {
  width: 100%;
  max-width: 300px;
}
</style>