<template>
  <el-input
    :disabled="isDev && props.isSelected"
    v-model="dataValue"
    class="item-comp"
    :placeholder="isDev && props.isSelected ? disableInputByDev : placeholder || '提示信息'"
  ></el-input>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { disableInputByDev, delayTime } from "../../compConfig";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
const compStore = useSelectCompStore();
interface Props {
  id: string;
  placeholder: string;
  value: string | null;
  dataValue: string;
  isDev: boolean;
  isSelected: boolean;
}
const props = defineProps<Props>();
const dataValue = ref(props.dataValue || null);
watch(
  () => dataValue.value,
  newValue => {
    setTimeout(() => {
      compStore.updateCurrentComp({ dataValue: newValue, id: props.id });
    }, delayTime);
  }
);
</script>

<style lang="scss"></style>
