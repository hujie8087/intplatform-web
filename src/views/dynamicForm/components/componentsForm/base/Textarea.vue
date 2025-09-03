<template>
  <div class="comp">
    <el-input
      size="default"
      type="textarea"
      :rows="3"
      :disabled="isDev"
      :title="isDev ? disableInputByDev : placeholder"
      v-model="value"
      class="item-comp"
      :placeholder="placeholder || '提示信息'"
    ></el-input>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { disableInputByDev } from "../../compConfig";

interface Props {
  id: string;
  placeholder: string;
  value: string | null;
  isDev: boolean;
}
const props = defineProps<Props>();
const value = ref(props.value || null);
</script>

<style lang="scss" scoped>
.comp,
.el-textarea__inner {
  padding: 6px 12px !important;
  font-size: 16px !important;
  color: rgb(73 96 141) !important;
  background: var(--el-input-bg-color, var(--el-fill-color-blank));
  border: none !important;
  border-radius: var(--el-input-border-radius, var(--el-border-radius-base));
  box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
  &:focus {
    outline: none;
    box-shadow: 0 0 0 1px #409eff inset;
  }
}
textarea.input-comp,
span.input-comp {
  background: aliceblue;
}
.desc_input .el-textarea__inner {
  font-size: 14px !important;
  color: rgb(0 0 0 / 45%) !important;
}
</style>
