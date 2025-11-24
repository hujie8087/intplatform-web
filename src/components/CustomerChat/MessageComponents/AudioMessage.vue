<template>
  <div class="audio-message">
    <div class="audio-container" @click="togglePlay">
      <div class="play-button" :class="{ playing: isPlaying }">
        <el-icon>
          <VideoPlay v-if="!isPlaying" />
          <VideoPause v-else />
        </el-icon>
      </div>
      <div class="audio-info">
        <span class="duration">{{ formatDuration(currentTime) }} / {{ formatDuration(duration) }}</span>
        <div class="progress-bar">
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }" />
          </div>
        </div>
      </div>
    </div>

    <!-- 隐藏的audio元素 -->
    <audio
      ref="audioRef"
      :src="content.startsWith('http') ? content : filePath + content"
      preload="metadata"
      @loadedmetadata="handleAudioLoaded"
      @timeupdate="handleTimeUpdate"
      @ended="handleAudioEnded"
      @error="handleAudioError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from "vue";
import { VideoPlay, VideoPause } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

interface Props {
  /** 音频URL */
  content: string;
  /** 音频时长(秒) */
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  duration: 0
});

const filePath = import.meta.env.VITE_APP_BASE_FILE;

const emit = defineEmits<{
  play: [audioUrl: string];
  pause: [];
}>();

const audioRef = ref<HTMLAudioElement>();
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(props.duration || 0);

// 进度百分比
const progressPercent = computed(() => {
  if (duration.value === 0) return 0;
  return (currentTime.value / duration.value) * 100;
});

// 格式化时长
const formatDuration = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// 切换播放状态
const togglePlay = () => {
  if (!audioRef.value) return;

  if (isPlaying.value) {
    pauseAudio();
  } else {
    playAudio();
  }
};

// 播放音频
const playAudio = () => {
  if (!audioRef.value) return;

  try {
    // 通知其他音频停止播放
    emit("play", props.content);

    audioRef.value.play();
    isPlaying.value = true;
  } catch (error) {
    console.error("音频播放失败:", error);
    ElMessage.error("音频播放失败");
  }
};

// 暂停音频
const pauseAudio = () => {
  if (!audioRef.value) return;

  audioRef.value.pause();
  isPlaying.value = false;
  emit("pause");
};

// 停止音频（外部调用）
const stopAudio = () => {
  if (!audioRef.value) return;

  audioRef.value.pause();
  audioRef.value.currentTime = 0;
  isPlaying.value = false;
  currentTime.value = 0;
};

// 处理音频元数据加载
const handleAudioLoaded = () => {
  if (audioRef.value) {
    duration.value = audioRef.value.duration || props.duration || 0;
  }
};

// 处理时间更新
const handleTimeUpdate = () => {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime;
  }
};

// 处理音频结束
const handleAudioEnded = () => {
  isPlaying.value = false;
  currentTime.value = 0;
  emit("pause");
};

// 处理音频错误
const handleAudioError = () => {
  isPlaying.value = false;
  ElMessage.error("音频加载失败");
};

// 暴露方法给父组件
defineExpose({
  stopAudio
});

onUnmounted(() => {
  stopAudio();
});
</script>

<style lang="scss" scoped>
.audio-message {
  max-width: 250px;
}
.audio-container {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  background-color: #f5f5f5;
  border-radius: 20px;
  transition: background-color 0.2s;
  &:hover {
    background-color: #e8e8e8;
  }
}
.play-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-right: 12px;
  color: #ffffff;
  background-color: #409eff;
  border-radius: 50%;
  transition: background-color 0.2s;
  &:hover {
    background-color: #337ecc;
  }
  &.playing {
    background-color: #f56c6c;
    &:hover {
      background-color: #dd6161;
    }
  }
  .el-icon {
    font-size: 16px;
  }
}
.audio-info {
  flex: 1;
  .duration {
    display: block;
    margin-bottom: 6px;
    font-size: 12px;
    color: #666666;
  }
}
.progress-bar {
  width: 100%;
  .progress-track {
    width: 100%;
    height: 4px;
    overflow: hidden;
    background-color: #e0e0e0;
    border-radius: 2px;
    .progress-fill {
      height: 100%;
      background-color: #409eff;
      border-radius: 2px;
      transition: width 0.1s;
    }
  }
}

// 客服消息样式
:deep(.is-service) .audio-container {
  background-color: rgb(64 158 255 / 10%);
  .play-button {
    background-color: #409eff;
  }
  .progress-track {
    background-color: rgb(64 158 255 / 20%);
    .progress-fill {
      background-color: #409eff;
    }
  }
}
</style>
