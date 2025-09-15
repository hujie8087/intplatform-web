<template>
  <el-input
    size="default"
    :disabled="isDev"
    :title="isDev ? disableInputByDev : placeholder"
    v-model="dataValue"
    class="item-comp"
    :placeholder="placeholder || '提示信息'"
  ></el-input>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { disableInputByDev } from "../../compConfig";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
const compStore = useSelectCompStore();
interface Props {
  id: string;
  placeholder: string;
  value: string | null;
  dataValue: string;
  isDev: boolean;
}
const props = defineProps<Props>();
const dataValue = ref(props.dataValue || null);
watch(
  () => dataValue.value,
  newValue => {
    compStore.updateCurrentComp({
      dataValue: newValue
    });
  }
);
</script>

<style lang="scss"></style>
