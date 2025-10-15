<template>
  <el-time-select
    class="item-comp"
    style="width: 100%"
    :disabled="isDev && isSelected"
    v-model="dataValue"
    start="00:00"
    step="00:01"
    end="23:59"
    format="hh:mm A"
    :placeholder="isDev && isSelected ? $t('survey.form.disableInputByDev') : placeholder || '提示信息'"
    value-format="HH:mm:ss"
    @focus="handleFocus"
    @blur="inputBlur"
  />
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { delayTime } from "../../compConfig";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
const emit = defineEmits(["compFocus"]);
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
const dataValue = ref<null | string>(props.dataValue && props.dataValue.trim() ? props.dataValue : null);
const handleFocus = () => {
  emit("compFocus");
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
