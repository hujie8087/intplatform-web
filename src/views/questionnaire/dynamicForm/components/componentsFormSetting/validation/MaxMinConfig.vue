<template>
  <div class="setting-item h-42">
    <el-text size="default">至少应选</el-text>
    <el-input-number
      class="input_number"
      size="default"
      controls-position="right"
      placeholder="至少应选"
      clearable
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
      placeholder="最多可选"
      v-model="comp.maxValue"
      @change="handleChangeInput($event, 'maxValue')"
    />
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";

interface Props {
  comp: any;
}
const compStore = useSelectCompStore();
const props = defineProps<Props>();
const comp = ref(props.comp);
const handleChangeInput = (event: any, param: "maxValue" | "minValue") => {
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
