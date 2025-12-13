<!-- src/components/SoundCard.vue - 声音卡片组件 -->
<template>
  <div
    :class="[
      'sound-card',
      { 'sound-card--active': isActive },
      { 'sound-card--disabled': disabled }
    ]"
    @click="handleClick"
  >
    <div class="sound-card__icon">
      <div class="icon-wrapper">
        <slot name="icon">
          <div class="default-icon">{{ soundEmoji }}</div>
        </slot>
      </div>
    </div>
    
    <div class="sound-card__content">
      <div class="sound-card__header">
        <h3 class="sound-card__title">{{ sound.name }}</h3>
        <div class="sound-card__status">
          <span v-if="isActive" class="status-indicator status-indicator--active"></span>
          <span v-else class="status-indicator"></span>
        </div>
      </div>
      
      <div class="sound-card__volume">
        <SoundSlider
          v-model="volume"
          :disabled="disabled"
          @update:modelValue="handleVolumeChange"
        />
      </div>
    </div>
    
    <div class="sound-card__actions">
      <BaseButton
        :type="isActive ? 'primary' : 'outline'"
        round
        @click.stop="toggleSound"
      >
        {{ isActive ? '⏸️' : '▶️' }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SoundSlider from './SoundSlider.vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  sound: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      name: '未知声音',
      volume: 0.5,
      isActive: false
    })
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle', 'volume-change'])

const volume = ref(props.sound.volume)
const isActive = ref(props.sound.isActive)

const soundEmoji = computed(() => {
  const emojiMap = {
    '雨声': '🌧️',
    '雷声': '⛈️',
    '溪流': '🏞️',
    '风声': '🌬️',
    '篝火': '🔥',
    '海浪': '🌊',
    '森林': '🌲',
    '咖啡厅': '☕',
    '键盘声': '⌨️'
  }
  return emojiMap[props.sound.name] || '🎵'
})

const handleClick = () => {
  if (props.disabled) return
  toggleSound()
}

const toggleSound = () => {
  isActive.value = !isActive.value
  emit('toggle', props.sound.id, isActive.value)
}

const handleVolumeChange = (newVolume) => {
  volume.value = newVolume
  emit('volume-change', props.sound.id, newVolume)
}
</script>

<style scoped>
.sound-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--color-card);
  border-radius: var(--radius-large);
  box-shadow: var(--shadow-soft);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
  margin-bottom: 12px;
}

.sound-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hard);
  border-color: rgba(136, 192, 208, 0.3);
}

.sound-card--active {
  border-color: var(--color-primary);
  background: linear-gradient(135deg, #f8f5f2, #ffffff);
}

.sound-card--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.sound-card--disabled:hover {
  transform: none;
  box-shadow: var(--shadow-soft);
}

.sound-card__icon {
  flex-shrink: 0;
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.default-icon {
  font-size: 2rem;
}

.sound-card__content {
  flex: 1;
  min-width: 0; /* 防止内容溢出 */
}

.sound-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.sound-card__title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #e5e9f0;
  display: inline-block;
}

.status-indicator--active {
  background-color: var(--color-secondary);
  box-shadow: 0 0 8px var(--color-secondary);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.sound-card__volume {
  width: 100%;
}

.sound-card__actions {
  flex-shrink: 0;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .sound-card {
    padding: 16px;
    gap: 12px;
  }
  
  .icon-wrapper {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
  
  .sound-card__title {
    font-size: 1rem;
  }
}
</style>