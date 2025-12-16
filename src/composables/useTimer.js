import { ref, computed, onUnmounted } from 'vue'

export function useTimer() {
  // 计时器状态
  const timerMode = ref('infinite') // 'infinite' 或 'countdown'
  const timerDuration = ref(1500) // 默认25分钟（1500秒）
  const timeLeft = ref(1500)
  const isTimerRunning = ref(false)
  const timerInterval = ref(null)
  
  // 圆环进度条计算
  const circumference = 2 * Math.PI * 45
  const progressPercentage = computed(() => {
    if (timerMode.value === 'infinite') return 100
    return (timeLeft.value / timerDuration.value) * 100
  })
  
  const strokeDashoffset = computed(() => {
    return circumference - (progressPercentage.value / 100) * circumference
  })
  
  // 格式化时间显示
  const formattedTimeLeft = computed(() => {
    const totalSeconds = Math.floor(timeLeft.value)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })
  
  // 格式化总时长显示
  const formattedDuration = computed(() => {
    const totalSeconds = timerDuration.value
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })
  
  // 设置倒计时时间
  const setTimerDuration = (seconds) => {
    if (seconds < 60) seconds = 60 // 最少1分钟
    if (seconds > 7200) seconds = 7200 // 最多2小时
    timerDuration.value = seconds
    timeLeft.value = seconds
  }
  
  // 通过圆环进度设置时间
  const setTimerByPercentage = (percentage) => {
    const totalSeconds = Math.floor((percentage / 100) * 7200)
    setTimerDuration(totalSeconds)
  }
  
  // 设置预设时间
  const setPresetTime = (minutes) => {
    setTimerDuration(minutes * 60)
  }
  
  // 启动计时器
  const startTimer = () => {
    if (timeLeft.value <= 0) {
      resetTimer()
    }
    
    isTimerRunning.value = true
    
    timerInterval.value = setInterval(() => {
      if (timerMode.value === 'countdown') {
        if (timeLeft.value <= 0) {
          stopTimer()
          // 触发计时结束事件
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('timer-finished'))
          }
          return
        }
        timeLeft.value--
      }
      // 无限循环模式下不需要减少时间
    }, 1000)
  }
  
  // 暂停计时器
  const pauseTimer = () => {
    isTimerRunning.value = false
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
  }
  
  // 停止计时器
  const stopTimer = () => {
    pauseTimer()
    timeLeft.value = timerDuration.value
  }
  
  // 重置计时器
  const resetTimer = () => {
    stopTimer()
    timeLeft.value = timerDuration.value
  }
  
  // 切换计时模式
  const toggleTimerMode = () => {
    timerMode.value = timerMode.value === 'infinite' ? 'countdown' : 'infinite'
    resetTimer()
  }
  
  // 切换计时器运行状态
  const toggleTimer = () => {
    if (isTimerRunning.value) {
      pauseTimer()
    } else {
      startTimer()
    }
  }
  
  // 清理资源
  onUnmounted(() => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
    }
  })
  
  return {
    // 状态
    timerMode,
    timerDuration,
    timeLeft,
    isTimerRunning,
    
    // 计算属性
    progressPercentage,
    strokeDashoffset,
    circumference,
    formattedTimeLeft,
    formattedDuration,
    
    // 方法
    setTimerDuration,
    setTimerByPercentage,
    setPresetTime,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    toggleTimerMode,
    toggleTimer
  }
}