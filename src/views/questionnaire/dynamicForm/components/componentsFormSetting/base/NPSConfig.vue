<template>
  <div class="setting-item">
    <el-text size="default">
      取值范围
      <el-tooltip class="box-item" effect="dark" content="开始值可以选择0，结束值最小值是3" placement="top-start">
        <el-icon><Warning /></el-icon>
      </el-tooltip>
    </el-text>
  </div>
  <div class="setting-item g-2 comp">
    <el-select
      size="default"
      v-model="comp.startValue"
      placeholder="Select"
      style="width: 110px"
      class="abs-item"
      @change="changeStartValue"
    >
      <el-option v-for="(item, index) in comp.startValueList" :key="index" :label="item" :value="item" />
    </el-select>
    <el-select
      size="default"
      v-model="comp.rateCount"
      placeholder="Select"
      style="width: 110px"
      class="abs-item"
      @change="changeEndValue"
    >
      <el-option v-for="(item, index) in dataList" :key="index" :label="item.name" :value="item.value" />
    </el-select>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, onMounted, ref } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";

const compStore = useSelectCompStore();

interface Props {
  comp: any;
}

const props = defineProps<Props>();
const comp = ref(props.comp);

const dataList: any = ref([]);

onMounted(() => {
  for (let i = 3; i <= 10; i++) {
    dataList.value.push({
      name: i,
      value: i
    });
  }
});

const changeStartValue = (event: any) => {
  compStore.updateCurrentComp({
    startValue: event
  });
};

const changeEndValue = (event: any) => {
  compStore.updateCurrentComp({
    rateCount: event
  });
};
</script>
<style lang="scss" scoped>
.comp {
  margin-top: 10px;
  color: yellowgreen;
}
.g-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 10px;
}
:deep(:where(.css-dev-only-do-not-override-17yhhjv).ant-radio-button-wrapper) {
  width: 42px;
}
</style>
