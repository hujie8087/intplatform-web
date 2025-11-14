<template>
  <div>
    <!-- 延迟等待时间卡片消息 -->
    <div v-if="showCard" class="wait-card-message">
      <div class="wait-card">
        <div class="card-header">
          <el-icon class="card-icon"><Clock /></el-icon>
          <span class="card-title">延迟等待时间申请</span>
        </div>
        <div class="card-content">
          <div class="wait-info">
            <span class="info-label">申请延长：</span>
            <span class="info-value">{{ waitData?.extendMin }}分钟</span>
          </div>
          <div class="wait-info">
            <span class="info-label">订单号：</span>
            <span class="info-value">{{ waitData?.orderNumber }}</span>
          </div>
          <div class="wait-info">
            <span class="info-label">申请人：</span>
            <span class="info-value">{{ waitData?.nickName }}</span>
          </div>
          <div v-if="waitData?.stationName" class="wait-info">
            <span class="info-label">等待站点：</span>
            <span class="info-value">{{ waitData?.stationName }}</span>
          </div>
          <div v-if="waitData?.remark" class="wait-info">
            <span class="info-label">备注：</span>
            <span class="info-value">{{ waitData?.remark }}</span>
          </div>
        </div>
        <div class="card-footer">
          <div class="status-info">
            <!-- 显示原始状态 -->
            <el-tag :type="getStatusTagType(waitData?.status || '')" size="small">
              {{ getStatusText(waitData?.status || "0") }}
            </el-tag>

            <!-- 如果有最新处理状态且不等于原始状态，显示最新状态 -->
            <el-tag
              v-if="hasLastStatus"
              :type="getStatusTagType(waitData?.lastStatus?.toString() || '0')"
              size="small"
              class="last-status-tag"
            >
              → {{ getStatusText(waitData?.lastStatus?.toString() || "0") }}
            </el-tag>

            <!-- 显示拒绝原因 -->
            <div v-if="waitData?.rejectReason" class="reject-reason">拒绝原因：{{ waitData?.rejectReason }}</div>

            <!-- 显示最新处理的拒绝原因 -->
            <!-- <div v-if="waitData.lastRejectReason" class="last-reject-reason">
              最新拒绝原因：{{ waitData.lastRejectReason }}
            </div> -->

            <!-- 显示审核信息 -->
            <div v-if="waitData?.lastAuditUserName" class="audit-info">
              （{{ waitData?.lastAuditUserName }} {{ waitData?.lastAuditTime }}）
            </div>
          </div>
          <!-- 审核按钮 - 只有待审核状态且没有最新处理状态才显示 -->
          <div v-if="showActionButtons" class="action-buttons">
            <el-button type="success" size="small" @click="handleApprove" :loading="processing"> 通过 </el-button>
            <el-button type="danger" size="small" @click="handleReject" :loading="processing"> 拒绝 </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 拒绝原因弹窗 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="拒绝申请"
      width="400px"
      :close-on-click-modal="false"
      v-if="!isExternalDataSource"
    >
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="拒绝原因" required>
          <el-input
            v-model="rejectForm.rejectReason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝原因"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmRejectRequest" :loading="processing"> 确认拒绝 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { Clock } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useUserStore } from "@/stores/modules/user";
import { useMessageSender } from "../composables/useMessageSender";
import dayjs from "dayjs";
import { SosChart } from "@/api/interface/sosAlart";
import { approveWaitTimeExtension } from "@/api/modules/sosAlart";
// 定义props
interface Props {
  /** 等待时间数据 - 当显示卡片时使用 */
  waitData?: SosChart.TripWaitingExtension;
  /** 消息信息 - 当显示卡片时使用 */
  message?: SosChart.ResChatMessageList;
  /** 是否正在处理 */
  processing?: boolean;
  /** 是否显示卡片 */
  showCard?: boolean;
  /** 聊天会话信息 */
  chatSession?: { sessionId: string };
  /** 历史消息列表 */
  historyMessages?: SosChart.ResChatMessageList[];
  isExternalDataSource?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  processing: false,
  showCard: false,
  isExternalDataSource: false
});

