<template>
  <div class="setting-item h-42 comp">
    <el-text size="default">位置</el-text>
    <el-select size="default" v-model="comp.position" @change="changeValue" placeholder="Select" style="width: 120px">
      <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
    </el-select>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
import { optionData } from "../settingConfigData";
interface Props {
  comp: any;
}
const compStore = useSelectCompStore();
const options = ref([...optionData]);
const props = defineProps<Props>();
const comp = ref(props.comp);
const changeValue = (value: boolean) => {
  compStore.updateCurrentComp({
    position: value,
    id: props.comp.id
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
  margin-top: 10px;
}
</style>
