<template>
  <div class="setting-item h-42">
    <el-text class="mx-1" size="default">自定错误提示</el-text>
    <el-switch size="default" v-model="comp.isCustomErrorMessage" @change="handleChangeInput" />
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";

interface Props {
  comp: any;
}

const props = defineProps<Props>();
const comp = ref(props.comp);

const compStore = useSelectCompStore();

const handleChangeInput = (event: any) => {
  const data = event;
  compStore.updateCurrentComp({
    isCustomErrorMessage: data
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
