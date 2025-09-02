<template>
  <div>
    <el-time-picker
      class="item-comp"
      style="width: 100%"
      :disabled="props.isDev"
      v-model="value"
      type="date"
      :placeholder="placeholder"
      size="default"
    />
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
