<!-- src/components/SoundSlider.vue - 音量滑块组件 -->
<template>
  <div class="sound-slider">
    <div class="slider-wrapper">
      <input
        ref="slider"
        type="range"
        :value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        class="slider-input"
        @input="handleInput"
        @touchstart="isDragging = true"
        @touchend="isDragging = false"
      />
      <div class="slider-track">
        <div
          class="slider-fill"
          :style="{ width: fillPercentage }"
        ></div>
      </div>
    </div>
    <div class="slider-value">
      {{ Math.round(modelValue * 100) }}%
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0.5
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 1
  },
  step: {
    type: Number,
    default: 0.01
  }
})

const emit = defineEmits(['update:modelValue'])

const slider = ref(null)
const isDragging = ref(false)

const fillPercentage = computed(() => {
  return `${((props.modelValue - props.min) / (props.max - props.min)) * 100}%`
})

const handleInput = (event) => {
  const value = parseFloat(event.target.value)
  emit('update:modelValue', value)
}

// 移动端优化
onMounted(() => {
  if (slider.value) {
    // 移除默认的滑块样式
    slider.value.style.webkitAppearance = 'none'
  }
})
</script>

<style scoped>
.sound-slider {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 8px 0;
}

.slider-wrapper {
  flex: 1;
  position: relative;
  height: 24px;
  display: flex;
  align-items: center;
}

.slider-track {
  position: absolute;
  width: 100%;
  height: 6px;
  background-color: rgba(136, 192, 208, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.slider-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  border-radius: 3px;
  transition: width 0.1s ease;
}

.slider-input {
  position: relative;
  width: 100%;
  height: 24px;
  margin: 0;
  background: transparent;
  -webkit-appearance: none;
  appearance: none;
  z-index: 2;
  opacity: 0; /* 隐藏原生滑块，使用自定义样式 */
  cursor: pointer;
}

/* 移动端触摸区域优化 */
.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(136, 192, 208, 0.3);
  border: 3px solid white;
}

.slider-input::-moz-range-thumb {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(136, 192, 208, 0.3);
}

.slider-value {
  min-width: 50px;
  text-align: right;
  font-weight: 600;
  color: var(--color-primary);
  font-size: 0.9rem;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .sound-slider {
    padding: 12px 0;
  }
  
  .slider-input::-webkit-slider-thumb {
    width: 40px;
    height: 40px;
  }
}
</style>