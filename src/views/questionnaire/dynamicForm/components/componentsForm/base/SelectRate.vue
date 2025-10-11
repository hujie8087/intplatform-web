<template>
  <el-select
    class="item-comp"
    v-model="dataValue"
    style="width: 100%"
    :disabled="props.isDev && props.isSelected"
    @focus="handleFocus"
    @blur="inputBlur"
    :placeholder="props.isDev && props.isSelected ? $t('survey.form.disableInputByDev') : props.placeholder || '请选择'"
  >
    <el-option v-for="(item, _index) in list" :key="_index" :label="item.label" :value="item.value">
      {{ item.label }}
    </el-option>
  </el-select>
</template>
<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
import { delayTime } from "../../compConfig";

const compStore = useSelectCompStore();
const emit = defineEmits(["compFocus"]);
interface Props {
  id: string;
  dataList: Array<any>;
  dataValue: string;
  layoutType: string;
  placeholder: string;
  isDev: boolean;
  isSelected: boolean;
  isPreviewRender?: boolean;
  startValue: number;
  rateCount: number;
  isRequired: boolean;
  customErrorMessage: string;
}
const props = defineProps<Props>();

const dataValue = ref(props.dataValue || null);

const list = computed(() => {
  let _val: any = [];
  for (let i = props.startValue; i <= props.rateCount; i++) {
    _val.push({
      label: i + "分",
      value: i
    });
  }
  return _val;
});
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
<style lang="scss" scoped>
.item {
  margin-left: -10px;
  text-align: left;
}
</style>
