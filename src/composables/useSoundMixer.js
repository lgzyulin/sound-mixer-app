import { ref, computed } from 'vue'

// 音频配置 - 使用.mp3格式
const SOUND_CONFIG = [
  {
    id: 'rain',
    name: '下雨声',
    icon: '🌧️',
    file: './sounds/rain.mp3',  // 确保文件路径正确
    color: '#4facfe'
  },
  {
    id: 'waves',
    name: '海浪声',
    icon: '🌊', 
    file: './sounds/waves.mp3',  // 确保文件路径正确
    color: '#a8edea'
  },
  {
    id: 'fireplace',
    name: '火炉声',
    icon: '🔥',
    file: './sounds/fireplace.mp3',  // 确保文件路径正确
    color: '#ff9a9e'
  },
  {
    id: 'forest',
    name: '森林声',
    icon: '🌲',
    file: './sounds/forest.mp3',  // 确保文件路径正确
    color: '#a3b18a'
  },
  {
    id: 'coffee',
    name: '咖啡厅',
    icon: '☕',
    file: './sounds/coffee.mp3',  // 确保文件路径正确
    color: '#d4a574'
  },
  {
    id: 'keyboard',
    name: '键盘声',
    icon: '⌨️',
    file: './sounds/keyboard.mp3',  // 确保文件路径正确
    color: '#b9b4c7'
  }
]