// 定义emits
const emit = defineEmits<{
  approve: [message: SosChart.ResChatMessageList];
  reject: [message: SosChart.ResChatMessageList];
  approvalComplete: [waitData: SosChart.TripWaitingExtension];
  sendMessage: [data: { sessionId: string; content: string; contentType: string }];
  scrollToBottom: [];
}>();

// Store
const userStore = useUserStore();

// 消息发送器
const { sendWaitCardMessage } = useMessageSender();

// 拒绝弹窗相关
const rejectDialogVisible = ref(false);
const rejectForm = ref({
  rejectReason: ""
});
const currentRejectMessage = ref<SosChart.ResChatMessageList | null>(null);

// 处理状态

// 是否有最新处理状态
const hasLastStatus = computed(() => {
  return (
    props.waitData?.lastStatus !== undefined &&
    props.waitData?.lastStatus !== -1 &&
    props.waitData?.lastStatus?.toString() !== props.waitData?.status
  );
});

// 是否显示操作按钮
const showActionButtons = computed(() => {
  if (!props.waitData || props.isExternalDataSource) return false;
  // 只有待审核状态且没有最新处理状态才显示操作按钮
  return props.waitData.status === "0" && !hasLastStatus.value;
});

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    "0": "待审核",
    "1": "已通过",
    "2": "已拒绝"
  };
  return statusMap[status] || "未知状态";
};

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  const typeMap: Record<string, "warning" | "success" | "danger" | "info"> = {
    "0": "warning",
    "1": "success",
    "2": "danger"
  };
  return typeMap[status] || "info";
};

const processingValue = ref(false);

