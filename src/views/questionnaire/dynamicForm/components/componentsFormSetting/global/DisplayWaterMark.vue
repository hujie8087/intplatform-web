<template>
  <div class="setting-item h-42">
    <el-text class="mx-1" size="default">水印</el-text>
    <el-switch size="default" v-model="form.displayWaterMark" @change="changeValue($event)" />
  </div>
  <el-input
    size="default"
    class="mb-10"
    :bordered="false"
    v-if="compStore.currentCompConfig && form.displayWaterMark"
    placeholder="请输入水印（最多15个字）"
    v-model="form.waterMarkText"
    @input="handleChangeInput"
    :maxlength="15"
  ></el-input>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";

interface Props {
  form: any;
}

const props = defineProps<Props>();
const form = ref(props.form);

const compStore = useSelectCompStore();

const changeValue = (value: any) => {
  compStore.updateGlobalFormConfig({
    displayWaterMark: value
  });
};

const handleChangeInput = (event: any) => {
  const data = event;
  compStore.updateGlobalFormConfig({
    waterMarkText: data
  });
};
</script>
<style lang="scss" scoped>
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  color: rgb(0 0 0 / 45%);
}
</style>
