<template>
  <div class="setting-item h-42 comp">
    <el-text size="default">分割线类型</el-text>
    <el-select size="default" v-model="comp.dividerBorderType" @change="changeValue" placeholder="选择" style="width: 120px">
      <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
    </el-select>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
import { dividerBorderTypeData } from "../settingConfigData";
interface Props {
  comp: any;
}
const compStore = useSelectCompStore();
const options = ref([...dividerBorderTypeData]);
const props = defineProps<Props>();
const comp = ref(props.comp);
const changeValue = (value: boolean) => {
  compStore.updateCurrentComp({
    dividerBorderType: value
  });
};
</script>
<style lang="scss" scoped>
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.comp {
  margin-top: 20px;
}
</style>
