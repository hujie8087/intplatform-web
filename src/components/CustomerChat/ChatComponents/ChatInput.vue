<template>
  <div v-if="currentEntryData" class="chat-input">
    <!-- 功能菜单 -->
    <FunctionMenu
      v-if="showFunctionMenu"
      :current-entry-data="currentEntryData"
      @send-file-message-success="sendFileMessageSuccess"
    />

    <!-- 输入区域 -->
    <div class="input-container">
      <el-button :icon="Plus" circle size="small" @click="toggleMenu" />

      <el-input
        :model-value="inputMessage"
        type="textarea"
        :rows="2"
        :maxlength="5000"
        show-word-limit
        resize="none"
        placeholder="请输入消息内容..."
        class="message-input"
        @update:model-value="handleInput"
        @keydown.enter.exact.prevent="handleSend"
        @focus="handleFocus"
      />

      <el-button type="primary" size="small" :disabled="!inputMessage.trim()" @click="handleSend"> 发送 </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { Plus } from "@element-plus/icons-vue";
import FunctionMenu from "./FunctionMenu.vue";
import { useMessageSender } from "../composables/useMessageSender";
import { useScrollControl } from "../composables/useScrollControl";

interface CurrentEntryData {
  sessionId: string;
  userId: string;
  userType: string;
  userName?: string;
  nickName?: string;
  orderId?: string;
  orderNumber?: string;
  orderNo?: string;
  customerName?: string;
  status?: string;
  createBy?: string;
  unreadCount?: number;
}

interface Props {
  /** 当前会话数据 */
  currentEntryData: CurrentEntryData | null;
}

const { currentEntryData } = defineProps<Props>();
// ChatInput 完全独立，不再需要 emit 事件

// const chatStore = useChatStore();
const { sendTextMessage } = useMessageSender();
const { scrollToBottom } = useScrollControl();
// 内部管理输入状态
const inputMessage = ref("");
const showFunctionMenu = ref(false);

// 处理输入
const handleInput = (value: string) => {
  inputMessage.value = value;
};

// 处理发送
const handleSend = async () => {
  if (!inputMessage.value.trim()) return;

  try {
    await sendTextMessage(inputMessage.value.trim());
    // chatStore.messages.push(message)

    // 清空输入框
    inputMessage.value = "";

    // 滚动到底部
    nextTick(() => {
      scrollToBottom();
    });
  } catch (error) {
    console.error("发送消息失败:", error);
  }
};
// 发送文件消息成功
const sendFileMessageSuccess = () => {
  // 发送成功后，将当前输入框清空
  showFunctionMenu.value = false;
  // 滚动到底部
  nextTick(() => {
    scrollToBottom();
  });
};
// 切换菜单
const toggleMenu = () => {
  showFunctionMenu.value = !showFunctionMenu.value;
};

// 处理焦点
const handleFocus = () => {
  showFunctionMenu.value = false;
};
</script>

<style lang="scss" scoped>
.chat-input {
  background-color: #ffffff;
  border-top: 1px solid #e8e8e8;
}
.input-container {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  padding: 16px;
}
.message-input {
  flex: 1;
  :deep(.el-textarea__inner) {
    line-height: 1.4;
    resize: none;
    border-radius: 8px;
  }
}
</style>
