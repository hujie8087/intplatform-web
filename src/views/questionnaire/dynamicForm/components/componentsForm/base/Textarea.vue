<template>
  <div class="comp">
    <el-input
      type="textarea"
      :rows="3"
      :disabled="isDev && isSelected"
      v-model="dataValue"
      class="item-comp"
      @focus="handleFocus"
      :placeholder="isDev && isSelected ? disableInputByDev : placeholder || '提示信息'"
    ></el-input>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { disableInputByDev } from "../../compConfig";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
import { delayTime } from "../../compConfig";
const emit = defineEmits(["compFocus"]);
const compStore = useSelectCompStore();
interface Props {
  id: string;
  placeholder: string;
  dataValue: string | null;
  isDev: boolean;
  isSelected: boolean;
}
const props = defineProps<Props>();
const dataValue = ref(props.dataValue || null);
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
const handleFocus = () => {
  emit("compFocus");
};
</script>

<style lang="scss" scoped>
.comp,
.el-textarea__inner {
  padding: 6px 12px !important;
  font-size: 14px !important;
  border: none !important;
  border-radius: var(--el-input-border-radius, var(--el-border-radius-base));
  box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
}
</style>
