<template>
  <el-rate
    size="large"
    class="item"
    v-model:value="rateValue"
    @change="handleChange"
    :colors="['#409eff', '#67c23a', '#FF9900']"
    :max="props.rateCount"
    :allow-half="props.rateAllowHalf"
  />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface Props {
  value: number;
  rateCharacter: number | string;
  rateCount: number;
  rateAllowHalf: boolean;
}
const props = defineProps<Props>();
const rateValue = ref(props.value);
const handleChange = () => {
  console.log("handleChange");
};
watch(
  () => props.value,
  newValue => (rateValue.value = newValue)
);
</script>
<style lang="scss" scoped>
.item {
  margin-left: -2px;
  text-align: left;
}
.ant-rate-star-zero {
  color: rgb(0 0 0 / 100%) !important;
  filter: grayscale(0);
}
</style>
