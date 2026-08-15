<template>
  <div class="jitter-chart" role="img" :aria-label="ariaLabel">
    <canvas ref="canvas" />
    <div class="jitter-axis" aria-hidden="true">
      <span v-for="tick in ticks" :key="tick" :style="{ left: `${tick / maxMonth * 100}%` }">{{ tick === maxMonth ? `${tick}+` : tick }}</span>
    </div>
    <strong>Waiting time (months)</strong>
  </div>
</template>

<script setup lang="ts">
interface Point { months: number, approved: boolean }

const props = defineProps<{
  points: Point[]
  median: number
  q1: number
  q3: number
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
const maxMonth = 30
const ticks = Array.from({ length: 11 }, (_, index) => index * 3)
let frame = 0
let observer: ResizeObserver | undefined

const ariaLabel = computed(() => `Jitter plot of approved and rejected applications by waiting time. Median ${props.median} months. Middle 50% from ${props.q1} to ${props.q3} months.`)

const draw = (progress = 1) => {
  const element = canvas.value
  if (!element) return
  const rect = element.getBoundingClientRect()
  const ratio = window.devicePixelRatio || 1
  element.width = Math.max(1, Math.round(rect.width * ratio))
  element.height = Math.max(1, Math.round(rect.height * ratio))
  const context = element.getContext('2d')
  if (!context) return
  context.scale(ratio, ratio)

  const width = rect.width
  const height = rect.height
  const x = (value: number) => Math.min(width - 4, Math.max(4, Math.min(value, maxMonth) / maxMonth * width))
  context.clearRect(0, 0, width, height)

  context.fillStyle = 'rgba(21,91,54,.07)'
  context.fillRect(x(props.q1), 9, Math.max(1, x(props.q3) - x(props.q1)), height - 18)
  context.setLineDash([4, 4])
  context.strokeStyle = '#969994'
  context.lineWidth = 1
  ;[props.q1, props.q3].forEach(value => {
    context.beginPath()
    context.moveTo(x(value), 8)
    context.lineTo(x(value), height - 8)
    context.stroke()
  })
  context.setLineDash([])
  context.strokeStyle = '#c72b20'
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(x(props.median), 5)
  context.lineTo(x(props.median), height - 5)
  context.stroke()

  const visible = Math.ceil(props.points.length * progress)
  props.points.slice(0, visible).forEach((point, index) => {
    const base = point.approved ? height * .35 : height * .68
    const jitter = Math.sin(index * 12.9898) * Math.min(22, height * .11)
    context.beginPath()
    context.arc(x(point.months), base + jitter, 3.4, 0, Math.PI * 2)
    context.fillStyle = point.approved ? '#155b36' : '#c72b20'
    context.fill()
  })
}

const animate = () => {
  cancelAnimationFrame(frame)
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    draw()
    return
  }
  const start = performance.now()
  const step = (now: number) => {
    const elapsed = Math.min(1, (now - start) / 650)
    draw(elapsed)
    if (elapsed < 1) frame = requestAnimationFrame(step)
  }
  frame = requestAnimationFrame(step)
}

onMounted(() => {
  observer = new ResizeObserver(animate)
  if (canvas.value) observer.observe(canvas.value)
  animate()
})
onBeforeUnmount(() => {
  observer?.disconnect()
  cancelAnimationFrame(frame)
})
watch(() => [props.points, props.median, props.q1, props.q3], animate, { deep: true })
</script>
