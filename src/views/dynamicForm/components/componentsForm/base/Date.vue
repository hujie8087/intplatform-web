<template>
  <el-date-picker
    type="date"
    style="width: 100%"
    :disabled="props.isDev"
    v-model="value"
    :placeholder="placeholder"
    size="default"
  />
</template>
<script setup lang="ts">
import { ref } from "vue";
interface Props {
  id: string;
  placeholder: string;
  value: string;
  isDev: boolean;
}
const props = defineProps<Props>();
const value = ref(props.value || null);
</script>
<style lang="scss"></style>
