// src/utils/audioManager.js 或类似路径
class AudioManager {
  constructor() {
    this.audios = new Map();
    this.isPlusEnv = !!(window.plus && plus.audio);
    console.log('初始化音频配置...');
  }

  async loadAllAudios() {
    console.log('开始预加载音频...');
    
    // 音频配置 - 使用相对路径
    const audioConfig = {
      rain: { file: 'rain.mp3', volume: 0.5 },
      waves: { file: 'waves.mp3', volume: 0.5 },
      fireplace: { file: 'fireplace.mp3', volume: 0.5 },
      forest: { file: 'forest.mp3', volume: 0.5 },
      coffee: { file: 'coffee.mp3', volume: 0.5 },
      keyboard: { file: 'keyboard.mp3', volume: 0.5 }
    };

    const total = Object.keys(audioConfig).length;
    let loaded = 0;
    const results = [];
    
    for (const [name, config] of Object.entries(audioConfig)) {
      try {
        console.log(`正在加载: ${this.getAudioDisplayName(name)} (./sounds/${config.file})`);
        
        const audio = await this.loadSingleAudio(name, config.file);
        this.audios.set(name, {
          ...audio,
          volume: config.volume,
          playing: false
        });
        
        loaded++;
        results.push({ name, status: 'success' });
        console.log(`✅ 加载成功: ${this.getAudioDisplayName(name)}`);
      } catch (error) {
        loaded++;
        results.push({ name, status: 'error', error: error.message });
        console.error(`❌ 加载失败: ${this.getAudioDisplayName(name)}`, error);
        console.error(`音频加载错误: ${this.getAudioDisplayName(name)} Error: ${error.message}`);
      }
      
      const progress = Math.round((loaded / total) * 100);
      console.log(`加载进度: ${progress}%`);
    }
    
    console.log('所有音频加载完成');
    console.log('音频加载状态: 完成');
    return results;
  }

  getAudioDisplayName(key) {
    const names = {
      rain: '下雨声',
      waves: '海浪声', 
      fireplace: '火炉声',
      forest: '森林声',
      coffee: '咖啡厅',
      keyboard: '键盘声'
    };
    return names[key] || key;
  }

  async loadSingleAudio(name, filename) {
    const filePath = `./sounds/${filename}`;
    
    if (this.isPlusEnv) {
      return this.loadWithPlusAPI(name, filePath);
    } else {
      return this.loadWithWebAPI(name, filePath);
    }
  }

  loadWithPlusAPI(name, filePath) {
    return new Promise((resolve, reject) => {
      // HBuilderX中，资源路径需要加上 _www 前缀
      const audioPath = `_www/${filePath.replace('./', '')}`;
      console.log(`5+ API加载路径: ${audioPath}`);
      
      try {
        const player = plus.audio.createPlayer(audioPath);
        
        // 预加载：播放后立即停止
        player.play(() => {
          player.stop();
          resolve({
            name,
            player,
            type: 'plus',
            play: () => {
              return new Promise((resolvePlay, rejectPlay) => {
                player.play(() => resolvePlay(), (error) => rejectPlay(error));
              });
            },
            stop: () => {
              player.stop();
            },
            setVolume: (volume) => {
              // 5+ API音量设置可能需要特定方法
              if (player.setVolume) {
                player.setVolume(volume);
              } else {
                player.volume = volume;
              }
            }
          });
        });
        
        player.addEventListener('error', (e) => {
          reject(new Error(`5+ API错误: ${JSON.stringify(e)}`));
        });
      } catch (error) {
        reject(new Error(`5+ API初始化错误: ${error.message}`));
      }
    });
  }

  loadWithWebAPI(name, filePath) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(filePath);
      audio.preload = 'auto';
      
      const handleSuccess = () => {
        audio.removeEventListener('canplaythrough', handleSuccess);
        audio.removeEventListener('error', handleError);
        resolve({
          name,
          audio,
          type: 'web',
          play: () => audio.play(),
          stop: () => {
            audio.pause();
            audio.currentTime = 0;
          },
          setVolume: (volume) => {
            audio.volume = volume;
          }
        });
      };
      
      const handleError = (e) => {
        audio.removeEventListener('canplaythrough', handleSuccess);
        audio.removeEventListener('error', handleError);
        reject(new Error(`Web Audio错误: ${audio.error ? audio.error.message : '未知错误'}`));
      };
      
      audio.addEventListener('canplaythrough', handleSuccess);
      audio.addEventListener('error', handleError);
      
      // 开始加载
      audio.load();
      
      // 设置超时
      setTimeout(() => {
        if (!audio.readyState || audio.readyState < 3) {
          handleError(new Error('加载超时'));
        }
      }, 10000);
    });
  }

  playAudio(name) {
    const audioObj = this.audios.get(name);
    if (audioObj && !audioObj.playing) {
      audioObj.playing = true;
      return audioObj.play();
    }
  }

  stopAudio(name) {
    const audioObj = this.audios.get(name);
    if (audioObj && audioObj.playing) {
      audioObj.playing = false;
      audioObj.stop();
    }
  }

  setVolume(name, volume) {
    const audioObj = this.audios.get(name);
    if (audioObj) {
      audioObj.volume = volume;
      audioObj.setVolume(volume);
    }
  }
}

// 创建单例
const audioManager = new AudioManager();
export default audioManager;