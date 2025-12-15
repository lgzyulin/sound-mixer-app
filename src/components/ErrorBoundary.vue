<template>
  <div v-if="hasError" class="error-boundary">
    <h3>😅 出了点小问题</h3>
    <p>页面加载失败，请刷新重试</p>
    <button @click="reloadPage">重新加载</button>
  </div>
  <slot v-else></slot>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)

onErrorCaptured((error) => {
  hasError.value = true
  console.error('组件错误:', error)
  return false
})

const reloadPage = () => {
  window.location.reload()
}
</script>