export function useSoundMixer() {
  // 状态管理
  const sounds = ref([])
  const isPlaying = ref(false)
  const globalVolume = ref(0.5)
  const isLoading = ref(false)
  const error = ref(null)
  const loadProgress = ref(0)  // 新增：加载进度

  // 初始化音频对象
  const initializeSounds = () => {
    console.log('初始化音频配置...')
    sounds.value = SOUND_CONFIG.map(sound => ({
      ...sound,
      audio: null,
      volume: 0.5,
      isActive: false,
      isLoading: false,
      displayName: sound.name
    }))
  }

  // 改进的音频预加载函数
  const preloadSounds = async () => {
    console.log('开始预加载音频...')
    isLoading.value = true
    error.value = null
    loadProgress.value = 0

    try {
      const totalSounds = sounds.value.length
      let loadedCount = 0

      // 使用for循环按顺序加载，避免并发问题
      for (let i = 0; i < totalSounds; i++) {
        const sound = sounds.value[i]
        
        try {
          sound.isLoading = true
          console.log(`正在加载: ${sound.name} (${sound.file})`)
          
          const audio = new Audio()
          
          // 设置音频事件监听
          const loadPromise = new Promise((resolve, reject) => {
            const handleCanPlay = () => {
              console.log(`✅ ${sound.name} 可以播放`)
              cleanup()
              resolve()
            }
            
            const handleError = (err) => {
              console.error(`❌ 加载失败: ${sound.name}`, err)
              cleanup()
              reject(new Error(`无法加载音频: ${sound.name} (${sound.file})`))
            }
            
            const cleanup = () => {
              audio.removeEventListener('canplaythrough', handleCanPlay)
              audio.removeEventListener('error', handleError)
              clearTimeout(timeoutId)
            }
            
            audio.addEventListener('canplaythrough', handleCanPlay, { once: true })
            audio.addEventListener('error', handleError, { once: true })
            
            // 设置较短的超时时间
            const timeoutId = setTimeout(() => {
              console.warn(`⏰ ${sound.name} 加载超时`)
              cleanup()
              // 即使超时也继续，不阻塞其他音频
              resolve()
            }, 5000) // 5秒超时
            
            // 开始加载
            audio.src = sound.file
            audio.volume = 0
            audio.loop = true
            audio.preload = 'auto'
            audio.load()
          })

          await loadPromise
          
          // 设置循环播放
          audio.addEventListener('ended', () => {
            if (sound.isActive) {
              audio.currentTime = 0
              audio.play().catch(console.error)
            }
          })

          sound.audio = audio
          sound.isLoading = false
          
        } catch (err) {
          console.error(`音频加载错误: ${sound.name}`, err)
          sound.isLoading = false
          // 即使单个音频失败也继续加载其他音频
        } finally {
          loadedCount++
          loadProgress.value = Math.round((loadedCount / totalSounds) * 100)
          console.log(`加载进度: ${loadProgress.value}%`)
        }
      }

      console.log('所有音频加载完成')
      
    } catch (err) {
      console.error('音频预加载失败:', err)
      error.value = '音频加载失败，请检查控制台或刷新页面'
    } finally {
      isLoading.value = false
      console.log('音频加载状态: 完成')
    }
  }

  // 立即加载一个测试音频（快速反馈）
  const loadTestAudio = async () => {
    if (sounds.value.length > 0) {
      const testSound = sounds.value[0]
      try {
        const audio = new Audio()
        audio.src = testSound.file
        audio.preload = 'auto'
        await new Promise((resolve, reject) => {
          audio.addEventListener('canplaythrough', resolve, { once: true })
          audio.addEventListener('error', reject, { once: true })
          audio.load()
        })
        return true
      } catch (err) {
        console.error('测试音频加载失败:', err)
        return false
      }
    }
    return false
  }

  // 切换单个音效
  const toggleSound = (soundId) => {
    const sound = sounds.value.find(s => s.id === soundId)
    if (!sound) return

    if (!sound.audio) {
      console.warn(`音频未加载: ${sound.name}`)
      error.value = `${sound.name} 未加载完成`
      return
    }

    sound.isActive = !sound.isActive

    if (sound.isActive) {
      sound.audio.volume = sound.volume * globalVolume.value
      sound.audio.play().catch(err => {
        console.error(`播放失败: ${sound.name}`, err)
        sound.isActive = false
        error.value = `播放失败: ${sound.name}`
      })
    } else {
      sound.audio.pause()
    }

    updateGlobalPlayState()
  }

  // 设置音量
  const setVolume = ({ soundId, volume }) => {
    if (soundId) {
      const sound = sounds.value.find(s => s.id === soundId)
      if (sound && sound.audio) {
        sound.volume = volume
        sound.audio.volume = volume * globalVolume.value
      }
    } else {
      globalVolume.value = volume
      sounds.value.forEach(sound => {
        if (sound.audio && sound.isActive) {
          sound.audio.volume = sound.volume * volume
        }
      })
    }
  }

  // 切换所有音效
  const toggleAllSounds = () => {
    isPlaying.value = !isPlaying.value
    
    sounds.value.forEach(sound => {
      if (sound.audio) {
        if (isPlaying.value && !sound.isActive) {
          sound.isActive = true
          sound.audio.volume = sound.volume * globalVolume.value
          sound.audio.play().catch(err => {
            console.error(`播放失败: ${sound.name}`, err)
            sound.isActive = false
          })
        } else if (!isPlaying.value && sound.isActive) {
          sound.isActive = false
          sound.audio.pause()
        }
      }
    })
  }

  // 更新全局播放状态
  const updateGlobalPlayState = () => {
    isPlaying.value = sounds.value.some(sound => sound.isActive)
  }

  // 计算活跃音效数量
  const activeSoundsCount = computed(() => {
    return sounds.value.filter(sound => sound.isActive).length
  })

  // 计算已加载音频数量
  const loadedSoundsCount = computed(() => {
    return sounds.value.filter(sound => sound.audio !== null).length
  })

  // 清理资源
  const cleanup = () => {
    sounds.value.forEach(sound => {
      if (sound.audio) {
        sound.audio.pause()
        sound.audio = null
      }
    })
  }

  // 初始化
  initializeSounds()

  return {
    sounds,
    isPlaying,
    globalVolume,
    isLoading,
    error,
    loadProgress,
    activeSoundsCount,
    loadedSoundsCount,
    toggleSound,
    setVolume,
    toggleAllSounds,
    preloadSounds,
    loadTestAudio,
    cleanup
  }
}