<template>
  <div class="chat-interface">
    <!-- 聊天头部 -->
    <ChatHeader :current-entry-data="currentEntryData" />

    <!-- 聊天消息区域 -->
    <MessageList :current-entry-data="currentEntryData" />

    <!-- 消息输入区域 -->
    <ChatInput v-if="currentEntryData" :current-entry-data="currentEntryData" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useChatStore } from "@/stores/modules/chat";
// import { useMessageSender } from "./composables/useMessageSender";
// 组件导入
import ChatHeader from "./ChatComponents/ChatHeader.vue";
import MessageList from "./ChatComponents/MessageList.vue";
import ChatInput from "./ChatComponents/ChatInput.vue";

// Props和Emits
// const emit = defineEmits<{
//   sendMessage: [message: any];
//   refreshSession: [];
// }>();

// Store
const chatStore = useChatStore();

// const { sending } = useMessageSender();

// 创建当前会话数据对象，传递给所有子组件
const currentEntryData = computed(() => {
  const session = chatStore.currentSession;
  if (!session) return null;

  return {
    sessionId: session.sessionId,
    userId: session.userId,
    userType: session.userType,
    userName: session.userName,
    nickName: session.nickName,
    orderId: session.orderId,
    orderNumber: session.orderNumber,
    orderNo: session.orderNumber || "", // Web端使用orderNumber
    customerName: session.nickName, // Web端通常用nickName作为客户名
    status: session.status,
    createBy: session.createBy,
    unreadCount: session.unreadCount
  };
});

// 所有功能已移至对应的子组件内部处理：
// - 音频播放/暂停：MessageList 组件内部处理
// - 功能菜单切换：ChatInput 组件内部处理
// - 多媒体上传：FunctionMenu 组件内部处理
// - 消息发送：各组件直接使用全局状态管理
</script>

<style lang="scss" scoped>
.chat-interface {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f7fa;
}
</style>
