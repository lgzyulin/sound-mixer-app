// src/stores/audioStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import audioManager from '@/utils/audioManager'

// 预定义的音频配置
const SOUND_CONFIGS = [
  { id: 1, name: '轻柔雨声', emoji: '🌧️', file: 'rain.mp3', volume: 0.6 },
  { id: 2, name: '远方雷声', emoji: '⛈️', file: 'thunder.mp3', volume: 0.4 },
  { id: 3, name: '山间溪流', emoji: '🏞️', file: 'stream.mp3', volume: 0.7 },
  { id: 4, name: '徐徐微风', emoji: '🌬️', file: 'wind.mp3', volume: 0.5 },
  { id: 5, name: '温暖篝火', emoji: '🔥', file: 'fireplace.mp3', volume: 0.6 },
  { id: 6, name: '海边波浪', emoji: '🌊', file: 'waves.mp3', volume: 0.5 }
]

export const useAudioStore = defineStore('audio', () => {
  // 状态
  const sounds = ref([])
  const globalVolume = ref(0.7)
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const error = ref(null)

  // 计算属性
  const activeSounds = computed(() => sounds.value.filter(sound => sound.isPlaying))
  const activeCount = computed(() => activeSounds.value.length)
  const totalVolume = computed(() => {
    return sounds.value.reduce((sum, sound) => sum + sound.volume, 0)
  })

  // 初始化音频
  const initialize = async () => {
    if (isInitialized.value) return
    
    isLoading.value = true
    error.value = null
    
    try {
      // 初始化音频管理器
      audioManager.init()
      
      // 创建所有音频实例
      const soundPromises = SOUND_CONFIGS.map(async (config) => {
        const sound = {
          ...config,
          isPlaying: false,
          isLoading: true
        }
        
        try {
          // 这里需要将音频文件放在 public/sounds/ 目录下
          const audioUrl = `/sounds/${config.file}`
          await audioManager.createSound(config.id, audioUrl, {
            volume: config.volume,
            loop: true
          })
          
          sound.isLoading = false
          return sound
        } catch (err) {
          console.error(`加载音频失败 ${config.name}:`, err)
          sound.isLoading = false
          sound.error = '加载失败'
          return sound
        }
      })
      
      sounds.value = await Promise.all(soundPromises)
      isInitialized.value = true
    } catch (err) {
      error.value = err.message
      console.error('音频初始化失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 切换音频播放状态
  const toggleSound = async (id) => {
    if (!isInitialized.value) {
      await initialize()
    }
    
    const sound = sounds.value.find(s => s.id === id)
    if (!sound) return
    
    if (sound.isPlaying) {
      audioManager.pause(id)
      sound.isPlaying = false
    } else {
      try {
        await audioManager.play(id)
        sound.isPlaying = true
      } catch (err) {
        console.error(`播放音频失败 ${sound.name}:`, err)
        error.value = '播放失败，请检查音频文件'
      }
    }
  }

  // 设置音频音量
  const setSoundVolume = (id, volume) => {
    const sound = sounds.value.find(s => s.id === id)
    if (!sound) return
    
    const newVolume = Math.max(0, Math.min(1, volume))
    sound.volume = newVolume
    audioManager.setVolume(id, newVolume)
  }

  // 设置全局音量
  const setGlobalVolume = (volume) => {
    const newVolume = Math.max(0, Math.min(1, volume))
    globalVolume.value = newVolume
    audioManager.setGlobalVolume(newVolume)
  }

  // 播放全部
  const playAll = async () => {
    if (!isInitialized.value) {
      await initialize()
    }
    
    sounds.value.forEach(sound => {
      if (!sound.isPlaying) {
        toggleSound(sound.id)
      }
    })
  }

  // 暂停全部
  const pauseAll = () => {
    sounds.value.forEach(sound => {
      if (sound.isPlaying) {
        toggleSound(sound.id)
      }
    })
  }

  // 重置所有音量
  const resetVolumes = () => {
    sounds.value.forEach(sound => {
      setSoundVolume(sound.id, SOUND_CONFIGS.find(c => c.id === sound.id)?.volume || 0.5)
    })
    setGlobalVolume(0.7)
  }

  // 清理资源
  const cleanup = () => {
    audioManager.destroyAll()
    sounds.value = []
    isInitialized.value = false
  }

  return {
    // 状态
    sounds,
    globalVolume,
    isInitialized,
    isLoading,
    error,
    
    // 计算属性
    activeSounds,
    activeCount,
    totalVolume,
    
    // 方法
    initialize,
    toggleSound,
    setSoundVolume,
    setGlobalVolume,
    playAll,
    pauseAll,
    resetVolumes,
    cleanup
  }
})