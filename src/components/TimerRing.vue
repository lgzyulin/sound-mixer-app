<template>
  <div class="timer-ring-container">
    <div class="timer-display">
      <svg 
        width="200" 
        height="200" 
        viewBox="0 0 100 100"
        class="ring-svg"
        @mousedown="startDrag"
        @touchstart="startDrag"
      >
        <!-- 背景圆环 -->
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          stroke-width="8"
          class="ring-background"
        />
        
        <!-- 进度圆环 -->
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          :stroke="progressColor"
          stroke-width="8"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeDashoffset"
          class="ring-progress"
          transform="rotate(-90 50 50)"
        />
        
        <!-- 时间显示 -->
        <text
          x="50"
          y="50"
          text-anchor="middle"
          dominant-baseline="middle"
          class="time-text"
        >
          {{ displayTime }}
        </text>
        
        <!-- 模式指示 -->
        <text
          x="50"
          y="60"
          text-anchor="middle"
          dominant-baseline="middle"
          class="mode-text"
        >
          {{ modeText }}
        </text>
      </svg>
      
      <!-- 拖动指示点 -->
      <div 
        v-if="timerMode === 'countdown'"
        class="drag-handle"
        :style="handleStyle"
        @mousedown.stop="startDrag"
        @touchstart.stop="startDrag"
      >
        <div class="handle-dot"></div>
      </div>
    </div>
    
    <!-- 控制按钮 -->
    <div class="timer-controls">
      <button 
        class="timer-btn play-pause-btn"
        :class="{ paused: !isTimerRunning }"
        @click="$emit('toggle')"
      >
        {{ isTimerRunning ? '⏸️' : '▶️' }}
      </button>
      
      <button 
        class="timer-btn stop-btn"
        @click="$emit('stop')"
      >
        ⏹️
      </button>
    </div>
    
    <!-- 预设时间 -->
    <div v-if="timerMode === 'countdown'" class="preset-times">
      <button 
        v-for="preset in presets" 
        :key="preset.minutes"
        class="preset-btn"
        :class="{ active: timerDuration === preset.minutes * 60 }"
        @click="$emit('preset', preset.minutes)"
      >
        {{ preset.label }}
      </button>
    </div>
    
    <!-- 模式切换 -->
    <div class="mode-switch">
      <button 
        class="mode-btn infinite"
        :class="{ active: timerMode === 'infinite' }"
        @click="$emit('mode-change', 'infinite')"
      >
        ∞ 无限循环
      </button>
      <button 
        class="mode-btn countdown"
        :class="{ active: timerMode === 'countdown' }"
        @click="$emit('mode-change', 'countdown')"
      >
        ⏱️ 倒计时
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  timerMode: {
    type: String,
    default: 'infinite',
    validator: (value) => ['infinite', 'countdown'].includes(value)
  },
  progressPercentage: {
    type: Number,
    default: 100
  },
  formattedTimeLeft: {
    type: String,
    default: '∞'
  },
  timerDuration: {
    type: Number,
    default: 1500
  },
  isTimerRunning: {
    type: Boolean,
    default: false
  },
  circumference: {
    type: Number,
    default: 282.743
  },
  strokeDashoffset: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['time-change', 'toggle', 'stop', 'preset', 'mode-change'])

// 预设时间
const presets = [
  { minutes: 5, label: '5分钟' },
  { minutes: 10, label: '10分钟' },
  { minutes: 15, label: '15分钟' },
  { minutes: 25, label: '25分钟' },
  { minutes: 30, label: '30分钟' }
]

// 计算属性
const progressColor = computed(() => {
  if (props.timerMode === 'infinite') return '#4CAF50'
  
  const percentage = props.progressPercentage
  if (percentage > 50) return '#4CAF50' // 绿色
  if (percentage > 25) return '#FF9800' // 橙色
  return '#F44336' // 红色
})

const displayTime = computed(() => {
  if (props.timerMode === 'infinite') return '∞'
  return props.formattedTimeLeft
})

const modeText = computed(() => {
  return props.timerMode === 'infinite' ? '无限循环' : '倒计时'
})

const handleStyle = computed(() => {
  if (props.timerMode === 'infinite') return {}
  
  const percentage = Math.max(0, Math.min(100, props.progressPercentage))
  const angle = (percentage / 100) * 2 * Math.PI - Math.PI / 2
  const x = 50 + 45 * Math.cos(angle)
  const y = 50 + 45 * Math.sin(angle)
  
  return {
    left: `calc(${x}% - 12px)`,
    top: `calc(${y}% - 12px)`
  }
})

