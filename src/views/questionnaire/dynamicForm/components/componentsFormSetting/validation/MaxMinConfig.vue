<template>
  <div class="setting-item h-42">
    <el-text size="default">至少应选</el-text>
    <el-input-number
      class="input_number"
      size="default"
      controls-position="right"
      placeholder="至少应选"
      clearable
      :min="1"
      v-model="comp.minValue"
      @change="handleChangeInput($event, 'minValue')"
    />
  </div>

  <div class="setting-item h-42">
    <el-text size="default">最多可选</el-text>
    <el-input-number
      size="default"
      class="input_number"
      controls-position="right"
      clearable
      :min="1"
      placeholder="最多可选"
      v-model="comp.maxValue"
      @change="handleChangeInput($event, 'maxValue')"
    />
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
import { ElMessage } from "element-plus";

interface Props {
  comp: any;
}
const compStore = useSelectCompStore();
const props = defineProps<Props>();
const comp = ref(props.comp);

const handleChangeInput = (event: any, param: "maxValue" | "minValue") => {
  if (param === "minValue" && event > comp.value.maxValue) {
    event = comp.value.maxValue;
    ElMessage.warning("至少应选值不允许大于最多可选值");
  }
  if (param === "maxValue" && event < comp.value.minValue) {
    event = comp.value.minValue;
    ElMessage.warning("最多可选值不允许小于至少应选值");
  }
  const data = event;
  compStore.updateCurrentComp({
    [param]: data
  });
};
</script>
<style lang="scss" scoped>
.setting-item {
  .input_number {
    float: right;
  }
}
</style>
