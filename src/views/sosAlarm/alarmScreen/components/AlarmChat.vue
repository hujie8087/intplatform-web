<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" title="聊天记录" width="60%">
    <ChatInterfaceRefactored @refresh-session="handleRefreshSession" />
    <template #footer>
      <el-button type="primary" @click="drawerVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="AlarmRecords">
import { ref } from "vue";
import ChatInterfaceRefactored from "@/components/CustomerChat/ChatInterfaceRefactored.vue";
import { useChatStore } from "@/stores/modules/chat";
import { useUserStore } from "@/stores/modules/user";
import { ElMessage } from "element-plus";
import { emitter } from "@/utils/mitt";
import { nextTick } from "vue";
import { getChatSessionByOrder } from "@/api/modules/sosAlart/chat";

const userStore = useUserStore();

const chatStore = useChatStore();

interface DrawerProps {
  alarm: any;
}
// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  alarm: {} as any
});
// 接收父组件传过来的参数
const acceptParams = async (params: DrawerProps): Promise<void> => {
  drawerProps.value = params;
  drawerVisible.value = true;
  openChatForAlarm(params.alarm);
};

const openChatForAlarm = async (alarm: any) => {
  console.log(alarm);
  if (!alarm) return;

  const userIdFromStore = userStore.userInfo.user.userId ? String(userStore.userInfo.user.userId) : "";
  const employeeId = userStore.userInfo.user.userName ? String(userStore.userInfo.user.userName) : "";
  const sessionUserIdentifier = employeeId || userIdFromStore;

  if (!sessionUserIdentifier) {
    ElMessage.error("无法获取当前登录用户信息");
    return;
  }

  chatStore.clearCurrentSession();
  emitter.emit("chatSessionChanged" as any, {
    selectedSession: null
  });
  try {
    await nextTick();

    await chatStore.initWebSocketConnection(userIdFromStore || sessionUserIdentifier);

    const response: any = await getChatSessionByOrder(String(alarm.orderNo));

    if (!response || response.code !== 200 || !response.data) {
      const message = response?.msg || "获取聊天会话失败";
      ElMessage.error(message);
      return;
    }

    const rawSession = response.data || {};
    const sessionId = rawSession.sessionId ? rawSession.sessionId.toString() : "";

    if (!sessionId) {
      const message = "返回的会话信息缺少 sessionId";
      ElMessage.error(message);
      return;
    }

    const normalizedSession = {
      ...rawSession,
      sessionId,
      orderNumber: String(alarm.orderNo),
      userId: rawSession.userId ?? sessionUserIdentifier,
      userName: rawSession.userName ?? sessionUserIdentifier,
      nickName: rawSession.nickName ?? rawSession.userName ?? alarm.reportBy ?? "",
      userType: rawSession.userType ?? "USER",
      status: rawSession.status ?? "OPEN"
    };

    await chatStore.setCurrentSession(normalizedSession);
    await chatStore.loadChatHistory(sessionId);

    await nextTick();
    emitter.emit("chatSessionChanged" as any, {
      selectedSession: normalizedSession
    });
  } catch (error: any) {
    console.error("打开聊天失败:", error);
    const message = error?.msg || error?.message || "打开聊天失败，请稍后重试";
    ElMessage.error(message);
  }
};
const handleRefreshSession = () => {
  console.log("handleRefreshSession");
};
defineExpose({
  acceptParams
});
</script>
