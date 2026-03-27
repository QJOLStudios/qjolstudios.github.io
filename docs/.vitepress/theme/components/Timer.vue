<template>
  <div class="timer-section">
    <div class="timer-label">我们已经坚持了</div>
    <div class="timer-display">{{ timerText }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const timerText = ref('计算中...')
let intervalId = null

function updateTimer() {
  const startDate = new Date('2026-03-22T00:00:00')
  const now = new Date()
  const diff = now - startDate
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  timerText.value = `${days}天${hours}时${minutes}分${seconds}秒`
}

onMounted(() => {
  updateTimer()
  intervalId = setInterval(updateTimer, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<style scoped>
.timer-section {
  text-align: center;
  padding: 40px 24px;
  margin-top: 40px;
  border-top: 1px solid var(--vp-c-divider);
}

.timer-label {
  font-size: 16px;
  color: var(--vp-c-text-2);
  margin-bottom: 8px;
}

.timer-display {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  font-family: var(--vp-font-family-base);
}
</style>
