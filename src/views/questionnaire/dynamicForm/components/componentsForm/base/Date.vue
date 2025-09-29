<template>
  <el-date-picker
    type="date"
    style="width: 100%"
    :disabled="isDev && isSelected"
    v-model="dataValue"
    :placeholder="isDev && isSelected ? disableInputByDev : placeholder || '提示信息'"
    value-format="YYYY-MM-DD"
    @focus="handleFocus"
    @blur="inputBlur"
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
  isRequired: boolean;
  customErrorMessage: string;
}
const props = defineProps<Props>();
const dataValue = ref(props.dataValue || null);

const emit = defineEmits(["compFocus"]); // 定义触发选中的事件
const handleFocus = () => {
  emit("compFocus"); // 传递组件信息给父级
};

watch(
  () => dataValue.value,
  newValue => {
    setTimeout(() => {
      // 清除已存在的错误提示（有输入就去掉红框）
      const curError = compStore?.currentCompConfig?.errorMsg;
      if (curError) {
        compStore.updateCurrentComp({ errorMsg: "", id: props.id });
      }
      compStore.updateCurrentComp({
        dataValue: newValue,
        id: props.id
      });
    }, delayTime);
  }
);
const inputBlur = () => {
  if (!props.isRequired) return false;
  if (!dataValue.value) {
    let msg = props.customErrorMessage ? props.customErrorMessage : "此数据不能为空";
    compStore.updateCurrentComp({ errorMsg: msg, id: props.id });
  }
};
</script>
<style lang="scss"></style>
