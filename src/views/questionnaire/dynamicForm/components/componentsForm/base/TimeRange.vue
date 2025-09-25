<template>
  <div>
    <el-time-picker
      style="width: 330px"
      is-range
      range-separator="至"
      :disabled="isDev && isSelected"
      v-model="dataValue"
      :start-placeholder="isDev && isSelected ? disableInputByDev : placeholder || '开始时间'"
      :end-placeholder="isDev && isSelected ? disableInputByDev : placeholder || '结束时间'"
      @focus="handleFocus"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { disableInputByDev, delayTime } from "../../compConfig";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
const compStore = useSelectCompStore();
const emit = defineEmits(["compFocus"]);
interface Props {
  id: string;
  placeholder: string;
  dataValue: string;
  isDev: boolean;
  isSelected: boolean;
}
const props = defineProps<Props>();
const dataValue = ref(props.dataValue || null);
const handleFocus = () => {
  emit("compFocus");
};
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
