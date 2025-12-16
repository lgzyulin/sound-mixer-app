import { ref, computed, watch } from 'vue'

export function useTimer(audioManager) {
  // 计时器状态
  const timerMode = ref(false) // false: 无限循环, true: 倒计时
  const timerDuration = ref(0) // 总时长（秒）
  const timeLeft = ref(0) // 剩余时间（秒）
  const isTimerRunning = ref(false)
  const timerInterval = ref(null)

  // 圆环进度条计算
  const circumference = 2 * Math.PI * 45 // 圆环周长
  const progressPercentage = computed(() => {
    if (!timerMode.value || timerDuration.value === 0) return 100
    return (timeLeft.value / timerDuration.value) * 100
  })
  
  const strokeDashoffset = computed(() => {
    return circumference - (progressPercentage.value / 100) * circumference
  })

  // 格式化时间显示 (HH:MM:SS)
  const formattedTimeLeft = computed(() => {
    const hours = Math.floor(timeLeft.value / 3600)
    const minutes = Math.floor((timeLeft.value % 3600) / 60)
    const seconds = Math.floor(timeLeft.value % 60)
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })

  // 设置倒计时时间（通过圆环拖动）
  const setTimerDuration = (hours, minutes, seconds) => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds
    timerDuration.value = Math.min(totalSeconds, 7200) // 限制2小时
    timeLeft.value = timerDuration.value
  }

  // 通过圆环进度设置时间（百分比）
  const setTimerByPercentage = (percentage) => {
    const totalSeconds = Math.floor((percentage / 100) * 7200) // 7200秒=2小时
    timerDuration.value = totalSeconds
    timeLeft.value = totalSeconds
  }

  // 启动计时器
  const startTimer = () => {
    if (timerMode.value && timeLeft.value <= 0) return
    
    isTimerRunning.value = true
    
    if (timerMode.value) {
      // 倒计时模式
      timerInterval.value = setInterval(() => {
        timeLeft.value--
        
        if (timeLeft.value <= 0) {
          stopTimer()
          // 可以添加计时结束的回调
          console.log('计时结束')
        }
      }, 1000)
    }
    
    // 启动音频播放
    audioManager.playAll()
  }

  // 暂停计时器
  const pauseTimer = () => {
    isTimerRunning.value = false
    clearInterval(timerInterval.value)
    audioManager.pauseAll()
  }

  // 停止计时器
  const stopTimer = () => {
    isTimerRunning.value = false
    clearInterval(timerInterval.value)
    timeLeft.value = timerDuration.value
    audioManager.pauseAll()
  }

  // 切换计时模式
  const toggleTimerMode = () => {
    timerMode.value = !timerMode.value
    stopTimer() // 切换模式时重置状态
  }

  // 重置计时器
  const resetTimer = () => {
    stopTimer()
    timeLeft.value = timerDuration.value
  }

  return {
    timerMode,
    timerDuration,
    timeLeft,
    isTimerRunning,
    progressPercentage,
    strokeDashoffset,
    circumference,
    formattedTimeLeft,
    setTimerDuration,
    setTimerByPercentage,
    startTimer,
    pauseTimer,
    stopTimer,
    toggleTimerMode,
    resetTimer
  }
}