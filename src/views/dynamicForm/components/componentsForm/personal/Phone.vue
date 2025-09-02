<template>
  <el-input size="default" clearable v-model="value" :placeholder="placeholder">
    <template #prefix>
      <img class="icon" :src="Phone" alt="" />
    </template>
  </el-input>
</template>
<script setup lang="ts">
import { ref } from "vue";
import Phone from "@/assets/images/form-editor/phone.svg";

interface Props {
  id: string;
  placeholder: string;
  value: string;
  isDev: boolean;
}
const props = defineProps<Props>();
const value = ref(props.value || null);
</script>
<style lang="scss" scoped>
.icon {
  height: 18px;
}
</style>
