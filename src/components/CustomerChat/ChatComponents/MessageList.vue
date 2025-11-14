<template>
  <div class="message-list">
    <el-scrollbar ref="scrollbarRef" class="message-scrollbar" @scroll="handleScroll">
      <div v-if="session" class="messages-container">
        <!-- 加载更多提示 -->
        <LoadMoreIndicator
          :loading="loadingMore"
          :has-more="hasMoreMessages"
          :message-count="messages?.length || 0"
          @load-more="handleLoadMore"
          v-if="!isExternalDataSource"
        />

        <!-- 消息列表 -->
        <template v-if="messages.length > 0">
          <MessageWrapper
            v-for="message in messages"
            :key="message.sessionId"
            :message="message"
            :content-type="message.contentType"
          >
            <!-- 文本消息 -->
            <TextMessage v-if="message.contentType === ContentType.TEXT" :content="message.content" />
            <!-- 图片消息 -->
            <ImageMessage v-else-if="message.contentType === ContentType.IMAGE" :content="message.content" />

            <!-- 视频消息 -->
            <VideoMessage v-else-if="message.contentType === ContentType.VIDEO" :content="message.content" />

            <!-- 音频消息 -->
            <AudioMessage
              v-else-if="message.contentType === ContentType.AUDIO"
              :content="message.content"
              :duration="message.extra?.duration"
              @play="handleAudioPlay"
              @pause="handleAudioPause"
            />

            <!-- 延迟等待卡片 -->
            <WaitTimeCardMessage
              v-else-if="message.contentType === ContentType.CARD_WAIT"
              :show-card="true"
              :wait-data="getWaitCardData(message)"
              :message="message"
              :processing="false"
              :chat-session="session"
              :history-messages="messages"
              :is-external-data-source="isExternalDataSource"
              @send-message="handleSendMessage"
              @scroll-to-bottom="scrollToBottom"
            />
          </MessageWrapper>
        </template>
        <!-- 空状态提示 -->
        <div v-if="messages.length === 0" class="empty-messages">
          <el-empty description="暂无聊天记录，开始对话吧" :image-size="80" />
        </div>
      </div>

      <div v-else-if="sessionCreateError" class="session-error">
        <el-empty description="创建会话失败" :image-size="80">
          <template #description>
            <p>创建会话失败</p>
            <p class="error-detail">{{ sessionCreateError }}</p>
          </template>
        </el-empty>
      </div>

      <div v-else class="no-session">
        <el-empty description="请选择一个聊天记录开始对话" :image-size="80" />
      </div>
    </el-scrollbar>

    <!-- 滚动到底部按钮 -->
    <div v-if="showScrollToBottom && !isExternalDataSource" class="scroll-to-bottom" @click="scrollToBottom">
      <el-icon><ArrowDown /></el-icon>
      <span v-if="newMessageCount > 0" class="message-count">{{ newMessageCount }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { ArrowDown } from "@element-plus/icons-vue";
import { emitter } from "@/utils/mitt";
import { useScrollControl } from "../composables/useScrollControl";
import { useLoadMore } from "../composables/useLoadMore";
import { useMessageBuilder } from "../composables/useMessageBuilder";
import MessageWrapper from "../MessageComponents/MessageWrapper.vue";
import TextMessage from "../MessageComponents/TextMessage.vue";
import ImageMessage from "../MessageComponents/ImageMessage.vue";
import VideoMessage from "../MessageComponents/VideoMessage.vue";
import AudioMessage from "../MessageComponents/AudioMessage.vue";
import WaitTimeCardMessage from "../MessageComponents/WaitTimeCardMessage.vue";
import LoadMoreIndicator from "./LoadMoreIndicator.vue";
import { ContentType, SosChart } from "@/api/interface/sosAlart";
import { useChatStore } from "@/stores/modules/chat";

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
  currentEntryData?: CurrentEntryData | null;
  /** 外部传入的会话数据（用于ServiceInfo等场景） */
  session?: SosChart.ResChatSessionList | null;
  /** 外部传入的消息列表（用于ServiceInfo等场景） */
  messages?: SosChart.ResChatMessageList[];
  /** 是否正在加载更多 */
  loadingMore?: boolean;
  /** 是否还有更多消息 */
  hasMoreMessages?: boolean;
}

const props = withDefaults(defineProps<Props>(), {});

// 定义emits（用于外部数据源场景）
const emit = defineEmits<{
  "load-more": [];
}>();

// 全局状态管理
const chatStore = useChatStore();

// Composables
const {
  scrollbarRef,
  showScrollToBottom,
  newMessageCount,
  scrollToBottom,
  handleScroll: onScroll,
  resetScrollState
} = useScrollControl();

const {
  loadingMore: internalLoadingMore,
  hasMoreMessages: internalHasMoreMessages,
  loadMoreMessages: loadMoreFromAPI,
  resetLoadState
} = useLoadMore();

