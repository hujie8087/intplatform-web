<template>
  <div
    class="message-item"
    :class="{
      'is-service': isServiceMessage,
      'is-card-message': contentType === ContentType.CARD_WAIT
    }"
  >
    <div class="message-avatar">
      <el-avatar :size="32" shape="square" :src="message.avatar || ''" :alt="getDisplaySenderName(message)">
        {{ getDisplaySenderName(message).charAt(0) }}
      </el-avatar>
    </div>

    <div class="message-content">
      <div class="message-header">
        <span class="sender-name">{{ getDisplaySenderName(message) }}</span>
        <span class="message-time">
          {{ formatTimeStr(message.createTime || message.timestamp) }}
        </span>
      </div>

      <div class="message-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ContentType, SenderType, SosChart } from "@/api/interface/sosAlart";
import dayjs from "dayjs";
import { computed } from "vue";

interface Props {
  /** 消息对象 */
  message: SosChart.ResChatMessageList;
  /** 消息内容类型 */
  contentType?: string;
}

const props = defineProps<Props>();

// 是否是客服消息
const isServiceMessage = computed(() => {
  return props.message.senderType === SenderType.AGENT;
});

const formatTimeStr = (time: string) => {
  return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
};
// 获取显示的发送者名称
const getDisplaySenderName = (message: SosChart.ResChatMessageList) => {
  if (message.senderType === SenderType.AGENT) {
    return "客服";
    // return message.senderName || message.nickName || "客服";
  } else {
    return message.nickName || message.senderName || message.userName || "用户";
  }
};
</script>

<style lang="scss" scoped>
.message-item {
  display: flex;
  margin-bottom: 12px;
  color: #000000;
  &.is-service {
    flex-direction: row-reverse;
    .message-content {
      align-items: flex-end;
      .message-header {
        text-align: right;
      }
      .message-body {
        color: #000000;
        background-color: #95ec69;
        border: 1px solid var(--el-color-primary-light-7);
      }
    }
  }
  .message-avatar {
    margin: 0 4px;
  }
  .message-content {
    position: relative;
    display: flex;
    flex-direction: column;
    max-width: 60%;
    .message-header {
      margin-bottom: 5px;
      line-height: 10px;
      white-space: nowrap;
      .sender-name {
        margin-right: 8px;
        font-size: 10px;
        color: var(--el-text-color-regular);
        white-space: nowrap;
      }
      .message-time {
        font-size: 10px;
        color: var(--el-text-color-secondary);
        white-space: nowrap;
      }
    }
    .message-body {
      width: fit-content;
      padding: 6px 8px;
      color: #000000;
      background: var(--el-fill-color-light);
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 6px;
      .text-message {
        font-size: 12px;
        word-break: break-word;
        white-space: pre-wrap;
      }
      .audio-player {
        display: flex;
        gap: 6px;
        align-items: center;
        .audio-duration {
          font-size: 10px;
          color: var(--el-text-color-regular);
        }
      }
    }
  }
  &.is-card-message {
    .message-body {
      padding: 0;
    }
  }
}
</style>
