<template>
  <div :style="{ width: size + 'px', height: size + 'px' }">
    <!-- <canvas ref="qrcodeCanvas" style="width: 100%; height: 100%"></canvas> -->
    <img :src="qrBase64" style="width: 100%; height: 100%" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import QRCode from "qrcode";

const props = defineProps({
  size: {
    type: Number,
    default: 100
  },
  value: {
    type: String,
    default: ""
  },
  options: {
    type: Object,
    default: () => ({})
  }
});

const qrBase64 = ref("");

onMounted(() => {
  generateQR(props.value);
});

const generateQR = async text => {
  try {
    qrBase64.value = await QRCode.toDataURL(text, {
      width: props.size,
      height: props.size,
      margin: 1
    });
  } catch (err) {
    console.error(err);
  }
};

// 暴露qrBase64，使父组件能通过ref获取
defineExpose({
  qrBase64
});
</script>

<style lang="scss" scoped>
.print-qr-code {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
}
</style>