// 处理通过操作
const handleApprove = async () => {
  if (!props.message || !props.waitData) return;

  try {
    processingValue.value = true;

    const approveData = {
      ...props.waitData,
      status: "1",
      auditUserName: userStore.userInfo?.user.userName,
      auditTime: dayjs().format("YYYY-MM-DD HH:mm:ss")
    };

    await ElMessageBox.confirm(`确认通过此申请吗？`, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    // 调用API审核通过
    await approveWaitTimeExtension(approveData);

    // 发送审核结果消息
    await sendWaitCardResultMessage(approveData);

    ElMessage.success("审核通过");
  } catch (error) {
    if (error !== "cancel") {
      console.error("审核通过失败:", error);
      ElMessage.error("审核失败");
    }
  } finally {
    processingValue.value = false;
  }
};

// 处理拒绝操作
const handleReject = () => {
  if (props.message && props.waitData) {
    currentRejectMessage.value = props.message;
    rejectForm.value.rejectReason = "";
    rejectDialogVisible.value = true;
  }
};

// 确认拒绝申请
const confirmRejectRequest = async () => {
  if (!rejectForm.value.rejectReason.trim()) {
    ElMessage.warning("请输入拒绝原因");
    return;
  }

  if (!currentRejectMessage.value || !props.waitData) return;

  try {
    processingValue.value = true;

    const rejectData = {
      ...props.waitData,
      status: "2",
      rejectReason: rejectForm.value.rejectReason,
      auditUserName: userStore.userInfo?.user.userName,
      auditTime: dayjs().format("YYYY-MM-DD HH:mm:ss")
    };

    // 调用API审核拒绝
    await approveWaitTimeExtension(rejectData);

    // 发送审核结果消息
    await sendWaitCardResultMessage(rejectData);

    ElMessage.success("已拒绝申请");
    rejectDialogVisible.value = false;
    currentRejectMessage.value = null;
  } catch (error) {
    console.error("拒绝申请失败:", error);
    ElMessage.error("操作失败");
  } finally {
    processingValue.value = false;
  }
};

// 发送审核结果消息
const sendWaitCardResultMessage = async (waitData: SosChart.TripWaitingExtension) => {
  if (!props.chatSession) return;

  try {
    await sendWaitCardMessage(waitData);

    // 通知父组件发送消息
    emit("sendMessage", {
      sessionId: props.chatSession.sessionId,
      content: JSON.stringify(waitData),
      contentType: "CARD_WAIT"
    });

    // 滚动到底部
    nextTick(() => {
      emit("scrollToBottom");
    });

    console.log("审核结果消息发送成功，等待WebSocket回调进行同步");
  } catch (error) {
    console.error("发送审核结果消息失败:", error);
  }
};

// 通过延迟申请 - 内部处理
const approveWaitRequest = async (waitData: SosChart.TripWaitingExtension) => {
  try {
    const approveData = {
      ...waitData,
      status: "1", // 1通过
      auditUserName: userStore.userInfo?.user.userName,
      auditTime: dayjs().format("YYYY-MM-DD HH:mm:ss")
    };

    await approveWaitTimeExtension(approveData);

    // 更新本地数据
    waitData.status = "1";
    waitData.auditUserName = userStore.userInfo?.user.userName;
    waitData.auditTime = dayjs().format("YYYY-MM-DD HH:mm:ss");

    emit("approvalComplete", waitData);
    ElMessage.success("审核通过");
  } catch (error) {
    console.error("审核通过失败:", error);
    ElMessage.error("审核失败");
  }
};

// 拒绝延迟申请 - 内部处理
const rejectWaitRequest = async (waitData: SosChart.TripWaitingExtension, rejectReason: string) => {
  try {
    const rejectData = {
      ...waitData,
      status: "2", // 2拒绝
      rejectReason: rejectReason,
      auditUserName: userStore.userInfo?.user.userName,
      auditTime: dayjs().format("YYYY-MM-DD HH:mm:ss")
    };

    await approveWaitTimeExtension(rejectData);

    // 更新本地数据
    waitData.status = "2";
    waitData.rejectReason = rejectReason;
    waitData.auditUserName = userStore.userInfo?.user.userName;
    waitData.auditTime = dayjs().format("YYYY-MM-DD HH:mm:ss");

    emit("approvalComplete", waitData);
    ElMessage.success("已拒绝申请");
  } catch (error) {
    console.error("拒绝申请失败:", error);
    ElMessage.error("操作失败");
  }
};

// 暴露方法给父组件
defineExpose({
  approveWaitRequest,
  rejectWaitRequest,
  getRejectReason: () => rejectForm.value.rejectReason
});
</script>

<style scoped lang="scss">
.wait-card-message {
  .wait-card {
    min-width: 320px;
    max-width: 350px;
    padding: 16px;
    background: var(--el-fill-color-extra-light);
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    .card-header {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 12px;
      .card-icon {
        font-size: 16px;
        color: #ff6b35;
      }
      .card-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
    }
    .card-content {
      margin-bottom: 12px;
      .wait-info {
        display: flex;
        margin-bottom: 6px;
        .info-label {
          min-width: 70px;
          font-size: 13px;
          color: var(--el-text-color-regular);
        }
        .info-value {
          font-size: 13px;
          font-weight: 500;
          color: var(--el-text-color-primary);
        }
      }
    }
    .card-footer {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      .status-info {
        flex: 1;
        .last-status-tag {
          margin-left: 8px;
        }
        .reject-reason {
          margin-top: 4px;
          font-size: 12px;
          line-height: 1.4;
          color: var(--el-color-danger);
        }
        .last-reject-reason {
          margin-top: 4px;
          font-size: 12px;
          font-weight: 500;
          line-height: 1.4;
          color: var(--el-color-danger);
        }
        .audit-info {
          margin-top: 2px;
          font-size: 11px;
          color: var(--el-text-color-placeholder);
        }
        .processed-info {
          margin-top: 4px;
          font-size: 12px;
          color: var(--el-text-color-secondary);
          .audit-info {
            margin-left: 4px;
            font-size: 11px;
            color: var(--el-text-color-placeholder);
          }
        }
        .processed-reject-reason {
          margin-top: 2px;
          font-size: 12px;
          line-height: 1.4;
          color: var(--el-color-danger);
        }
      }
      .action-buttons {
        display: flex;
        gap: 8px;
        margin-left: 12px;
      }
    }
  }
}
</style>
