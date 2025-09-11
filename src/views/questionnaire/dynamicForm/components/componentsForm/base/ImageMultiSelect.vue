<template>
  <div class="imageMultiSelect">
    <div v-for="(item, index) in props.dataList" :key="index" class="image-block">
      <span class="demonstration">{{ item.label }}</span>
      <el-image style="width: 100px; height: 100px" :src="url" fit="scale-down" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
const compStore = useSelectCompStore();
interface Props {
  dataList: Array<any>;
  dataValue: string;
  layoutType: string;
  placeholder: string;
  isDev: boolean;
  isSelected: boolean;
  isPreviewRender?: boolean;
}
const props = defineProps<Props>();
const dataValue = ref(props.dataValue);
const url = "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg";

onMounted(() => {
  console.log(dataValue, "dataValue");
});

watch(
  () => dataValue.value,
  newValue => {
    compStore.updateCurrentComp({
      dataValue: newValue
    });
  },
  {
    deep: true // 因为是数组，需要深度监听
  }
);
</script>

<style lang="scss" scoped></style>
