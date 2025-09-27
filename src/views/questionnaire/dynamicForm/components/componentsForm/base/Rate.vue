<template>
  <el-rate
    class="item"
    v-model="dataValue"
    :disabled="isDev"
    show-score
    score-template="{value} 分"
    :max="props.rateCount"
    :allow-half="props.rateAllowHalf"
    @change="inputBlur"
  />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
import { delayTime } from "../../compConfig";

const compStore = useSelectCompStore();
interface Props {
  id: string;
  dataValue: number;
  rateCharacter: number | string;
  isDev: boolean;
  isSelected: boolean;
  rateCount: number;
  rateAllowHalf: boolean;
  errorMsg: string;
  isRequired: boolean;
}
const props = defineProps<Props>();
const dataValue = ref(props.dataValue);

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
  if (dataValue.value || dataValue.value === 0) {
    // 清除已存在的错误提示（有输入就去掉红框）
    const curError = props?.errorMsg;
    if (curError) {
      setTimeout(() => {
        compStore.updateCurrentComp({ errorMsg: "", id: props.id });
      }, delayTime);
    }
  }
};
</script>
<style lang="scss" scoped>
.item {
  margin-left: -2px;
  text-align: left;
}
</style>
