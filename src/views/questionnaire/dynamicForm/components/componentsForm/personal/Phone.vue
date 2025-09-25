<template>
  <el-input
    :disabled="isDev && isSelected"
    clearable
    v-model="dataValue"
    :placeholder="isDev && isSelected ? disableInputByDev : placeholder || '提示信息'"
    @blur="inputBlur"
    @focus="handleFocus"
  >
    <template #prefix>
      <img class="icon" :src="Phone" alt="" />
    </template>
  </el-input>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import Phone from "@/assets/images/form-editor/phone.svg";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
import { disableInputByDev, delayTime, regexRule, regexRuleMesg } from "../../compConfig";
const compStore = useSelectCompStore();
const emit = defineEmits(["compFocus"]);
interface Props {
  id: string;
  placeholder: string;
  dataValue: string;
  isDev: boolean;
  isSelected: boolean;
  type: string;
}
const props = defineProps<Props>();
const dataValue = ref(props.dataValue || null);
const formValidationFormat = props.type;
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
const testNumber = (formValidationFormat, phone: string) => {
  let str: any = phone;
  if (formValidationFormat == "phone" || formValidationFormat == "idCard") {
    str = Number(str);
  }
  const isValid = regexRule[formValidationFormat].test(str);
  return isValid;
};
const handleFocus = () => {
  emit("compFocus");
};
</script>
<style lang="scss" scoped>
.icon {
  height: 18px;
}
</style>
