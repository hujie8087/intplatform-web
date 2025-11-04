<template>
  <div class="load-more-container">
    <!-- 加载中状态 -->
    <div v-if="loading" class="load-more-indicator">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载更多消息...</span>
    </div>

    <!-- 可以加载更多 -->
    <div v-else-if="hasMore && messageCount > 0" class="load-more-trigger" @click="handleLoadMore">
      <el-button type="text" size="small">点击加载更多消息</el-button>
    </div>

    <!-- 没有更多消息 -->
    <div v-else-if="messageCount > 0" class="no-more-messages">
      <span class="no-more-text">没有更多消息了</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loading } from "@element-plus/icons-vue";

interface Props {
  /** 是否正在加载 */
  loading: boolean;
  /** 是否还有更多 */
  hasMore: boolean;
  /** 消息数量 */
  messageCount: number;
}

defineProps<Props>();

const emit = defineEmits<{
  loadMore: [];
}>();

// 处理加载更多
const handleLoadMore = () => {
  emit("loadMore");
};
</script>

<style lang="scss" scoped>
.load-more-container {
  display: flex;
  justify-content: center;
  padding: 16px;
}
.load-more-indicator {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  color: #666666;
}
.load-more-trigger {
  cursor: pointer;
}
.no-more-messages {
  .no-more-text {
    font-size: 12px;
    color: #999999;
  }
}
</style>
