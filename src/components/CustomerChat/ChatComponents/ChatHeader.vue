<template>
  <div class="chat-header">
    <div v-if="currentEntryData" class="order-info">
      <el-avatar shape="square" :size="32" :src="''" :alt="customerName">
        {{ customerName.charAt(0) }}
      </el-avatar>
      <div class="info-content">
        <div class="customer-name">{{ customerName }}</div>
        <div class="order-details">
          <span class="order-no">{{ orderNumber }}</span>
          <!-- <span class="order-status">{{ orderStatusText }}</span> -->
          <!-- <span class="connection-status" :class="{ connected }">
            {{ connected ? '已连接' : '连接中...' }}
          </span> -->
        </div>
      </div>
    </div>
    <div v-else class="no-session">
      <span>请选择一个聊天记录</span>
    </div>

    <!-- 额外操作按钮 -->
    <div class="header-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

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

const props = withDefaults(defineProps<Props>(), {});
// 客户名称
const customerName = computed(() => {
  return props.currentEntryData?.customerName || props.currentEntryData?.nickName || "用户";
});

// 订单号
const orderNumber = computed(() => {
  return props.currentEntryData?.orderNumber || props.currentEntryData?.orderNo || "";
});

// 连接状态
// const connected = computed(() => {
//   return chatStore.isConnected;
// });

// // 订单状态文本
// const orderStatusText = computed(() => {
//   const status = props.currentEntryData?.status || "";
//   const statusMap: Record<string, string> = {
//     OPEN: "进行中",
//     CLOSED: "已结束"
//   };
//   return statusMap[status] || "未知状态";
// });
</script>

<style lang="scss" scoped>
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 12px;
  background-color: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 1px 2px rgb(15 23 42 / 5%);
}
.order-info {
  display: flex;
  flex: 1;
  gap: 8px;
  align-items: center;
}
.info-content {
  flex: 1;
  .customer-name {
    margin-bottom: 2px;
    font-size: 12px;
    font-weight: 600;
    color: #333333;
  }
  .order-details {
    display: flex;
    gap: 12px;
    align-items: center;
    font-size: 10px;
    .order-no {
      color: #666666;
    }
    .order-status {
      padding: 2px 6px;
      color: #334155;
      background-color: rgb(64 158 255 / 10%);
      border-radius: 4px;
    }
    .connection-status {
      color: #f56c6c;
      &.connected {
        color: #67c23a;
      }
    }
  }
}
.no-session {
  flex: 1;
  font-size: 12px;
  color: #999999;
  text-align: center;
}
.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
