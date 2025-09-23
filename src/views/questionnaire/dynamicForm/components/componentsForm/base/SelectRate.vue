<template>
  <el-select
    class="item-comp"
    v-model="dataValue"
    style="width: 100%"
    :disabled="props.isDev && props.isSelected"
    :placeholder="
      props.isDev && props.isSelected ? (props.placeholder || '请选择') + ' - 编辑状态无法选择' : props.placeholder || '请选择'
    "
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
  margin-left: -10px;
  text-align: left;
}
</style>
