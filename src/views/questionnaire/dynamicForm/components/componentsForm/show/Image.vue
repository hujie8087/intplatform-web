<template>
  <div class="comp-img">
    <el-image :src="getImageUrl(props.value)">
      <template #error>
        <div class="image-slot">
          <el-icon><icon-picture /></el-icon>
          <el-text>请先上传图片</el-text>
        </div>
      </template>
    </el-image>
  </div>
</template>

<script setup lang="ts">
import { Picture as IconPicture } from "@element-plus/icons-vue";

const filePath = import.meta.env.VITE_APP_BASE_FILE;
interface Props {
  id: string;
  value: string;
  alt?: string;
  isDev: boolean;
}
const defUrl = "";
const getImageUrl = (imgUrl: string) => {
  try {
    if (imgUrl != "") {
      return filePath + imgUrl;
    }
    return filePath + defUrl;
  } catch (e) {
    return filePath + defUrl;
  }
};
const props = defineProps<Props>();
</script>

<style lang="scss" scoped>
.comp-img {
  box-sizing: border-box;
  display: inline-block;
  width: 100%;
  text-align: center;
  vertical-align: top;
}
.comp-img .el-image {
  width: 100%;
  padding: 0 5px;
}
.comp-img .image-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 10px 0;
  font-size: 30px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
}
.comp-img .image-slot .el-icon {
  font-size: 30px;
}
</style>
