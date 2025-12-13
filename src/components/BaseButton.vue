<!-- src/components/BaseButton.vue - 基础按钮组件 -->
<template>
  <button
    :class="[
      'base-button',
      `base-button--${type}`,
      { 'base-button--round': round }
    ]"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </button>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'primary', // primary, secondary, outline
    validator: (value) => ['primary', 'secondary', 'outline'].includes(value)
  },
  round: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>

<style scoped>
.base-button {
  padding: 12px 24px;
  border: none;
  border-radius: var(--radius-medium);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.base-button--primary {
  background-color: var(--color-primary);
  color: white;
}

.base-button--primary:hover {
  background-color: #7ab0c2;
  transform: translateY(-1px);
  box-shadow: var(--shadow-soft);
}

.base-button--secondary {
  background-color: var(--color-secondary);
  color: white;
}

.base-button--outline {
  background-color: transparent;
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
}

.base-button--round {
  border-radius: 50%;
  width: 48px;
  height: 48px;
  padding: 0;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .base-button {
    padding: 16px 20px;
    font-size: 1.1rem;
  }
}
</style>