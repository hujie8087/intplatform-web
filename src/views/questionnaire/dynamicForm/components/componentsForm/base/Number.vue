<template>
  <el-input-number
    :disabled="isDev && isSelected"
    class="item-comp"
    v-model="dataValue"
    :controls="false"
    :min="props.minValue"
    :max="props.maxValue"
  />
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
import { delayTime } from "../../compConfig";

const compStore = useSelectCompStore();
interface Props {
  id: string;
  placeholder: string;
  dataValue: string | null;
  isDev: boolean;
  isSelected: boolean;
  minValue: number;
  maxValue: number;
}
const props = defineProps<Props>();
const dataValue = ref(props.dataValue || "");
watch(
  () => dataValue.value,
  newValue => {
    setTimeout(() => {
      compStore.updateCurrentComp({
        dataValue: newValue,
        id: props.id
      });
    }, delayTime);
  }
);
</script>
<style lang="scss"></style>
