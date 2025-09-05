<template>
  <div class="setting-item h-42">
    <el-input
      class="mb-10"
      size="default"
      v-model="comp.customErrorMessage"
      :maxlength="40"
      :placeholder="'请输入自定义错误提示'"
      @input="handleChangeInput"
      clearable
      show-word-limit
    />
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";

interface Props {
  comp: any;
}
const compStore = useSelectCompStore();

const props = defineProps<Props>();
const comp = ref(props.comp);

const handleChangeInput = (value: any) => {
  const data = value;
  compStore.updateCurrentComp({
    customErrorMessage: data
  });
};
</script>
<style lang="scss" scoped></style>