// 优先使用外部传入的loading状态，否则使用内部状态
const loadingMore = computed(() => props.loadingMore ?? internalLoadingMore.value);
const hasMoreMessages = computed(() => props.hasMoreMessages ?? internalHasMoreMessages.value);

const { createMessageFromWebSocket, syncWaitCardMessagesByTweId } = useMessageBuilder();

// 计算属性 - 优先使用外部传入的数据，否则使用chatStore的数据
const session = computed(() => props.session || chatStore.currentSession);
const messages = computed(() => props.messages || chatStore.messages);
const sessionCreateError = computed(() => ""); // 可以从 chatStore 获取错误状态

// 判断是否使用外部数据源
const isExternalDataSource = computed(() => !!(props.session && props.messages));

// 监听外部传入的消息变化，触发同步
watch(
  () => props.messages,
  (newMessages: SosChart.ResChatMessageList[] | undefined) => {
    if (isExternalDataSource.value && newMessages && newMessages.length > 0) {
      console.log("外部消息数据变化，触发CARD_WAIT同步");
      syncWaitCardMessagesByTweId(newMessages, undefined, false);
    }
  },
  { immediate: true, deep: true }
);

// 生命周期
onMounted(() => {
  // 只有在非外部数据源时才设置事件监听器
  if (!isExternalDataSource.value) {
    setupEventListeners();
  }
});

onUnmounted(() => {
  cleanup();
});

// 监听页面需要滚动到底部
emitter.on("scrollToBottomForMessageList" as any, () => {
  nextTick(() => {
    const wrapEl = scrollbarRef.value?.wrapRef;
    if (!wrapEl) return;
    wrapEl.scrollTop = wrapEl.scrollHeight;
    showScrollToBottom.value = false;
    newMessageCount.value = 0;
  });
});

// 设置事件监听器（仅在非外部数据源时使用）
const setupEventListeners = () => {
  if (!isExternalDataSource.value) {
    emitter.on("chatSessionChanged" as any, handleChatSessionChanged);
  }
};

// 处理会话变化事件
const handleChatSessionChanged = async (data: any) => {
  console.log("收到会话变化事件:", data);

  // 处理退出聊天的情况（selectedSession为null）
  if (data.selectedSession === null) {
    console.log("退出聊天，清空会话");

    // 重置 store 中的当前会话状态
    chatStore.clearCurrentSession();

    // 重置状态
    resetScrollState();
    resetLoadState();

    return;
  }

  // 处理选择新会话的情况
  if (data.selectedSession) {
    await handleSessionSelected(data.selectedSession);
  }
};

// 处理会话选择
const handleSessionSelected = async (selectedSession: SosChart.ResChatSessionList) => {
  console.log("选择聊天会话:", selectedSession);

  try {
    // 重置状态
    resetScrollState();
    resetLoadState();

    // 加载历史消息
    await loadInitialMessages(selectedSession);

    // 动态注册WebSocket消息监听（针对当前会话）
    chatStore.registerWebSocketMessageHandler(handleWebSocketMessage);
    // setCurrentSession 设置当前会话 currentSession
    chatStore.setCurrentSession(selectedSession);

    // 标记消息为已读
    markAsRead();

    // 等待DOM更新后滚动到底部
    nextTick(() => {
      scrollToBottom();
    });
  } catch (error) {
    console.error("处理会话选择失败:", error);
  }
};

// 加载初始消息
const loadInitialMessages = async (selectedSession: SosChart.ResChatSessionList) => {
  if (!selectedSession) return;

  try {
    console.log("开始加载聊天历史，sessionId:", selectedSession.sessionId);
    const newMessages = await loadMoreFromAPI(selectedSession.sessionId, []);
    console.log("加载到的消息数量:", newMessages.length);
    // 初始加载时直接设置消息列表
    chatStore.messages = newMessages;

    // 同步CARD_WAIT消息状态（基于tweId）
    console.log("初始加载完成，开始同步CARD_WAIT消息状态");
    syncWaitCardMessagesByTweId(chatStore.messages, undefined, true);
  } catch (error) {
    console.error("加载初始消息失败:", error);
  }
};

// WebSocket消息处理
const handleWebSocketMessage = (messageData: any) => {
  console.log("MessageList收到WebSocket消息:", messageData);

  if (messageData.type === "HEARTBEAT") return;

  if (session.value && messageData.sessionId && messageData.sessionId.toString() === session.value.sessionId.toString()) {
    const messageId = messageData.messageId || messageData.id || Date.now().toString();
    const existingMessage = messages.value.find(
      msg => (msg.messageId && msg.messageId === messageId) || (msg.id && msg.id === messageId)
    );

    if (!existingMessage) {
      const newMessage = createMessageFromWebSocket(messageData);
      chatStore.messages.push(newMessage);

      // 如果是CARD_WAIT类型消息，同步相同tweId的消息状态
      if (newMessage.contentType === ContentType.CARD_WAIT) {
        console.log("收到CARD_WAIT消息，开始同步相同tweId的消息状态");
        syncWaitCardMessagesByTweId(chatStore.messages, newMessage, false);
      }

      // 标记消息为已读
      // markAsRead();

      nextTick(() => {
        scrollToBottom();
      });
    }
  }
};

