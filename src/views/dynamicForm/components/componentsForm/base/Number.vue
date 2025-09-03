<template>
  <el-input-number
    size="default"
    :disabled="isDev"
    class="item-comp"
    v-model="value"
    controls-position="right"
    :placeholder="placeholder || '提示信息'"
    :min="props.minValue"
    :max="props.maxValue"
  />
</template>
<script setup lang="ts">
import { ref } from "vue";

interface Props {
  id: string;
  placeholder: string;
  value: string | null;
  isDev: boolean;
  minValue: number;
  maxValue: number;
}

const props = defineProps<Props>();
const value = ref(props.value || "");
</script>
<style lang="scss"></style>
