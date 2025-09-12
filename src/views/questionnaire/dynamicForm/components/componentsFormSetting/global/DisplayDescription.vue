<template>
  <div class="setting-item h-42">
    <el-text class="mx-1" size="default">组件描述</el-text>
    <el-switch size="default" v-model="form.displayDescription" @change="val => changeValue(val as boolean)" />
  </div>
</template>
<script lang="ts" setup>
import { ref, watch } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
interface Props {
  form: any;
}
const props = defineProps<Props>();
const form = ref(props.form);
const compStore = useSelectCompStore();
const changeValue = (val: boolean) => {
  compStore.updateGlobalFormConfig({
    displayDescription: val
  });
};
watch(
  () => props.form,
  newVal => {
    form.value = newVal.value;
  },
  { deep: true }
);
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
