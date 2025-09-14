<template>
  <el-rate
    size="large"
    class="item"
    v-model="dataValue"
    :colors="['#409eff', '#67c23a', '#FF9900']"
    :disabled="props.isDev"
    :max="props.rateCount"
    :allow-half="props.rateAllowHalf"
  />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
const compStore = useSelectCompStore();
interface Props {
  dataValue: number;
  rateCharacter: number | string;
  isDev: boolean;
  rateCount: number;
  rateAllowHalf: boolean;
}
const props = defineProps<Props>();
const dataValue = ref(props.dataValue);

watch(
  () => dataValue.value,
  newValue => {
    compStore.updateCurrentComp({
      dataValue: newValue
    });
  }
);
</script>
<style lang="scss" scoped>
.item {
  margin-left: -2px;
  text-align: left;
}
</style>
