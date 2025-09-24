<template>
  <el-input
    :disabled="isDev && props.isSelected"
    v-model="dataValue"
    class="item-comp"
    :placeholder="isDev && props.isSelected ? disableInputByDev : placeholder || '提示信息'"
    @blur="inputBlur"
  ></el-input>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { disableInputByDev, delayTime, regexRule, regexRuleMesg } from "../../compConfig";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
const compStore = useSelectCompStore();
interface Props {
  id: string;
  placeholder: string;
  value: string | null;
  dataValue: string;
  isDev: boolean;
  isSelected: boolean;
  formValidationFormat: string;
}
const props = defineProps<Props>();
const dataValue = ref(props.dataValue || null);
const formValidationFormat = props.formValidationFormat;
const inputBlur = () => {
  if (props.isDev) return false;
  let isNext = testNumber(formValidationFormat, dataValue.value);
  if (!isNext) {
    let msg = regexRuleMesg[formValidationFormat];
    compStore.updateCurrentComp({ errorMsg: msg, id: props.id });
  } else {
    compStore.updateCurrentComp({ errorMsg: "", id: props.id });
  }
};
watch(
  () => dataValue.value,
  newValue => {
    setTimeout(() => {
      compStore.updateCurrentComp({ dataValue: newValue, id: props.id });
    }, delayTime);
  }
);
const testNumber = (formValidationFormat, phone: string) => {
  let str: any = phone;
  if (formValidationFormat == "phone" || formValidationFormat == "idCard") {
    str = Number(str);
  }
  const isValid = regexRule[formValidationFormat].test(str);
  return isValid;
};
</script>

<style lang="scss"></style>
