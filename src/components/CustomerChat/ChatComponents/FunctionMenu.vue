<template>
  <div class="function-menu">
    <div class="menu-grid">
      <div class="menu-item" @click="handleImage">
        <el-icon class="menu-icon"><Picture /></el-icon>
        <span class="menu-text">图片</span>
      </div>

      <div class="menu-item" @click="handleVideo">
        <el-icon class="menu-icon"><VideoCamera /></el-icon>
        <span class="menu-text">视频</span>
      </div>

      <!-- <div class="menu-item" @click="handleAudio">
        <el-icon class="menu-icon"><Microphone /></el-icon>
        <span class="menu-text">语音</span>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { Picture, VideoCamera } from "@element-plus/icons-vue";
import { useChatStore } from "@/stores/modules/chat";
import { useMessageSender } from "../composables/useMessageSender";
import { ElMessage } from "element-plus";
import { SosChart } from "@/api/interface/sosAlart";

const emit = defineEmits<{
  sendFileMessageSuccess: [message: SosChart.ResChatMessageList];
}>();
const chatStore = useChatStore();
const { sendImageMessage, sendVideoMessage } = useMessageSender();

// 处理图片选择
const handleImage = async () => {
  if (!chatStore.currentSession) {
    ElMessage.warning("请先选择聊天会话");
    return;
  }

  try {
    const message = await sendImageMessage();
    // chatStore.messages.push(message)

    // 滚动到底部
    // nextTick(() => {
    //   // 触发滚动到底部事件
    //   const messageList = document.querySelector('.message-scrollbar')
    //   if (messageList) {
    //     messageList.scrollTop = messageList.scrollHeight
    //   }
    // })
    emit("sendFileMessageSuccess", message);
  } catch (error) {
    console.error("发送图片失败:", error);
  }
};

// 处理视频选择
const handleVideo = async () => {
  if (!chatStore.currentSession) {
    ElMessage.warning("请先选择聊天会话");
    return;
  }

  try {
    const message = await sendVideoMessage();
    // chatStore.messages.push(message)

    // 滚动到底部
    // nextTick(() => {
    //   const messageList = document.querySelector('.message-scrollbar')
    //   if (messageList) {
    //     messageList.scrollTop = messageList.scrollHeight
    //   }
    // })
    emit("sendFileMessageSuccess", message);
  } catch (error) {
    console.error("发送视频失败:", error);
  }
};

// 处理音频录制
// const handleAudio = async () => {
//   if (!chatStore.currentSession) {
//     ElMessage.warning("请先选择聊天会话");
//     return;
//   }

//   try {
//     const message = await sendAudioMessage();
//     chatStore.messages.push(message);

//     // 滚动到底部
//     nextTick(() => {
//       const messageList = document.querySelector(".message-scrollbar");
//       if (messageList) {
//         messageList.scrollTop = messageList.scrollHeight;
//       }
//     });
//   } catch (error) {
//     console.error("发送音频失败:", error);
//   }
// };
</script>

<style lang="scss" scoped>
.function-menu {
  padding: 8px;
  background-color: #f8f9fa;
  border-top: 1px solid #e8e8e8;
}
.menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  max-width: 300px;
}
.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 6px;
  cursor: pointer;
  background-color: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  transition: all 0.2s;
  &:hover {
    background-color: #f5f7fa;
    border-color: #409eff;
    transform: translateY(-2px);
  }
}
.menu-icon {
  margin-bottom: 4px;
  font-size: 20px;
  color: #409eff;
}
.menu-text {
  font-size: 10px;
  color: #333333;
  text-align: center;
}
</style>
