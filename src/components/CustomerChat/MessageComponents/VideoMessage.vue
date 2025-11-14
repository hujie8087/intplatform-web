<template>
  <div class="video-message">
    <video
      ref="videoRef"
      :src="content.startsWith('http') ? content : filePath + content"
      controls
      :poster="posterUrl"
      class="video-player"
      preload="metadata"
      @error="handleVideoError"
      @loadedmetadata="handleVideoLoaded"
    />
    <div v-if="videoError" class="video-error">
      <el-icon><VideoCamera /></el-icon>
      <span>视频加载失败</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { VideoCamera } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const filePath = import.meta.env.VITE_APP_BASE_FILE;
interface Props {
  /** 视频URL */
  content: string;
  /** 视频封面图 */
  poster?: string;
}

const props = defineProps<Props>();

const videoRef = ref<HTMLVideoElement>();
const videoError = ref(false);

// 处理封面图URL
const posterUrl = computed(() => {
  if (!props.poster) return "";
  if (props.poster.startsWith("http")) return props.poster;
  // 使用新的VITE_CHAT_RESOURCE_API变量来存储聊天视频封面等资源
  return import.meta.env.VITE_CHAT_RESOURCE_API + props.poster;
});

// 处理视频加载错误
const handleVideoError = () => {
  videoError.value = true;
  ElMessage.error("视频加载失败");
};

// 处理视频元数据加载完成
const handleVideoLoaded = () => {
  videoError.value = false;
};
</script>

<style lang="scss" scoped>
.video-message {
  position: relative;
  max-width: 200px;
  overflow: hidden;
  border-radius: 8px;
  .video-player {
    width: 200px;
    height: 150px;
    object-fit: cover;
    background-color: #000000;
    border-radius: 8px;
  }
  .video-error {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #999999;
    background-color: #f5f5f5;
    .el-icon {
      margin-bottom: 8px;
      font-size: 24px;
    }
  }
}
</style>