// 标记消息为已读
const markAsRead = async () => {
  if (!session.value) return;

  try {
    await chatStore.markAsRead(session.value);
  } catch (error) {
    console.error("标记消息已读失败:", error);
  }
};

// 清理资源
const cleanup = () => {
  emitter.off("chatSessionChanged" as any, handleChatSessionChanged);
  resetScrollState();
  resetLoadState();
};

// 当前播放的音频
const currentPlayingAudio = ref<string | null>(null);

// 处理滚动
const handleScroll = () => {
  onScroll();
  console.log("handleScroll");
  // 检查是否需要加载更多
  if (scrollbarRef.value?.wrapRef) {
    const { scrollTop } = scrollbarRef.value.wrapRef;
    if (scrollTop <= 50 && hasMoreMessages.value && !loadingMore.value) {
      handleLoadMore();
    }
  }
};

// 处理加载更多
const handleLoadMore = async () => {
  if (!session.value) return;

  // 如果是外部数据源，直接emit事件让外部组件处理
  if (isExternalDataSource.value) {
    emit("load-more" as any);
    return;
  }

  // 内部数据源的处理逻辑
  try {
    const scrollHeight = scrollbarRef.value?.wrapRef?.scrollHeight || 0;
    const newMessages = await loadMoreFromAPI(session.value.sessionId, messages.value);

    if (newMessages.length > 0) {
      chatStore.messages.unshift(...newMessages);

      // 保持滚动位置
      nextTick(() => {
        if (scrollbarRef.value?.wrapRef) {
          const newScrollHeight = scrollbarRef.value.wrapRef.scrollHeight;
          const heightDiff = newScrollHeight - scrollHeight;
          scrollbarRef.value.wrapRef.scrollTop = heightDiff;
        }
      });
    }
  } catch (error) {
    console.error("加载更多消息失败:", error);
  }
};

// 处理音频播放
const handleAudioPlay = (audioUrl: string) => {
  // 停止其他音频播放
  if (currentPlayingAudio.value && currentPlayingAudio.value !== audioUrl) {
    // 这里可以通过事件或其他方式停止其他音频
    console.log("停止其他音频");
  }
  currentPlayingAudio.value = audioUrl;
  console.log("播放音频:", audioUrl);
};

// 处理音频暂停
const handleAudioPause = () => {
  currentPlayingAudio.value = null;
  console.log("暂停音频");
};

// 处理发送消息
const handleSendMessage = (data: { sessionId: string; content: string; contentType: string }) => {
  // 直接使用全局状态管理发送消息
  console.log("发送消息:", data);
  // 可以在这里调用 chatStore.sendMessage
};

// 滚动到底部方法已在 useScrollControl 中定义

// 获取等待卡片数据
const getWaitCardData = (message: SosChart.ResChatMessageList) => {
  try {
    return JSON.parse(message.content);
  } catch (error) {
    console.error("解析CARD_WAIT数据失败:", error);
    return {};
  }
};

// 暴露滚动容器引用和滚动方法
defineExpose({
  scrollbarRef,
  scrollToBottom: () => {
    if (scrollbarRef.value?.wrapRef) {
      const wrapEl = scrollbarRef.value.wrapRef;
      wrapEl.scrollTop = wrapEl.scrollHeight;
    }
  }
});
</script>

<style lang="scss" scoped>
.message-list {
  position: relative;
  flex: 1;
  height: 0; // 配合flex使用
  background-color: var(--el-bg-color);
}
.message-scrollbar {
  height: 100%;
}
.messages-container {
  min-height: 100%;
  padding: 12px 0;
}
.empty-messages,
.session-error,
.no-session {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}
.error-detail {
  margin-top: 8px;
  font-size: 10px;
  color: #f56c6c;
}
.scroll-to-bottom {
  position: absolute;
  right: 20px;
  bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: #ffffff;
  cursor: pointer;
  background-color: var(--el-color-primary);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
  transition: all 0.3s;
  &:hover {
    background-color: #337ecc;
    transform: translateY(-2px);
  }
  .message-count {
    position: absolute;
    top: -8px;
    right: -8px;
    min-width: 12px;
    padding: 2px 6px;
    font-size: 10px;
    color: #ffffff;
    text-align: center;
    background-color: #f56c6c;
    border-radius: 10px;
  }
}
</style>
