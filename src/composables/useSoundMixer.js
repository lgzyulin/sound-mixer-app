// src/composables/useSoundMixer.js
import { ref, reactive, computed } from 'vue'

// 检查是否为HBuilderX环境
const isHBuilderX = !!(window.plus && window.plus.runtime)

export function useSoundMixer() {
  // 现有的状态和逻辑保持不变
  const sounds = ref([])
  const isLoading = ref(true)
  const error = ref(null)
  const loadedSoundsCount = ref(0)
  
  // 音频配置 - 修改路径为相对路径
  const soundConfig = [
    { id: 'rain', name: '下雨声', file: './sounds/rain.mp3', volume: 0.5, isActive: false },
    { id: 'waves', name: '海浪声', file: './sounds/waves.mp3', volume: 0.5, isActive: false },
    { id: 'fireplace', name: '火炉声', file: './sounds/fireplace.mp3', volume: 0.5, isActive: false },
    { id: 'forest', name: '森林声', file: './sounds/forest.mp3', volume: 0.5, isActive: false },
    { id: 'coffee', name: '咖啡厅', file: './sounds/coffee.mp3', volume: 0.5, isActive: false },
    { id: 'keyboard', name: '键盘声', file: './sounds/keyboard.mp3', volume: 0.5, isActive: false }
  ]

  // 修改音频加载逻辑
  const loadAudio = (sound) => {
    return new Promise((resolve, reject) => {
      console.log(`正在加载: ${sound.name} (${sound.file})`)
      
      // HBuilderX环境使用5+ API
      if (isHBuilderX && window.plus && window.plus.audio) {
        loadWithPlusAPI(sound, resolve, reject)
      } else {
        // 非HBuilderX环境使用Web Audio API
        loadWithWebAPI(sound, resolve, reject)
      }
    })
  }

  // HBuilderX 5+ API加载方式
  const loadWithPlusAPI = (sound, resolve, reject) => {
    try {
      // 在HBuilderX中，路径需要加上_www前缀
      const audioPath = `_www/${sound.file.replace('./', '')}`
      console.log(`5+ API加载路径: ${audioPath}`)
      
      const player = plus.audio.createPlayer(audioPath)
      
      // 预加载：播放后立即停止
      player.play(() => {
        player.stop()
        resolve({
          ...sound,
          player: player,
          audioType: 'plus',
          play: () => {
            return new Promise((playResolve, playReject) => {
              player.play(() => playResolve(), (error) => playReject(error))
            })
          },
          stop: () => player.stop(),
          setVolume: (volume) => {
            if (player.setVolume) {
              player.setVolume(volume)
            } else {
              player.volume = volume
            }
          }
        })
      })
      
      player.addEventListener('error', (e) => {
        console.error(`❌ 5+ API加载失败: ${sound.name}`, e)
        reject(new Error(`5+ API加载失败: ${JSON.stringify(e)}`))
      })
    } catch (err) {
      console.error(`❌ 5+ API初始化错误: ${sound.name}`, err)
      reject(new Error(`5+ API初始化错误: ${err.message}`))
    }
  }

  // Web Audio API加载方式
  const loadWithWebAPI = (sound, resolve, reject) => {
    const audio = new Audio(sound.file)
    audio.preload = 'auto'
    
    const handleSuccess = () => {
      audio.removeEventListener('canplaythrough', handleSuccess)
      audio.removeEventListener('error', handleError)
      resolve({
        ...sound,
        audio: audio,
        audioType: 'web',
        play: () => audio.play(),
        stop: () => {
          audio.pause()
          audio.currentTime = 0
        },
        setVolume: (volume) => {
          audio.volume = volume
        }
      })
    }
    
    const handleError = (e) => {
      audio.removeEventListener('canplaythrough', handleSuccess)
      audio.removeEventListener('error', handleError)
      console.error(`❌ Web Audio加载失败: ${sound.name}`, audio.error)
      reject(new Error(`Web Audio错误: ${audio.error ? audio.error.message : '未知错误'}`))
    }
    
    audio.addEventListener('canplaythrough', handleSuccess)
    audio.addEventListener('error', handleError)
    
    // 开始加载
    audio.load()
    
    // 设置超时
    setTimeout(() => {
      if (!audio.readyState || audio.readyState < 3) {
        handleError(new Error('加载超时'))
      }
    }, 10000)
  }

  // 预加载音频（修改现有preloadSounds函数）
  const preloadSounds = async () => {
    isLoading.value = true
    error.value = null
    loadedSoundsCount.value = 0
    
    try {
      const soundPromises = soundConfig.map(async (config, index) => {
        try {
          const sound = await loadAudio(config)
          loadedSoundsCount.value = index + 1
          return sound
        } catch (err) {
          console.error(`音频加载错误: ${config.name} Error: ${err.message}`)
          // 即使某个音频加载失败，也继续加载其他音频
          return null
        }
      })
      
      const results = await Promise.all(soundPromises)
      sounds.value = results.filter(sound => sound !== null)
      
      if (sounds.value.length === 0) {
        throw new Error('所有音频加载失败')
      }
      
      console.log(`音频加载状态: 完成 (${sounds.value.length}/${soundConfig.length})`)
    } catch (err) {
      error.value = err.message
      console.error('音频预加载失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 现有的其他函数保持不变（toggleSound, setVolume, toggleAllSounds等）
  const toggleSound = async (soundId) => {
    const sound = sounds.value.find(s => s.id === soundId)
    if (!sound) return
    
    try {
      if (sound.isActive) {
        sound.stop()
        sound.isActive = false
      } else {
        await sound.play()
        sound.isActive = true
      }
    } catch (err) {
      console.error(`切换音频状态失败: ${sound.name}`, err)
    }
  }

  const setVolume = ({ soundId, volume }) => {
    if (soundId) {
      const sound = sounds.value.find(s => s.id === soundId)
      if (sound) {
        sound.volume = volume
        sound.setVolume(volume)
      }
    } else {
      // 全局音量
      sounds.value.forEach(sound => {
        sound.volume = volume
        sound.setVolume(volume)
      })
    }
  }

  const toggleAllSounds = async () => {
    const isAnyPlaying = sounds.value.some(s => s.isActive)
    
    if (isAnyPlaying) {
      // 暂停所有
      sounds.value.forEach(sound => {
        if (sound.isActive) {
          sound.stop()
          sound.isActive = false
        }
      })
    } else {
      // 播放所有
      for (const sound of sounds.value) {
        try {
          await sound.play()
          sound.isActive = true
        } catch (err) {
          console.error(`播放音频失败: ${sound.name}`, err)
        }
      }
    }
  }

  const isPlaying = computed(() => sounds.value.some(s => s.isActive))
  const globalVolume = computed(() => sounds.value.length > 0 ? sounds.value[0].volume : 0.5)

  const cleanup = () => {
    sounds.value.forEach(sound => {
      if (sound.isActive) {
        sound.stop()
      }
    })
  }

  return {
    sounds,
    isPlaying,
    globalVolume,
    isLoading,
    error,
    loadedSoundsCount,
    toggleSound,
    setVolume,
    toggleAllSounds,
    preloadSounds,
    cleanup
  }
}