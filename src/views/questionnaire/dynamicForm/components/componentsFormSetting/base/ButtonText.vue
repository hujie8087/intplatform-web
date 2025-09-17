<template>
  <el-text size="default">按钮文字</el-text>
  <el-input
    size="default"
    class="mb-10 comp"
    v-if="compStore.currentCompConfig"
    placeholder="请输入按钮文字（最多30个字）"
    v-model="comp.buttonText"
    @input="handleChangeInput"
    :max="30"
  ></el-input>
  <div class="setting-item h-32 mb-10">
    <el-text size="default">显示图标</el-text>
    <el-switch size="default" v-model="comp.buttonIconShowBool" @change="changeValue($event)" />
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";

const compStore: any = useSelectCompStore();

const handleChangeInput = (event: any) => {
  const data = event;
  compStore.updateCurrentComp({
    buttonText: data
  });
};

const changeValue = (event: any) => {
  const data = event;
  compStore.updateCurrentComp({
    buttonIconShowBool: data
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
  margin-top: 6px;
}
.setting-item {
  display: flex;
  justify-content: space-between;
}
.mb-10 {
  margin-bottom: 10px;
}
.h-32 {
  height: 32px;
}
</style>
