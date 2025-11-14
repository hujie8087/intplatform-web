<template>
  <div class="image-message">
    <el-image
      :src="content.startsWith('http') ? content : filePath + content"
      fit="cover"
      style="width: 150px; height: 150px; border-radius: 8px"
      :preview-src-list="[content.startsWith('http') ? content : filePath + content]"
      :initial-index="0"
      preview-teleported
    >
      <template #error>
        <div class="image-error">
          <el-icon><Picture /></el-icon>
          <span>图片加载失败</span>
        </div>
      </template>
    </el-image>
  </div>
</template>

<script setup lang="ts">
import { Picture } from "@element-plus/icons-vue";

interface Props {
  /** 图片URL */
  content: string;
}

const { content } = defineProps<Props>();

const filePath = import.meta.env.VITE_APP_BASE_FILE;
</script>

<style lang="scss" scoped>
.image-message {
  max-width: 150px;
  overflow: hidden;
  border-radius: 8px;
  :deep(.el-image) {
    cursor: pointer;
    transition: opacity 0.2s;
    &:hover {
      opacity: 0.9;
    }
  }
}
.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 150px;
  height: 150px;
  font-size: 12px;
  color: #999999;
  background-color: #f5f5f5;
  .el-icon {
    margin-bottom: 8px;
    font-size: 24px;
  }
}
</style>
