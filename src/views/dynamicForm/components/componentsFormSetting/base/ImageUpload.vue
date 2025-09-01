<template>
  <div class="setting-item">
    <el-text size="default" class="block-title">图片设置</el-text>
    <div class="setting-item-img">
      <UploadImg class="mb-10" v-model:image-url="imageUrl" :file-size="5" width="100px" height="100px">
        <template #tip> 上传图片最大为 5M </template>
      </UploadImg>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch } from "vue";
import UploadImg from "@/components/Upload/Img.vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
interface Props {
  comp: any;
}
const compStore: any = useSelectCompStore();
const props = defineProps<Props>();
const imageUrl = ref(props.comp.value);
watch(imageUrl, newValue => {
  compStore.updateCurrentComp({
    value: newValue
  });
});
</script>
<style lang="scss" scoped>
.comp {
  padding: 10px;
  color: yellowgreen;
}
.mb-10 {
  margin-bottom: 20px;
}
.setting-item-img {
  display: flex;
}
</style>
