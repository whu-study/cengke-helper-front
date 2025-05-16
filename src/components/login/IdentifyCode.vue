<template>
  <div class="captcha-box" @click="generateCode">
    <canvas ref="canvas" :width="contentWidth" :height="contentHeight"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, withDefaults } from 'vue'

const props = withDefaults(defineProps<{
  identifyCode?: string
  contentWidth?: number
  contentHeight?: number
  fontSizeMin?: number
  fontSizeMax?: number
}>(), {
  identifyCode: '1234',
  contentWidth: 120,
  contentHeight: 40,
  fontSizeMin: 25,
  fontSizeMax: 35
})

const emit = defineEmits(['updateCode'])

const code = ref('')
const canvas = ref<HTMLCanvasElement>()
const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'

const randomNum = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min) + min)

const randomColor = (min: number, max: number) =>
    `rgb(${randomNum(min, max)}, ${randomNum(min, max)}, ${randomNum(min, max)})`

const draw = () => {
  if (!canvas.value) return

  const ctx = canvas.value.getContext('2d')!
  ctx.clearRect(0, 0, props.contentWidth, props.contentHeight)

  // 绘制渐变背景
  const gradient = ctx.createLinearGradient(0, 0, props.contentWidth, props.contentHeight)
  gradient.addColorStop(0, randomColor(180, 240))
  gradient.addColorStop(1, randomColor(180, 240))
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, props.contentWidth, props.contentHeight)

  // 绘制干扰线（曲线）
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = randomColor(40, 180)
    ctx.beginPath()
    ctx.moveTo(
        randomNum(-10, props.contentWidth + 10),
        randomNum(-10, props.contentHeight + 10)
    )
    ctx.bezierCurveTo(
        randomNum(0, props.contentWidth),
        randomNum(0, props.contentHeight),
        randomNum(0, props.contentWidth),
        randomNum(0, props.contentHeight),
        randomNum(-10, props.contentWidth + 10),
        randomNum(-10, props.contentHeight + 10)
    )
    ctx.stroke()
  }

  // 绘制文字
  const codeArr = code.value.split('')
  codeArr.forEach((char, i) => {
    const fontSize = randomNum(props.fontSizeMin, props.fontSizeMax)
    ctx.font = `${fontSize}px Arial`
    ctx.fillStyle = randomColor(50, 160)
    ctx.textBaseline = 'middle' // 修改基线对齐方式

    // 计算文字位置
    const x = (props.contentWidth / (codeArr.length + 1)) * (i + 1)
    const y = props.contentHeight / 2 + randomNum(-3, 3)

    // 文字旋转
    const deg = randomNum(-25, 25)
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate((deg * Math.PI) / 180)
    ctx.fillText(char, 0, 0)
    ctx.restore()
  })

  // 添加噪点
  const imageData = ctx.getImageData(0, 0, props.contentWidth, props.contentHeight)
  const pixels = imageData.data
  for (let i = 0; i < pixels.length; i += 4) {
    if (Math.random() < 0.1) {
      pixels[i] = pixels[i + 1] = pixels[i + 2] = randomNum(0, 255)
    }
  }
  ctx.putImageData(imageData, 0, 0)
}

const generateCode = () => {
  code.value = ''
  for (let i = 0; i < 4; i++) {
    code.value += chars[randomNum(0, chars.length)]
  }

  emit('updateCode', code.value)
  draw()
}

generateCode()

onMounted(() => {
  draw()
})

//watch(() => code.value, draw)
</script>

<style scoped>
.captcha-box {
  cursor: pointer;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: border-color 0.2s;
  display: inline-block;
  line-height: 0;  /* 修复容器下方空白 */
  overflow: hidden;
}

.captcha-box:hover {
  border-color: #409eff;
}

canvas {
  display: block;  /* 消除行内元素间隙 */
  margin: 2px;     /* 增加细微边距 */
}
</style>