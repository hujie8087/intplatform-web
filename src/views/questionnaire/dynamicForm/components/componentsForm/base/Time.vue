<template>
  <el-time-picker
    class="item-comp"
    style="width: 100%"
    :disabled="isDev && isSelected"
    v-model="dataValue"
    :placeholder="isDev && isSelected ? disableInputByDev : placeholder || '提示信息'"
    value-format="HH:mm:ss"
  />
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { disableInputByDev, delayTime } from "../../compConfig";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";

const compStore = useSelectCompStore();
interface Props {
  id: string;
  placeholder: string;
  dataValue: string;
  isDev: boolean;
  isSelected: boolean;
}
const props = defineProps<Props>();
const dataValue = ref<null | string>(props.dataValue && props.dataValue.trim() ? props.dataValue : "00:00:00");
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
