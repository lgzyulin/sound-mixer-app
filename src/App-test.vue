<template>
  <div id="test-app" style="padding: 20px; background: #4CAF50; color: white; font-size: 24px;">
    <h1>✅ 测试界面 - 可见性确认</h1>
    <p>如果看到这个绿色界面，说明应用正常运行</p>
    <p>当前时间: {{ currentTime }}</p>
    <button @click="refresh">刷新时间</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const currentTime = ref(new Date().toLocaleTimeString())

const refresh = () => {
  currentTime.value = new Date().toLocaleTimeString()
  console.log('时间已刷新:', currentTime.value)
}

onMounted(() => {
  console.log('测试组件已挂载')
  setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString()
  }, 1000)
})
</script>