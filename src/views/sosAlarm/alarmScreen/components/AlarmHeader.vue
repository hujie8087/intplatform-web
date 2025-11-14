<template>
  <div class="alarm-header">
    <h1 class="title">SOS 报警系统</h1>
    <div class="controls">
      <!-- 报警记录按钮 -->
      <button class="icon-btn alarm-record-btn" title="报警记录" @click="handleAlarmRecordClick">
        <el-icon size="22px"> <Document /></el-icon>
      </button>
      <!-- 客服聊天按钮 -->
      <button class="icon-btn chat-btn" title="客服聊天" @click="handleChatClick">
        <el-badge :value="unreadCount" :max="99" :hidden="unreadCount === 0">
          <el-icon size="22px"><ChatDotRound /></el-icon>
        </el-badge>
      </button>
      <button class="icon-btn fullscreen-btn" :title="isFullscreen ? '退出全屏' : '全屏显示'" @click="handleFullscreen">
        <i :class="['iconfont', isFullscreen ? 'icon-suoxiao' : 'icon-fangda']" class="toolBar-icon"></i>
      </button>
    </div>

    <CustomerChat v-model="chatVisible" v-if="chatVisible" @close="handleChatClose" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { ChatDotRound } from "@element-plus/icons-vue";
import CustomerChat from "@/components/CustomerChat/index.vue";
import { useChatStore } from "@/stores/modules/chat";

interface Props {
  isFullscreen: boolean;
}

const { isFullscreen } = defineProps<Props>();
const emit = defineEmits<{
  toggleFullscreen: [];
  openAlarmRecord: [value: { visible: boolean }];
}>();

const chatStore = useChatStore();
const chatVisible = ref(false);

const unreadCount = computed(() => chatStore.unreadCount);

const handleFullscreen = () => {
  emit("toggleFullscreen");
};

const handleChatClick = async () => {
  await chatStore.initWebSocketConnection();
  chatVisible.value = true;
};

const handleChatClose = () => {
  chatVisible.value = false;
};

onMounted(() => {
  chatStore.startUnreadPolling();
});

onUnmounted(() => {
  chatStore.stopUnreadPolling();
});
const handleAlarmRecordClick = () => {
  emit("openAlarmRecord", { visible: true });
};
</script>

<style scoped>
.alarm-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 10px 24px;
  color: #ffffff;
  background: linear-gradient(90deg, rgb(8 24 44 / 92%) 0%, rgb(8 24 44 / 35%) 65%, rgb(8 24 44 / 0%) 100%);
  border-radius: 0 0 24px 24px;
}
.title {
  position: absolute;
  top: 50%;
  left: 50%;
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  text-shadow: 0 0 18px rgb(70 180 255 / 75%);
  letter-spacing: 2px;
  transform: translate(-50%, -50%);
}
.controls {
  display: flex;
  gap: 14px;
  align-items: center;
}
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #dff1ff;
  cursor: pointer;
  background: rgb(20 60 110 / 85%);
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}
.icon-btn:hover {
  background: rgb(35 100 170 / 95%);
  box-shadow: 0 4px 16px rgb(40 120 220 / 40%);
}
.chat-btn {
  position: relative;
}

@media (width <= 768px) {
  .alarm-header {
    padding: 16px 18px 12px;
    border-radius: 0 0 22px 22px;
  }
  .title {
    font-size: 22px;
  }
  .icon-btn {
    width: 38px;
    height: 38px;
  }
}
</style>