// 拖动逻辑
const isDragging = ref(false)

const startDrag = (event) => {
  if (props.timerMode === 'infinite') return
  
  event.preventDefault()
  isDragging.value = true
  
  const handleMove = (moveEvent) => {
    if (!isDragging.value) return
    
    const clientX = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0].clientX)
    const clientY = moveEvent.clientY || (moveEvent.touches && moveEvent.touches[0].clientY)
    
    if (clientX && clientY) {
      updateTime(clientX, clientY)
    }
  }
  
  const handleEnd = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('touchmove', handleMove)
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchend', handleEnd)
  }
  
  document.addEventListener('mousemove', handleMove)
  document.addEventListener('touchmove', handleMove, { passive: false })
  document.addEventListener('mouseup', handleEnd)
  document.addEventListener('touchend', handleEnd)
}

const updateTime = (clientX, clientY) => {
  const svg = document.querySelector('.ring-svg')
  if (!svg) return
  
  const rect = svg.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const deltaX = clientX - centerX
  const deltaY = clientY - centerY
  
  // 计算角度
  let angle = Math.atan2(deltaY, deltaX)
  // 转换为0-360度
  if (angle < 0) angle += 2 * Math.PI
  // 转换为0-100百分比
  const percentage = (angle / (2 * Math.PI)) * 100
  
  emit('time-change', Math.max(0, Math.min(100, percentage)))
}

onMounted(() => {
  // 防止文本选择
  document.addEventListener('selectstart', preventSelect)
})

onUnmounted(() => {
  document.removeEventListener('selectstart', preventSelect)
})

const preventSelect = (event) => {
  if (isDragging.value) {
    event.preventDefault()
  }
}
</script>

<style scoped>
.timer-ring-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 300px;
  margin: 0 auto;
}

.timer-display {
  position: relative;
  width: 200px;
  height: 200px;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

.ring-svg {
  width: 100%;
  height: 100%;
}

.ring-background {
  transition: stroke 0.3s ease;
}

.ring-progress {
  transition: all 0.3s ease;
  filter: drop-shadow(0 0 8px currentColor);
}

.time-text {
  font-size: 20px;
  font-weight: bold;
  fill: white;
  font-family: 'Arial', sans-serif;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.mode-text {
  font-size: 12px;
  fill: rgba(255, 255, 255, 0.7);
  font-family: 'Arial', sans-serif;
}

.drag-handle {
  position: absolute;
  width: 24px;
  height: 24px;
  cursor: grab;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.handle-dot {
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  border: 2px solid #4CAF50;
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
  transition: all 0.2s ease;
}

.drag-handle:active {
  cursor: grabbing;
}

.drag-handle:active .handle-dot {
  transform: scale(1.3);
  box-shadow: 0 0 12px rgba(76, 175, 80, 0.7);
}

.timer-controls {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.timer-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
}

.play-pause-btn {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
}

.play-pause-btn.paused {
  background: linear-gradient(135deg, #2196F3, #1976D2);
}

.stop-btn {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white;
}

.timer-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.preset-times {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 10px;
}

.preset-btn {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.preset-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.preset-btn.active {
  background: #2196F3;
  border-color: #2196F3;
  box-shadow: 0 0 8px rgba(33, 150, 243, 0.4);
}

.mode-switch {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.mode-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.mode-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.mode-btn.active {
  background: rgba(76, 175, 80, 0.3);
  border-color: #4CAF50;
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.3);
}

.mode-btn.infinite.active {
  background: rgba(33, 150, 243, 0.3);
  border-color: #2196F3;
  box-shadow: 0 0 8px rgba(33, 150, 243, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .timer-ring-container {
    padding: 15px;
  }
  
  .timer-display {
    width: 150px;
    height: 150px;
  }
  
  .time-text {
    font-size: 16px;
  }
  
  .mode-text {
    font-size: 10px;
  }
  
  .timer-btn {
    padding: 8px 16px;
    font-size: 1rem;
    min-width: 50px;
  }
  
  .preset-times {
    gap: 5px;
  }
  
  .preset-btn {
    padding: 4px 8px;
    font-size: 0.7rem;
  }
  
  .mode-btn {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
}
</style>