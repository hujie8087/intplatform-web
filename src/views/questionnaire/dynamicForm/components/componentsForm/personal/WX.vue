<template>
  <el-input
    :disabled="isDev && isSelected"
    clearable
    v-model="dataValue"
    @focus="handleFocus"
    @blur="inputBlur"
    :placeholder="isDev && isSelected ? $t('survey.form.disableInputByDev') : placeholder || '提示信息'"
  >
    <template #prefix>
      <img class="icon" :src="WX" alt="" />
    </template>
  </el-input>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import WX from "@/assets/images/form-editor/wx.svg";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
import { delayTime, isEmpty } from "../../compConfig";
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
const dataValue = ref(props.dataValue || "");
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
  if (props.isDev || !props.isRequired) return false;
  let isNext = isEmpty(dataValue.value);
  if (isNext) {
    let msg = props.customErrorMessage ? props.customErrorMessage : "此数据不能为空";
    compStore.updateCurrentComp({ errorMsg: msg, id: props.id });
  }
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
