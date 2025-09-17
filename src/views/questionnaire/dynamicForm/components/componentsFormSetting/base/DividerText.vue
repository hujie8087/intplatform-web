<template>
  <el-text size="default">分割线文本</el-text>
  <el-input
    size="default"
    class="comp"
    v-if="compStore.currentCompConfig"
    placeholder="输入分割线文本"
    clearable
    v-model="comp.dividerValue"
    @input="handleChangeInput"
    maxlength="15"
    show-word-limit
  ></el-input>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";

const compStore = useSelectCompStore();
const handleChangeInput = (event: any) => {
  const data = event;
  compStore.updateCurrentComp({
    dividerValue: data
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
  margin-top: 10px;
  color: yellowgreen;
}
</style>
