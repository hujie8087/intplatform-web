<template>
  <div class="setting-item h-42">
    <el-text class="mx-1" size="default">组件序号</el-text>
    <el-switch size="default" v-model="form.displayNumberSort" @change="val => changeValue(val as boolean)" />
  </div>
</template>
<script lang="ts" setup>
import { ref, defineProps } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";

interface Props {
  form: any;
}

const props = defineProps<Props>();
const form = ref(props.form);

const compStore = useSelectCompStore();
const changeValue = (value: boolean) => {
  compStore.updateGlobalFormConfig({
    displayNumberSort: value
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
