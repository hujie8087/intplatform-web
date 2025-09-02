<template>
  <el-input-number
    size="default"
    :disabled="isDev"
    class="item-comp"
    v-model="value"
    controls-position="right"
    :placeholder="placeholder || '提示信息'"
    :min="1"
    :max="100"
  />
</template>
<script setup lang="ts">
import { ref } from "vue";

interface Props {
  id: string;
  placeholder: string;
  value: string | null;
  isDev: boolean;
}

const props = defineProps<Props>();
const value = ref(props.value || "");
</script>
<style lang="scss"></style>
