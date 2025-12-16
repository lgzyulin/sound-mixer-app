<template>
  <div class="timer-ring" @mousedown="startDrag" @touchstart="startDrag">
    <svg 
      width="200" 
      height="200" 
      viewBox="0 0 100 100"
      class="ring-svg"
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
        y="62"
        text-anchor="middle"
        dominant-baseline="middle"
        class="mode-text"
      >
        {{ modeText }}
      </text>
    </svg>
    
    <!-- 拖动指示点 -->
    <div 
      v-if="timerMode"
      class="drag-handle"
      :style="handleStyle"
      @mousedown="startDrag"
      @touchstart="startDrag"
    ></div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  timerMode: {
    type: Boolean,
    default: false
  },
  progressPercentage: {
    type: Number,
    default: 0
  },
  formattedTimeLeft: {
    type: String,
    default: '00:00'
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

const emit = defineEmits(['time-change', 'drag-start', 'drag-end'])

// 计算属性
const progressColor = computed(() => {
  return props.timerMode ? '#4facfe' : '#a3b18a'
})

const displayTime = computed(() => {
  if (!props.timerMode) return '∞'
  return props.formattedTimeLeft
})

const modeText = computed(() => {
  return props.timerMode ? '计时模式' : '循环模式'
})

const handleStyle = computed(() => {
  if (!props.timerMode) return {}
  
  const percentage = Math.max(0, Math.min(100, props.progressPercentage))
  const angle = (percentage / 100) * 2 * Math.PI - Math.PI / 2
  const x = 50 + 45 * Math.cos(angle)
  const y = 50 + 45 * Math.sin(angle)
  
  return {
    left: `calc(${x}% - 8px)`,
    top: `calc(${y}% - 8px)`
  }
})

// 拖动逻辑
const isDragging = ref(false)

const startDrag = (event) => {
  if (!props.timerMode) return
  
  event.preventDefault()
  isDragging.value = true
  emit('drag-start')
  
  const moveHandler = (moveEvent) => {
    if (!isDragging.value) return
    
    const clientX = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0].clientX)
    const clientY = moveEvent.clientY || (moveEvent.touches && moveEvent.touches[0].clientY)
    
    if (clientX && clientY) {
      updateTime(clientX, clientY)
    }
  }
  
  const endHandler = () => {
    isDragging.value = false
    emit('drag-end')
    document.removeEventListener('mousemove', moveHandler)
    document.removeEventListener('touchmove', moveHandler)
    document.removeEventListener('mouseup', endHandler)
    document.removeEventListener('touchend', endHandler)
  }
  
  document.addEventListener('mousemove', moveHandler)
  document.addEventListener('touchmove', moveHandler, { passive: false })
  document.addEventListener('mouseup', endHandler)
  document.addEventListener('touchend', endHandler)
}

const updateTime = (clientX, clientY) => {
  const rect = document.querySelector('.timer-ring').getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const deltaX = clientX - centerX
  const deltaY = clientY - centerY
  
  let angle = Math.atan2(deltaY, deltaX)
  if (angle < -Math.PI / 2) angle += 2 * Math.PI
  
  const normalizedAngle = angle + Math.PI / 2
  const percentage = (normalizedAngle / (2 * Math.PI)) * 100
  
  emit('time-change', Math.max(0, Math.min(100, percentage)))
}

onMounted(() => {
  // 添加样式以防止文本选择
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
.timer-ring {
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
}

.time-text {
  font-size: 16px;
  font-weight: 600;
  fill: white;
  font-family: 'Arial', sans-serif;
}

.mode-text {
  font-size: 10px;
  fill: rgba(255, 255, 255, 0.7);
  font-family: 'Arial', sans-serif;
}

.drag-handle {
  position: absolute;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  border: 2px solid #4facfe;
  cursor: grab;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  z-index: 10;
}

.drag-handle:active {
  cursor: grabbing;
  transform: scale(1.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .timer-ring {
    width: 150px;
    height: 150px;
  }
  
  .time-text {
    font-size: 14px;
  }
  
  .mode-text {
    font-size: 8px;
  }
}
</style>