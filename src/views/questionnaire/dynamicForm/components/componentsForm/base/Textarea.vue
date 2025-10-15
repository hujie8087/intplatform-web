<template>
  <div class="comp">
    <el-input
      type="textarea"
      :rows="3"
      :disabled="isDev && isSelected"
      v-model="dataValue"
      class="item-comp"
      @focus="handleFocus"
      @blur="inputBlur"
      :placeholder="isDev && isSelected ? $t('survey.form.disableInputByDev') : placeholder || '提示信息'"
    ></el-input>
  </div>
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
  isRequired: boolean;
  customErrorMessage: string;
}
const props = defineProps<Props>();
const dataValue = ref(props.dataValue || null);
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
const handleFocus = () => {
  emit("compFocus");
};
const inputBlur = () => {
  if (!props.isRequired) return false;
  if (!dataValue.value) {
    let msg = props.customErrorMessage ? props.customErrorMessage : "此数据不能为空";
    compStore.updateCurrentComp({ errorMsg: msg, id: props.id });
  }
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
