<template>
  <div class="barcode-container">
    <svg ref="barcodeRef" style="display: block; width: 100%; height: 100%"></svg>
  </div>
</template>

<script setup lang="ts" name="Barcode">
import JsBarcode from "jsbarcode";
import { ref, onMounted } from "vue";

const props = defineProps({
  value: {
    type: String,
    required: true
  },
  options: {
    type: Object,
    default: () => ({
      format: "CODE128",
      lineColor: "#000",
      background: "transparent",
      displayValue: true,
      width: 1.5, // 条形码单条宽度
      height: 28, // 条形码高度
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 20,
      marginRight: 20,
      fontSize: 14,
      textMargin: 0
    })
  }
});

const barcodeRef = ref<SVGElement>();

onMounted(() => {
  generateBarcode(props.value);
});

const generateBarcode = (value: string) => {
  if (value) {
    JsBarcode(barcodeRef.value as SVGElement, value, props.options);
    barcodeRef.value!.style.width = "100%";
    barcodeRef.value!.style.height = "auto";
  }
};
</script>
<style lang="scss" scoped>
.barcode-container {
  width: 100%; /* 父容器宽度 */
  height: auto; /* 自动高度 */
  margin-bottom: 10px;
}
</style>
