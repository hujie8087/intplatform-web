<template>
  <el-input
    :disabled="isDev && props.isSelected"
    v-model="dataValue"
    class="item-comp"
    :placeholder="isDev && props.isSelected ? disableInputByDev : placeholder || '提示信息'"
    @blur="inputBlur"
    @focus="handleFocus"
  ></el-input>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { disableInputByDev, delayTime, regexRule, regexRuleMesg } from "../../compConfig";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
const compStore = useSelectCompStore();
const emit = defineEmits(["compFocus"]);

interface Props {
  id: string;
  placeholder: string;
  value: string | null;
  dataValue: string;
  isDev: boolean;
  isSelected: boolean;
  formValidationFormat: string;
  isRequired: boolean;
  customErrorMessage: string;
}
const props = defineProps<Props>();
const dataValue = ref(props.dataValue || null);
const formValidationFormat = props.formValidationFormat;
const isRequired = props?.isRequired ?? false;
const inputBlur = () => {
  if (props.isDev || !isRequired) return false;
  if (dataValue.value) {
    if (formValidationFormat) {
      let isNext = testNumber(formValidationFormat, dataValue.value);
      if (!isNext) {
        let msg = props.customErrorMessage ? props.customErrorMessage : regexRuleMesg[formValidationFormat];
        compStore.updateCurrentComp({ errorMsg: msg, id: props.id });
      }
    }
  } else {
    compStore.updateCurrentComp({ errorMsg: "此数据不能为空", id: props.id });
  }
};

// input获取焦点时应该调用父组件的选择组件方法
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
      compStore.updateCurrentComp({ dataValue: newValue, id: props.id });
    }, delayTime);
  }
);
const testNumber = (formValidationFormat, phone: string) => {
  let str: any = phone;
  if (!formValidationFormat)
    if (formValidationFormat == "phone" || formValidationFormat == "idCard") {
      str = Number(str);
    }
  const isValid = regexRule[formValidationFormat].test(str);
  return isValid;
};
</script>

<style lang="scss"></style>
