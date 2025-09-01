<template>
  <el-input
    size="default"
    :disabled="isDev"
    :title="isDev ? disableInputByDev : placeholder"
    v-model="value"
    class="item-comp"
    :placeholder="placeholder || '提示信息'"
  ></el-input>
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

<style lang="scss"></style>
