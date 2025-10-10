<template>
  <div class="setting-item h-42">
    <el-text class="mx-1" size="default">{{ $t("survey.form.compDesc") }}</el-text>
    <el-switch size="default" v-model="form.displayDescription" @change="val => changeValue(val as boolean)" />
  </div>
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
const changeValue = (val: boolean) => {
  compStore.updateGlobalFormConfig({
    displayDescription: val
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
