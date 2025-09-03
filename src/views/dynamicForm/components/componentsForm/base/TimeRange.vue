<template>
  <div>
    <el-time-picker style="width: 330px" is-range range-separator="至" :disabled="props.isDev" v-model="value" size="default" />
  </div>
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
