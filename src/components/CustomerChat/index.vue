<template>
  <el-dialog
    v-model="visible"
    title="客服聊天"
    width="80%"
    top="5vh"
    append-to-body
    :before-close="handleClose"
    destroy-on-close
    draggable
    header-class="customer-chat-header"
    body-class="customer-chat-body"
  >
    <div class="customer-chat-container">
      <div class="message-list-panel">
        <SessionList ref="messageListRef" />
      </div>

      <div class="chat-interface-panel">
        <ChatInterfaceRefactored @refresh-session="handleRefreshSession" />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleRefresh">刷新</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import SessionList from "./SessionList.vue";
import ChatInterfaceRefactored from "./ChatInterfaceRefactored.vue";
import { useChatStore } from "@/stores/modules/chat";

interface Props {
  modelValue: boolean;
  orderId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  orderId: ""
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  close: [];
}>();

const messageListRef = ref<InstanceType<typeof SessionList>>();
const selectedOrderId = ref<number>(props.orderId ? parseInt(props.orderId) : 0);
const chatStore = useChatStore();

const visible = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value)
});

const handleRefreshSession = () => {
  // 鍒锋柊娑堟伅鍒楄〃
  messageListRef.value?.fetchChatRecords();
};

const handleRefresh = () => {
  messageListRef.value?.fetchChatRecords();
  handleRefreshSession();
};

//
const handleClose = () => {
  selectedOrderId.value = 0;

  chatStore.clearCurrentSession();

  // 瑙﹀彂鍏抽棴浜嬩欢锛岃鐖剁粍浠跺鐞?
  emit("update:modelValue", false);
  emit("close");
};

defineExpose({
  handleRefresh
});
</script>

<style scoped lang="scss">
.customer-chat-container {
  display: flex;
  height: 70vh;
  min-height: 500px;
  overflow: hidden;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  .message-list-panel {
    width: 300px;
    min-width: 300px;
    background: var(--el-bg-color);
  }
  .chat-interface-panel {
    flex: 1;
    background: var(--el-bg-color);
  }
}
.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

@media (width <= 768px) {
  .customer-chat-container {
    flex-direction: column;
    height: 80vh;
    .message-list-panel {
      width: 100%;
      height: 200px;
      border-bottom: 1px solid var(--el-border-color);
    }
    .chat-interface-panel {
      flex: 1;
    }
  }
}
</style>
<style>
.el-dialog__body.el-dialog__body {
  padding: 0 !important;
}
.customer-chat-header.el-dialog__header {
  border-bottom: 1px solid var(--el-border-color);
}
</style>
