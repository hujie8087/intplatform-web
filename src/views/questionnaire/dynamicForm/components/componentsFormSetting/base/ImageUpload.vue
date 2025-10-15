<template>
  <div class="setting-item">
    <el-text size="default" class="block-title">{{ $t("survey.form.ImageComp.imgSet") }}</el-text>
    <div class="setting-item-img">
      <UploadImg class="mb-10" :api="uploadSurvey" v-model:image-url="imageUrl" :file-size="5" width="100px" height="100px">
        <template #tip> {{ $t("main.uploadSizeErrorMsg", { size: "3m" }) }} </template>
      </UploadImg>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch } from "vue";
import UploadImg from "@/components/Upload/Img.vue";
import { uploadSurvey } from "@/api/modules/upload";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
interface Props {
  comp: any;
}
const compStore: any = useSelectCompStore();
const props = defineProps<Props>();
const imageUrl = ref(props.comp.value);
watch(imageUrl, newValue => {
  compStore.updateCurrentComp({
    value: newValue,
    id: props.comp.id
  });
});
</script>
<style lang="scss" scoped>
.comp {
  padding: 10px;
  color: yellowgreen;
}
.mb-10 {
  margin-bottom: 10px;
}
.setting-item-img {
  display: flex;
}
</style>
