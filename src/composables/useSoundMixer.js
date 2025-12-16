import { ref, computed } from 'vue'

// 音频配置
const SOUND_CONFIG = [
  {
    id: 'rain',
    name: '下雨声',
    icon: '🌧️',
    file: '/sounds/rain.mp3',
    color: '#4facfe'
  },
  {
    id: 'waves',
    name: '海浪声',
    icon: '🌊',
    file: '/sounds/waves.mp3',
    color: '#a8edea'
  },
  {
    id: 'fireplace',
    name: '火炉声',
    icon: '🔥',
    file: '/sounds/fireplace.mp3',
    color: '#ff9a9e'
  },
  {
    id: 'forest',
    name: '森林声',
    icon: '🌲',
    file: '/sounds/forest.mp3',
    color: '#a3b18a'
  },
  {
    id: 'coffee',
    name: '咖啡厅',
    icon: '☕',
    file: '/sounds/coffee.mp3',
    color: '#d4a574'
  },
  {
    id: 'keyboard',
    name: '键盘声',
    icon: '⌨️',
    file: '/sounds/keyboard.mp3',
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

  // 初始化音频对象
  const initializeSounds = () => {
    sounds.value = SOUND_CONFIG.map(sound => ({
      ...sound,
      audio: null,
      volume: 0.5,
      isActive: false,
      isLoading: false
    }))
  }

  // 预加载所有音频
  const preloadSounds = async () => {
    isLoading.value = true
    error.value = null

    try {
      const soundPromises = sounds.value.map(async (sound, index) => {
        try {
          sounds.value[index].isLoading = true
          
          const audio = new Audio()
          audio.src = sound.file
          audio.volume = sound.volume
          audio.loop = true
          audio.preload = 'auto'

          // 等待音频可以播放
          await new Promise((resolve, reject) => {
            audio.addEventListener('canplaythrough', resolve, { once: true })
            audio.addEventListener('error', reject, { once: true })
            
            // 设置超时时间
            const timeout = setTimeout(() => {
              reject(new Error(`音频加载超时: ${sound.name}`))
            }, 10000)
            
            audio.addEventListener('canplaythrough', () => {
              clearTimeout(timeout)
              resolve()
            }, { once: true })
          })

          sounds.value[index].audio = audio
          sounds.value[index].isLoading = false
        } catch (err) {
          sounds.value[index].isLoading = false
          throw new Error(`加载音频失败 (${sound.name}): ${err.message}`)
        }
      })

      await Promise.all(soundPromises)
    } catch (err) {
      error.value = err.message
      console.error('音频预加载错误:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 切换单个音效
  const toggleSound = (soundId) => {
    const soundIndex = sounds.value.findIndex(s => s.id === soundId)
    if (soundIndex === -1) return

    const sound = sounds.value[soundIndex]
    
    if (!sound.audio) {
      error.value = `音频未加载: ${sound.name}`
      return
    }

    sound.isActive = !sound.isActive

    if (sound.isActive) {
      sound.audio.volume = sound.volume * globalVolume.value
      sound.audio.play().catch(err => {
        console.error(`播放音频失败 (${sound.name}):`, err)
        sound.isActive = false
        error.value = `播放失败: ${sound.name}`
      })
    } else {
      sound.audio.pause()
    }

    // 更新全局播放状态
    updateGlobalPlayState()
  }

  // 设置音量
  const setVolume = ({ soundId, volume }) => {
    if (soundId) {
      // 设置单个音效音量
      const sound = sounds.value.find(s => s.id === soundId)
      if (sound && sound.audio) {
        sound.volume = volume
        sound.audio.volume = volume * globalVolume.value
      }
    } else {
      // 设置全局音量
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
            console.error(`播放音频失败 (${sound.name}):`, err)
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

  // 计算属性：活跃的音效数量
  const activeSoundsCount = computed(() => {
    return sounds.value.filter(sound => sound.isActive).length
  })

  // 初始化
  initializeSounds()

  return {
    sounds,
    isPlaying,
    globalVolume,
    isLoading,
    error,
    activeSoundsCount,
    toggleSound,
    setVolume,
    toggleAllSounds,
    preloadSounds
  }
}