<template>
  <el-input size="default" clearable v-model="value" :placeholder="placeholder">
    <template #prefix>
      <img class="icon" :src="Id" alt="" />
    </template>
  </el-input>
</template>
<script setup lang="ts">
import { ref } from "vue";
import Id from "@/assets/images/form-editor/id.svg";

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
