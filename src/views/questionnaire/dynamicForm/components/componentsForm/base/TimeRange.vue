<template>
  <div>
    <el-time-picker
      style="width: 330px"
      is-range
      :range-separator="$t('main.to')"
      :disabled="isDev && isSelected"
      v-model="dataValue"
      value-format="HH:mm:ss"
      :start-placeholder="isDev && isSelected ? $t('survey.form.disableInputByDev') : placeholder || $t('main.startTime')"
      :end-placeholder="isDev && isSelected ? $t('survey.form.disableInputByDev') : placeholder || $t('main.endTime')"
      @focus="handleFocus"
      @blur="inputBlur"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { delayTime } from "../../compConfig";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
const compStore = useSelectCompStore();
const emit = defineEmits(["compFocus"]);
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
const inputBlur = () => {
  if (!props.isRequired) return false;
  if (!dataValue.value) {
    let msg = props.customErrorMessage ? props.customErrorMessage : "此数据不能为空";
    compStore.updateCurrentComp({ errorMsg: msg, id: props.id });
  }
};
</script>
<style lang="scss"></style>
