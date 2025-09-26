<template>
  <el-input-number
    :disabled="isDev && isSelected"
    class="item-comp"
    v-model="dataValue"
    :controls="false"
    :min="props.minValue"
    :max="props.maxValue"
    @focus="handleFocus"
    @blur="inputBlur"
  />
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
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
  minValue: number;
  maxValue: number;
  isRequired: boolean;
  customErrorMessage: string;
}
const props = defineProps<Props>();
const dataValue = ref(props.dataValue || null);
const handleFocus = () => {
  emit("compFocus");
};
watch(
  () => dataValue.value,
  newValue => {
    // 清除已存在的错误提示（有输入就去掉红框）
    const curError = compStore?.currentCompConfig?.errorMsg;
    if (curError) {
      compStore.updateCurrentComp({ errorMsg: "", id: props.id });
    }
    setTimeout(() => {
      compStore.updateCurrentComp({
        dataValue: newValue,
        id: props.id
      });
    }, delayTime);
  }
);
const isNumber = (val: any): boolean => {
  // 去掉前后空格后再判断
  return !isNaN(val) && val !== "" && val !== null;
};
const inputBlur = () => {
  if (!props.isRequired) return false;
  if (!isNumber(dataValue.value)) {
    let msg = props.customErrorMessage ? props.customErrorMessage : "此数据不能为空";
    compStore.updateCurrentComp({ errorMsg: msg, id: props.id });
  }
};
</script>
<style lang="scss"></style>
