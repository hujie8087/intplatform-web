<template>
  <div>
    <el-date-picker
      style="width: 330px"
      type="daterange"
      range-separator="至"
      :disabled="props.isDev"
      v-model="dataValue"
      value-format="YYYY-MM-DD"
      :start-placeholder="isDev ? disableInputByDev : placeholder || '开始日期'"
      :end-placeholder="isDev ? disableInputByDev : placeholder || '结束日期'"
      size="default"
    ></el-date-picker>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { disableInputByDev } from "../../compConfig";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
const compStore = useSelectCompStore();
interface Props {
  id: string;
  placeholder: string;
  dataValue: string;
  isDev: boolean;
}
const props = defineProps<Props>();
const dataValue = ref(props.dataValue || null);
watch(
  () => dataValue.value,
  newValue => {
    compStore.updateCurrentComp({
      dataValue: newValue
    });
  }
);
</script>
<style lang="scss" scoped></style>
