// src/utils/audioManager.js
class AudioManager {
  constructor() {
    this.audioContext = null
    this.sounds = new Map() // 存储所有音频实例
    this.globalVolume = 0.7
    this.isInitialized = false
  }

  // 初始化音频上下文（需用户交互后调用）
  init() {
    if (this.isInitialized) return
    
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      this.audioContext = new AudioContext()
      this.isInitialized = true
      console.log('AudioContext 初始化成功')
    } catch (error) {
      console.error('AudioContext 初始化失败:', error)
      // 降级方案：使用HTML5 Audio
      this.useFallback = true
    }
  }

  // 创建音频实例
  async createSound(id, url, options = {}) {
    if (!this.isInitialized && !this.useFallback) {
      this.init()
    }

    const sound = {
      id,
      url,
      volume: options.volume || 0.5,
      isPlaying: false,
      loop: options.loop !== false, // 默认循环
      fadeDuration: options.fadeDuration || 0.3,
      audioNode: null,
      gainNode: null,
      sourceNode: null
    }

    try {
      if (this.useFallback) {
        // 使用HTML5 Audio作为降级方案
        sound.audioElement = new Audio(url)
        sound.audioElement.loop = sound.loop
        sound.audioElement.volume = sound.volume * this.globalVolume
      } else {
        // 使用Web Audio API
        await this.loadWithWebAudio(sound)
      }
      
      this.sounds.set(id, sound)
      return sound
    } catch (error) {
      console.error(`加载音频失败 ${url}:`, error)
      throw error
    }
  }

  // 使用Web Audio API加载音频
  async loadWithWebAudio(sound) {
    const response = await fetch(sound.url)
    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
    
    sound.audioBuffer = audioBuffer
  }

  // 播放音频
  play(id) {
    const sound = this.sounds.get(id)
    if (!sound) {
      console.warn(`音频 ${id} 不存在`)
      return
    }

    if (sound.isPlaying) return

    try {
      if (this.useFallback) {
        // HTML5 Audio播放
        sound.audioElement.play()
      } else {
        // Web Audio API播放
        sound.sourceNode = this.audioContext.createBufferSource()
        sound.sourceNode.buffer = sound.audioBuffer
        sound.sourceNode.loop = sound.loop
        
        sound.gainNode = this.audioContext.createGain()
        sound.gainNode.gain.value = sound.volume * this.globalVolume
        
        sound.sourceNode.connect(sound.gainNode)
        sound.gainNode.connect(this.audioContext.destination)
        
        sound.sourceNode.start(0)
        sound.audioNode = sound.sourceNode
      }
      
      sound.isPlaying = true
      this.fadeIn(id)
    } catch (error) {
      console.error(`播放音频失败 ${id}:`, error)
    }
  }

  // 暂停音频
  pause(id) {
    const sound = this.sounds.get(id)
    if (!sound || !sound.isPlaying) return

    this.fadeOut(id, () => {
      if (this.useFallback) {
        sound.audioElement.pause()
        sound.audioElement.currentTime = 0
      } else {
        sound.sourceNode?.stop()
        sound.sourceNode?.disconnect()
        sound.gainNode?.disconnect()
      }
      sound.isPlaying = false
    })
  }

  // 设置单个音频音量
  setVolume(id, volume) {
    const sound = this.sounds.get(id)
    if (!sound) return

    sound.volume = Math.max(0, Math.min(1, volume))
    
    if (sound.isPlaying) {
      if (this.useFallback) {
        sound.audioElement.volume = sound.volume * this.globalVolume
      } else if (sound.gainNode) {
        const currentTime = this.audioContext.currentTime
        sound.gainNode.gain.linearRampToValueAtTime(
          sound.volume * this.globalVolume,
          currentTime + sound.fadeDuration
        )
      }
    }
  }

  // 设置全局音量
  setGlobalVolume(volume) {
    this.globalVolume = Math.max(0, Math.min(1, volume))
    
    this.sounds.forEach(sound => {
      if (sound.isPlaying) {
        this.setVolume(sound.id, sound.volume)
      }
    })
  }

  // 淡入效果
  fadeIn(id) {
    const sound = this.sounds.get(id)
    if (!sound || !sound.isPlaying || this.useFallback) return

    if (sound.gainNode) {
      sound.gainNode.gain.cancelScheduledValues(this.audioContext.currentTime)
      sound.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      sound.gainNode.gain.linearRampToValueAtTime(
        sound.volume * this.globalVolume,
        this.audioContext.currentTime + sound.fadeDuration
      )
    }
  }

  // 淡出效果
  fadeOut(id, callback) {
    const sound = this.sounds.get(id)
    if (!sound || this.useFallback) {
      callback?.()
      return
    }

    if (sound.gainNode) {
      const currentTime = this.audioContext.currentTime
      sound.gainNode.gain.cancelScheduledValues(currentTime)
      sound.gainNode.gain.setValueAtTime(
        sound.volume * this.globalVolume,
        currentTime
      )
      sound.gainNode.gain.linearRampToValueAtTime(0, currentTime + sound.fadeDuration)
      
      setTimeout(callback, sound.fadeDuration * 1000)
    } else {
      callback?.()
    }
  }

  // 播放全部
  playAll() {
    this.sounds.forEach(sound => {
      if (!sound.isPlaying) {
        this.play(sound.id)
      }
    })
  }

  // 暂停全部
  pauseAll() {
    this.sounds.forEach(sound => {
      if (sound.isPlaying) {
        this.pause(sound.id)
      }
    })
  }

  // 销毁音频实例
  destroy(id) {
    const sound = this.sounds.get(id)
    if (!sound) return

    this.pause(id)
    
    if (this.useFallback) {
      sound.audioElement.src = ''
    } else {
      sound.sourceNode?.disconnect()
      sound.gainNode?.disconnect()
      sound.audioBuffer = null
    }
    
    this.sounds.delete(id)
  }

  // 销毁所有音频
  destroyAll() {
    this.sounds.forEach((_, id) => this.destroy(id))
    this.sounds.clear()
  }
}

// 创建单例实例
const audioManager = new AudioManager()

export default audioManager