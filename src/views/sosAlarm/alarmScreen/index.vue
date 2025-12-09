<template>
  <div class="dashboard-container">
    <div class="map-wrapper">
      <AlarmMap ref="alarmMapRef" @marker-select="handleMarkerSelect" />
    </div>

    <div class="header-overlay">
      <AlarmHeader :is-fullscreen="isFullscreen" @toggle-fullscreen="toggleFullscreen" @open-alarm-record="openAlarmRecord" />
    </div>

    <div class="list-overlay">
      <AlarmList :alarms="alarmReports" @alarm-click="handleAlarmClick" />
    </div>

    <div v-if="selectedAlarm" class="chat-panel">
      <div class="chat-panel__header">
        <div class="chat-panel__title">
          <span class="chat-panel__label">报警号</span>
          <span class="chat-panel__value">
            {{ getOrderNumber(selectedAlarm) }}
          </span>
        </div>
        <div class="chat-panel__actions">
          <el-button v-if="selectedAlarm" class="chat-panel__process" type="primary" size="small" @click="openProcessDialog">
            处理报警
          </el-button>
          <el-button class="chat-panel__close" circle text @click="closeChatPanel">
            <el-icon size="20">
              <Close />
            </el-icon>
          </el-button>
        </div>
      </div>

      <div class="chat-panel__body">
        <div class="chat-panel__alarm">
          <div class="alarm-meta-grid">
            <div class="meta-item">
              <span class="meta-label">报警时间</span>
              <span class="meta-value">
                {{ formatAlarmTime(selectedAlarm.reportTime) }}
              </span>
            </div>
            <div class="meta-item">
              <span class="meta-label">报警人</span>
              <span class="meta-value">{{ selectedAlarm.reportBy || "未知" }}</span>
            </div>
          </div>

          <div class="meta-location">
            <span class="location-dot"></span>
            <p class="location-value">
              {{ selectedAlarm.reportLocation || formatLocation(selectedAlarm) }}
            </p>
          </div>

          <p class="meta-description">
            {{ selectedAlarm.reportDescription || "暂无报警描述" }}
          </p>
        </div>

        <div class="chat-panel__chat">
          <div class="chat-panel__chat-wrapper">
            <ChatInterfaceRefactored />
            <div v-if="isChatInitializing" class="chat-panel__overlay">
              <el-icon class="is-loading">
                <Loading />
              </el-icon>
              <span>正在加载聊天...</span>
            </div>
            <div v-else-if="chatError" class="chat-panel__overlay chat-panel__overlay--error">
              {{ chatError }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="processDialogVisible"
      title="处理报警"
      width="460px"
      append-to-body
      draggable
      :close-on-click-modal="false"
      @closed="handleProcessDialogClosed"
    >
      <el-form ref="processFormRef" :model="processForm" :rules="processRules" label-width="80px" class="process-form">
        <el-form-item label="处理人" prop="processingBy">
          <el-input v-model="processForm.processingBy" disabled placeholder="请输入处理人" clearable />
        </el-form-item>
        <el-form-item label="处理结果" prop="processingResult">
          <el-input
            v-model="processForm.processingResult"
            type="textarea"
            :rows="5"
            maxlength="200"
            show-word-limit
            placeholder="请输入处理结果"
          />
        </el-form-item>
        <el-form-item label="处理时间" prop="processingTime">
          <el-date-picker
            v-model="processForm.processingTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择处理时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="processForm.remark"
            type="textarea"
            :rows="2"
            maxlength="100"
            show-word-limit
            placeholder="可填写备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="processDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="processLoading" @click="submitProcessForm"> 确认处理 </el-button>
        </div>
      </template>
    </el-dialog>
    <AlarmRecords ref="alarmRecordsRef" @alarm-click="handleAlarmClick" />
  </div>
</template>

<script setup lang="ts">
import { nextTick, reactive, ref, watch } from "vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { Close, Loading } from "@element-plus/icons-vue";
import ChatInterfaceRefactored from "@/components/CustomerChat/ChatInterfaceRefactored.vue";
import AlarmHeader from "./components/AlarmHeader.vue";
import AlarmMap from "./components/AlarmMap.vue";
import AlarmList from "./components/AlarmList.vue";
import { getChatSessionByOrder } from "@/api/modules/sosAlart/chat";
import { useAlarmWebSocket } from "./components/useAlarmWebSocket";
import { useUserStore } from "@/stores/modules/user";
import { useChatStore } from "@/stores/modules/chat";
import { emitter } from "@/utils/mitt";
import dayjs from "dayjs";
import { processAlarm } from "@/api/modules/sosAlart";
import AlarmRecords from "./components/AlarmRecords.vue";

const alarmRecordsRef = ref<InstanceType<typeof AlarmRecords>>();

const isFullscreen = ref(false);
const alarmMapRef = ref();
const { alarmReports } = useAlarmWebSocket();
// 标记地图是否已经初始化完成，避免每次数据变更都重新 initMap
const mapInitialized = ref(false);
const userStore = useUserStore();
const chatStore = useChatStore();

const selectedAlarm = ref<any | null>(null);
const isChatInitializing = ref(false);
const chatError = ref<string | null>(null);

watch(
  alarmReports,
  newAlarms => {
    nextTick(() => {
      if (!alarmMapRef.value) return;
      // 第一次有数据时初始化地图
      if (!mapInitialized.value) {
        alarmMapRef.value.initMap(newAlarms);
        mapInitialized.value = true;
      } else {
        // 之后只更新 markers，避免和 initMap 重复/冲突
        alarmMapRef.value.updateMarkers(newAlarms);
      }
    });
  },
  { deep: true }
);
const getOrderNumber = (alarm: any) => {
  if (!alarm) return "";
  return alarm.orderNumber || alarm.orderNo || alarm.order_id || alarm.orderId || "";
};

const formatAlarmTime = (value?: string) => {
  if (!value) return "未知时间";
  return value.replace("T", " ").replace(/\.\d+Z?$/, "");
};

const focusAlarmOnMap = (alarm: any) => {
  if (alarmMapRef.value && alarm.latitude && alarm.longitude) {
    console.log(alarm);
    alarmMapRef.value.centerOnLocation(alarm.latitude, alarm.longitude);
  }
};

const openChatForAlarm = async (alarm: any) => {
  if (!alarm) return;
  if (isChatInitializing.value) return;

  const orderNumberRaw = getOrderNumber(alarm);
  if (!orderNumberRaw) {
    ElMessage.warning("该报警缺少订单编号");
    return;
  }

  const userIdFromStore = userStore.userInfo.user.userId ? String(userStore.userInfo.user.userId) : "";
  const employeeId = userStore.userInfo.user.userName ? String(userStore.userInfo.user.userName) : "";
  const sessionUserIdentifier = employeeId || userIdFromStore;

  if (!sessionUserIdentifier) {
    ElMessage.error("无法获取当前登录用户信息");
    return;
  }

  chatError.value = null;
  selectedAlarm.value = alarm;
  chatStore.clearCurrentSession();
  emitter.emit("chatSessionChanged" as any, {
    selectedSession: null
  });
  isChatInitializing.value = true;
  try {
    await nextTick();

    await chatStore.initWebSocketConnection(userIdFromStore || sessionUserIdentifier);

    const response: any = await getChatSessionByOrder(String(orderNumberRaw));

    if (!response || response.code !== 200 || !response.data) {
      const message = response?.msg || "获取聊天会话失败";
      chatError.value = message;
      ElMessage.error(message);
      return;
    }

    const rawSession = response.data || {};
    const sessionId = rawSession.sessionId ? rawSession.sessionId.toString() : "";

    if (!sessionId) {
      const message = "返回的会话信息缺少 sessionId";
      chatError.value = message;
      ElMessage.error(message);
      return;
    }

    const normalizedSession = {
      ...rawSession,
      sessionId,
      orderNumber: String(orderNumberRaw),
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
    chatError.value = message;
    ElMessage.error(message);
  } finally {
    isChatInitializing.value = false;
  }
};

const handleMarkerSelect = async (alarm: any) => {
  focusAlarmOnMap(alarm);
  // 打开标记的 popup
  if (alarmMapRef.value) {
    alarmMapRef.value.openMarkerPopup(alarm);
  }
  await openChatForAlarm(alarm);
};

const handleAlarmClick = async (alarm: any) => {
  // focusAlarmOnMap(alarm);
  // await openChatForAlarm(alarm);
  handleMarkerSelect(alarm);
};

const closeChatPanel = () => {
  selectedAlarm.value = null;
  chatError.value = null;
  chatStore.clearCurrentSession();
  emitter.emit("chatSessionChanged" as any, {
    selectedSession: null
  });
};

const toggleFullscreen = async () => {
  const container = document.querySelector(".dashboard-container") as HTMLElement;
  if (!document.fullscreenElement) {
    await container.requestFullscreen();
    isFullscreen.value = true;
  } else {
    await document.exitFullscreen();
    isFullscreen.value = false;
  }
};

const openAlarmRecord = () => {
  if (!alarmRecordsRef.value) return;
  alarmRecordsRef.value?.acceptParams({ title: "报警历史记录" });
};

const processDialogVisible = ref(false);
const processLoading = ref(false);
const processFormRef = ref<FormInstance>();
interface ProcessForm {
  id: number | null;
  processingBy: string;
  processingResult: string;
  processingTime: string;
  remark: string;
}

const processForm = reactive<ProcessForm>({
  id: null,
  processingBy: "",
  processingResult: "",
  processingTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
  remark: ""
});

const processRules: FormRules<ProcessForm> = {
  processingBy: [{ required: true, message: "请输入处理人", trigger: "blur" }],
  processingResult: [{ required: true, message: "请输入处理结果", trigger: "blur" }],
  processingTime: [{ required: true, message: "请选择处理时间", trigger: "change" }]
};
const formatLocation = (alarm: any) => {
  if (!alarm) return "未记录地点";
  if (alarm.reportLocation) return alarm.reportLocation;
  if (typeof alarm.latitude === "number" && typeof alarm.longitude === "number") {
    return `经度: ${Number(alarm.longitude).toFixed(6)}, 纬度: ${Number(alarm.latitude).toFixed(6)}`;
  }
  return "未记录地点";
};
const initProcessForm = () => {
  if (!selectedAlarm.value) return;
  processForm.id = selectedAlarm.value.id ?? null;
  processForm.processingBy =
    selectedAlarm.value.processingBy || userStore.userInfo.user.userName || userStore.userInfo.user.nickName || "";
  processForm.processingResult = selectedAlarm.value.processingResult || "";
  processForm.processingTime = selectedAlarm.value.processingTime || dayjs().format("YYYY-MM-DD HH:mm:ss");
  processForm.remark = selectedAlarm.value.remark || "";
};
const openProcessDialog = () => {
  if (!selectedAlarm.value) return;
  initProcessForm();
  processDialogVisible.value = true;
  nextTick(() => {
    processFormRef.value?.clearValidate();
  });
};
const handleProcessDialogClosed = () => {
  processFormRef.value?.clearValidate();
};

const submitProcessForm = async () => {
  if (!processFormRef.value) return;

  try {
    await processFormRef.value.validate();
  } catch (error) {
    return;
  }

  if (!processForm.id) {
    ElMessage.error("缺少报警ID");
    return;
  }

  processLoading.value = true;

  try {
    const payload = {
      id: processForm.id,
      processingBy: processForm.processingBy,
      processingResult: processForm.processingResult,
      processingTime: processForm.processingTime,
      remark: processForm.remark,
      status: "1"
    };

    const response: any = await processAlarm(payload);
    if (response?.code && response.code !== 200) {
      throw new Error(response?.msg || "处理报警失败");
    }

    ElMessage.success("报警已处理");
    processDialogVisible.value = false;

    if (selectedAlarm.value) {
      selectedAlarm.value.processingBy = processForm.processingBy;
      selectedAlarm.value.processingResult = processForm.processingResult;
      selectedAlarm.value.processingTime = processForm.processingTime;
      selectedAlarm.value.remark = processForm.remark;
    }

    if (Array.isArray(alarmReports.value)) {
      alarmReports.value = alarmReports.value.filter(alarm => alarm.id !== processForm.id);
    }

    closeChatPanel();
  } catch (error: any) {
    console.error("处理报警失败:", error);
    const message = error?.msg || error?.message || "处理报警失败";
    ElMessage.error(message);
  } finally {
    processLoading.value = false;
  }
};
</script>

<style scoped>
.dashboard-container {
  position: relative;
  height: 100%;
  margin: 0 !important;
  overflow: hidden;
  color: #ffffff;
}
.map-wrapper {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.header-overlay {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 1000;
}
.list-overlay {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 900;
  display: flex;
}
.chat-panel {
  position: absolute;
  top: 80px;
  right: 16px;
  bottom: 16px;
  z-index: 980;
  display: flex;
  flex-direction: column;
  width: 480px;
  padding: 10px 12px;
  color: #edf6ff;
  background: rgb(21 46 76 / 70%);
  backdrop-filter: blur(18px);
  border-radius: 12px;
  box-shadow: 0 28px 60px rgb(6 18 34 / 45%);
}
.chat-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid rgb(202 226 255 / 12%);
}
.chat-panel__title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.chat-panel__label {
  font-size: 12px;
  color: rgb(213 230 255 / 70%);
  letter-spacing: 1px;
}
.chat-panel__value {
  font-size: 18px;
  font-weight: 600;
  color: #f5faff;
  letter-spacing: 0.5px;
}
.chat-panel__actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
.chat-panel__process {
  padding: 0 10px;
  font-weight: 500;
  color: #0c2238;
  background: linear-gradient(135deg, #63a4ff, #83eaf1);
  border: none;
}
.chat-panel__process:hover {
  filter: brightness(1.05);
}
.chat-panel__close {
  color: rgb(215 230 255 / 70%);
  transition: all 0.3s ease;
  &:hover {
    color: #000000;
  }
}
.chat-panel__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}
.chat-panel__alarm {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 12px;
  background: rgb(17 36 59 / 60%);
  backdrop-filter: blur(16px);
  border-radius: 12px;
  box-shadow: inset 0 1px 0 rgb(214 230 255 / 8%);
}
.alarm-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 12px;
}
.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.meta-label {
  font-size: 12px;
  color: rgb(206 226 255 / 65%);
}
.meta-value {
  font-size: 14px;
  font-weight: 500;
  color: #f8fbff;
}
.meta-location {
  display: flex;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid rgb(206 226 255 / 10%);
}
.location-dot {
  width: 10px;
  height: 10px;
  margin-top: 4px;
  background: linear-gradient(135deg, #7bc4ff, #c0e3ff);
  border-radius: 50%;
}
.location-value {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: rgb(233 244 255 / 86%);
}
.meta-description {
  margin: 0;
  font-size: 12px;
  line-height: 1.65;
  color: rgb(233 244 255 / 80%);
}
.chat-panel__chat {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: rgb(15 32 54 / 55%);
  backdrop-filter: blur(16px);
  border-radius: 12px;
  box-shadow: inset 0 1px 0 rgb(214 230 255 / 6%);
}
.chat-panel__chat-wrapper {
  position: relative;
  height: 100%;
  color: #f5f9ff;
  background: transparent;
}
.chat-panel__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #f5f9ff;
  background: rgb(10 22 38 / 72%);
}
.chat-panel__overlay--error {
  padding: 0 12px;
  color: #ffbcbc;
  text-align: center;
  background: rgb(255 123 123 / 16%);
}
.dialog-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
.process-form {
  padding: 10px 15px;
}

@media (width <= 1600px) {
  .chat-panel {
    right: 16px;
    width: 460px;
    padding: 10px;
  }
}

@media (width <= 1024px) {
  .chat-panel {
    right: 16px;
    left: auto;
    width: 420px;
  }
  .alarm-meta-grid {
    grid-template-columns: 1fr;
  }
}

@media (width <= 768px) {
  .chat-panel {
    inset: auto 16px 16px;
    width: calc(100% - 32px);
    height: 60vh;
    padding: 18px;
  }
  .chat-panel__chat {
    height: 52%;
  }
}
</style>
