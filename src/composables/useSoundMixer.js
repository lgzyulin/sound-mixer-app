import { ref, reactive, computed, onMounted } from 'vue'

// 检查是否为HBuilderX环境
const isHBuilderX = !!(window.plus && window.plus.runtime)

export function useSoundMixer() {
  const sounds = ref([])
  const isLoading = ref(true)
  const error = ref(null)
  const loadedSoundsCount = ref(0)
  
  // 音频配置
  const soundConfig = [
    { id: 'rain', name: '下雨声', file: './sounds/rain.mp3', volume: 0.5, isActive: false },
    { id: 'waves', name: '海浪声', file: './sounds/waves.mp3', volume: 0.5, isActive: false },
    { id: 'fireplace', name: '火炉声', file: './sounds/fireplace.mp3', volume: 0.5, isActive: false },
    { id: 'forest', name: '森林声', file: './sounds/forest.mp3', volume: 0.5, isActive: false },
    { id: 'coffee', name: '咖啡厅', file: './sounds/coffee.mp3', volume: 0.5, isActive: false },
    { id: 'keyboard', name: '键盘声', file: './sounds/keyboard.mp3', volume: 0.5, isActive: false }
  ]

  // 简化的音频加载函数
  const loadAudio = (sound) => {
    return new Promise((resolve, reject) => {
      console.log(`开始加载音频: ${sound.name}`)
      
      // 优先使用HBuilderX的5+ API
      if (isHBuilderX && window.plus && window.plus.audio) {
        try {
          const audioPath = `_www/${sound.file.replace('./', '')}`
          console.log(`使用5+ API加载: ${audioPath}`)
          
          const player = plus.audio.createPlayer(audioPath)
          
          // 简单测试播放
          player.play(() => {
            player.stop()
            resolve({
              ...sound,
              player: player,
              audioType: 'plus',
              play: () => player.play(),
              stop: () => player.stop(),
              setVolume: (volume) => { player.volume = volume }
            })
          })
          
          player.addEventListener('error', (e) => {
            console.error(`5+ API加载失败: ${sound.name}`, e)
            // 失败后尝试Web API
            loadWithWebAPI(sound, resolve, reject)
          })
        } catch (err) {
          console.error(`5+ API异常: ${sound.name}`, err)
          loadWithWebAPI(sound, resolve, reject)
        }
      } else {
        // 使用Web Audio API
        loadWithWebAPI(sound, resolve, reject)
      }
    })
  }

  // Web Audio API加载
  const loadWithWebAPI = (sound, resolve, reject) => {
    const audio = new Audio(sound.file)
    
    audio.addEventListener('canplaythrough', () => {
      console.log(`Web Audio加载成功: ${sound.name}`)
      resolve({
        ...sound,
        audio: audio,
        audioType: 'web',
        play: () => audio.play(),
        stop: () => { audio.pause(); audio.currentTime = 0 },
        setVolume: (volume) => { audio.volume = volume }
      })
    })
    
    audio.addEventListener('error', (e) => {
      console.error(`Web Audio加载失败: ${sound.name}`, audio.error)
      reject(new Error(`无法加载音频: ${sound.name}`))
    })
    
    audio.load()
  }

  // 预加载音频
  const preloadSounds = async () => {
    console.log('开始预加载所有音频...')
    isLoading.value = true
    error.value = null
    
    try {
      const loadPromises = soundConfig.map(async (config, index) => {
        try {
          const sound = await loadAudio(config)
          loadedSoundsCount.value = index + 1
          console.log(`✅ 加载成功: ${sound.name}`)
          return sound
        } catch (err) {
          console.error(`❌ 加载失败: ${config.name}`, err)
          // 返回一个模拟的sound对象，避免整个应用崩溃
          return {
            ...config,
            audioType: 'mock',
            play: () => Promise.resolve(),
            stop: () => {},
            setVolume: () => {}
          }
        }
      })
      
      const results = await Promise.allSettled(loadPromises)
      sounds.value = results.map(result => result.value).filter(Boolean)
      
      console.log(`音频加载完成: ${sounds.value.length}/${soundConfig.length}`)
      
      if (sounds.value.length === 0) {
        throw new Error('所有音频加载失败')
      }
      
    } catch (err) {
      error.value = err.message
      console.error('音频预加载失败:', err)
    } finally {
      isLoading.value = false
      console.log('音频加载状态更新完成')
    }
  }

  // 其他函数保持不变...
  const toggleSound = async (soundId) => {
    const sound = sounds.value.find(s => s.id === soundId)
    if (!sound) return
    
    try {
      if (sound.isActive) {
        sound.stop()
        sound.isActive = false
        console.log(`停止: ${sound.name}`)
      } else {
        await sound.play()
        sound.isActive = true
        console.log(`播放: ${sound.name}`)
      }
    } catch (err) {
      console.error(`切换音频失败: ${sound.name}`, err)
    }
  }

  const setVolume = ({ soundId, volume }) => {
    if (soundId) {
      const sound = sounds.value.find(s => s.id === soundId)
      if (sound) {
        sound.volume = volume
        sound.setVolume(volume)
        console.log(`设置音量: ${sound.name} = ${volume}`)
      }
    } else {
      sounds.value.forEach(sound => {
        sound.volume = volume
        sound.setVolume(volume)
      })
      console.log(`设置全局音量: ${volume}`)
    }
  }

  const toggleAllSounds = async () => {
    const isAnyPlaying = sounds.value.some(s => s.isActive)
    console.log(`切换所有音频状态: 当前${isAnyPlaying ? '播放中' : '已停止'}`)
    
    if (isAnyPlaying) {
      sounds.value.forEach(sound => {
        if (sound.isActive) {
          sound.stop()
          sound.isActive = false
        }
      })
    } else {
      for (const sound of sounds.value) {
        try {
          await sound.play()
          sound.isActive = true
        } catch (err) {
          console.error(`播放失败: ${sound.name}`, err)
        }
      }
    }
  }

  const isPlaying = computed(() => {
    const playing = sounds.value.some(s => s.isActive)
    console.log(`计算播放状态: ${playing}`)
    return playing
  })

  const globalVolume = computed(() => 
    sounds.value.length > 0 ? sounds.value[0].volume : 0.5
  )

  const cleanup = () => {
    console.log('清理音频资源')
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