<template>
  <el-rate
    class="item"
    v-model="dataValue"
    :disabled="isDev"
    show-score
    score-template="{value} 分"
    :max="props.rateCount"
    :allow-half="props.rateAllowHalf"
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
}
const props = defineProps<Props>();
const dataValue = ref(props.dataValue);

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
</script>
<style lang="scss" scoped>
.item {
  margin-left: -2px;
  text-align: left;
}
</style>
