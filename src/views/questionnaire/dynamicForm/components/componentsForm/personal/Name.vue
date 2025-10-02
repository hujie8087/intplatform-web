<template>
  <el-input
    :disabled="isDev && isSelected"
    clearable
    v-model="dataValue"
    @focus="handleFocus"
    @blur="inputBlur"
    maxlength="255"
    :show-word-limit="true"
    :placeholder="isDev && isSelected ? disableInputByDev : placeholder || '提示信息'"
  >
    <template #prefix>
      <img class="icon" :src="Name" alt="" />
    </template>
  </el-input>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import Name from "@/assets/images/form-editor/name.svg";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
import { disableInputByDev, delayTime, isEmpty } from "../../compConfig";
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
const handleFocus = () => {
  emit("compFocus");
};
const inputBlur = () => {
  if (props.isDev || !props.isRequired) return false;
  let isNext = isEmpty(dataValue.value);
  if (isNext) {
    let msg = props.customErrorMessage ? props.customErrorMessage : "此数据不能为空";
    compStore.updateCurrentComp({ errorMsg: msg, id: props.id });
  }
};
</script>
<style lang="scss" scoped>
.icon {
  height: 18px;
}
</style>
