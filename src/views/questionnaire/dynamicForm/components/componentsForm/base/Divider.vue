<template>
  <div>
    <el-divider order-style="double" :content-position="props.position" :border-style="props.dividerBorderType">
      {{ props.dividerValue }}
    </el-divider>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type: string;
  dividerValue: string;
  dividerBorderType: string; // 虚线类型
  position: string;
  isDev: boolean;
}
const props = defineProps<Props>();
</script>

<style lang="scss" scoped>
:deep {
  .el-divider__text {
    font-size: 14px !important;
    font-weight: 400 !important;
    color: #666666 !important;
  }
}
</style>
