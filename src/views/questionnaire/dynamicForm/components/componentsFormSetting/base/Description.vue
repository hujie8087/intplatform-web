<template>
  <el-text size="default" class="block-title">描述/备注</el-text>
  <el-input
    class="mb-10"
    v-if="compStore.currentCompConfig"
    size="default"
    v-model="comp.description"
    type="textarea"
    :placeholder="'请输入描述'"
    @input="handleChangeInput"
    :autosize="{ minRows: 2, maxRows: 5 }"
    clearable
    :maxlength="200"
    show-word-limit
  />
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";

const compStore: any = useSelectCompStore();

const handleChangeInput = (value: any) => {
  const data = value;
  compStore.updateCurrentComp({
    description: data
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
