<template>
  <el-text size="default" class="block-title">输入框提示</el-text>
  <el-input
    class="mb-10"
    v-if="compStore.currentCompConfig"
    size="default"
    v-model="comp.placeholder"
    :placeholder="'请输入标题'"
    @input="handleChangeInput"
    clearable
  />
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
const compStore: any = useSelectCompStore();
const handleChangeInput = (value: any) => {
  const data = value;
  compStore.updateCurrentComp({
    placeholder: data
  });
};
interface Props {
  comp: any;
}
const props = defineProps<Props>();
const comp = ref(props.comp);
</script>
<style lang="scss" scoped>
.comp {
  padding: 10px;
  color: yellowgreen;
}
.mb-10 {
  margin-bottom: 10px;
}
</style>
