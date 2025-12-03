<template>
  <div class="message-list">
    <div class="message-list-header">
      <h3>客服消息</h3>

      <!-- 高级筛选按钮 -->
      <div class="filter-section">
        <el-popover
          v-model:visible="showFilterDialog"
          placement="bottom-end"
          :width="350"
          trigger="click"
          popper-class="filter-popover"
        >
          <template #reference>
            <el-button type="primary" :icon="Filter" size="small">
              筛选
              <el-badge v-if="appliedFiltersCount > 0" :value="appliedFiltersCount" />
            </el-button>
          </template>

          <!-- 筛选表单内容 -->
          <div class="filter-panel">
            <el-form ref="formRef" :model="currentFilters" label-width="80px" size="small" class="filter-form">
              <el-form-item label="订单号">
                <el-input v-model="currentFilters.orderNumber" placeholder="请输入订单号" size="small" clearable />
              </el-form-item>

              <el-form-item label="姓名">
                <el-input v-model="currentFilters.nickName" placeholder="姓名" size="small" clearable />
              </el-form-item>

              <el-form-item label="工号">
                <el-input v-model="currentFilters.userName" placeholder="请输入工号" size="small" clearable />
              </el-form-item>
            </el-form>

            <div class="filter-actions" style="margin-top: 10px; text-align: right">
              <el-button size="small" @click="handleFilterReset"> 重置 </el-button>
              <el-button type="primary" size="small" :loading="searchLoading" @click="handleFilterConfirm"> 确定 </el-button>
            </div>
          </div>
        </el-popover>
      </div>
    </div>

    <div class="message-list-content">
      <el-scrollbar ref="scrollbarRef" @scroll="handleScroll">
        <div class="chat-records">
          <div
            v-for="record in filteredRecords"
            :key="record.sessionId || record.orderId"
            class="chat-record-item"
            :class="{
              active: selectedSessionId === record.sessionId?.toString()
            }"
            @click="selectRecord(record)"
          >
            <div class="record-avatar">
              <el-avatar :size="40" :src="record.customerAvatar" :alt="getCustomerName(record)">
                {{ getCustomerName(record).charAt(0) }}
              </el-avatar>
              <el-badge v-if="getUnreadCount(record) > 0" :value="getUnreadCount(record)" class="unread-badge" />
              <span class="user-type" :class="getUserTypeClass(record.userType)">
                {{ getUserTypeText(record.userType) }}
              </span>
            </div>

            <div class="record-content">
              <div class="record-header">
                <div class="customer-info">
                  <div class="customer-details">
                    <div class="name-time-container">
                      <span class="customer-name">
                        {{ record.nickName || "未知客户" }}
                      </span>
                      <div class="record-time">
                        {{ formatTime(record.updateTime || record.createTime) }}
                      </div>
                    </div>
                  </div>
                  <div class="user-info">
                    <span class="user-name"> 工号: {{ record.userName || "未知" }} </span>
                  </div>
                </div>
              </div>

              <div class="last-message">
                <span v-if="record.lastMessage" class="message-content">
                  <!-- <template v-if="record.lastMessage.contentType === ContentType.TEXT"> -->
                  {{ record.lastMessage }}
                  <!-- </template> -->
                  <!-- <template v-else-if="record.lastMessage.contentType === ContentType.IMAGE">
                    [图片]
                  </template>
                  <template v-else-if="record.lastMessage.contentType === ContentType.VIDEO">
                    [视频]
                  </template>
                  <template v-else-if="record.lastMessage.contentType === ContentType.AUDIO">
                    [语音]
                  </template> -->
                </span>
                <!-- <span v-else class="no-message">暂无消息</span> -->
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredRecords.length === 0" class="empty-state">
          <el-empty description="暂无聊天记录" />
        </div>

        <!-- 加载更多提示 -->
        <div v-if="filteredRecords.length > 0" class="load-more-container">
          <div v-if="isLoadingMore" class="loading-more">
            <el-icon class="is-loading">
              <Loading />
            </el-icon>
            <span>加载中...</span>
          </div>
          <div v-else-if="!hasMoreData" class="no-more-data">
            <span>没有更多数据了</span>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { Filter, Loading } from "@element-plus/icons-vue";
import { emitter } from "@/utils/mitt";
import { SosChart } from "@/api/interface/sosAlart";
import { getChatSessions } from "@/api/modules/sosAlart/chat";
import { useChatStore } from "@/stores/modules/chat";
import { useUserStore } from "@/stores/modules/user";
import dayjs from "dayjs";
// 移除props，因为选中状态现在由组件内部管理

// 移除emit定义，因为selectRecord事件不再需要

const searchKeyword = ref("");
// const searchFilters = ref({
//   orderNumber: "",
//   nickName: "",
//   userName: ""
// });
const chatRecords = ref<SosChart.ResChatSessionList[]>([]);
const loading = ref(false);
const searchLoading = ref(false);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(20);
const hasMoreData = ref(true);
const isLoadingMore = ref(false);
const totalCount = ref(0); // 总记录数

// 高级筛选相关
const showFilterDialog = ref(false);
const currentFilters = ref({
  orderNumber: "",
  nickName: "",
  userName: "",
  userType: ""
});
const appliedFiltersCount = ref(0);

// 内部管理选中状态
const selectedSessionId = ref<string>("");

// 搜索相关状态
const isSearchMode = ref(false);
const searchResults = ref<SosChart.ResChatSessionList[]>([]);

// 滚动相关
const scrollbarRef = ref();

// 定时轮询已由 store 管理，这里不再需要

// 过滤后的聊天记录 - 使用 store 的数据
const filteredRecords = computed(() => {
  // 如果是搜索模式，显示搜索结果
  if (isSearchMode.value) {
    return searchResults.value;
  }
  // 否则显示 store 中的会话数据
  return chatStore.sessions;
});
const chatStore = useChatStore();

// 格式化时间
const formatTime = (timeStr: string): string => {
  return dayjs(timeStr).format("YYYY-MM-DD HH:mm:ss");
};

// 选择聊天记录
const selectRecord = async (record: SosChart.ResChatSessionList) => {
  const recordSessionId = record.sessionId?.toString() || "";

  // 如果点击的是同一个会话，则退出聊天
  if (selectedSessionId.value === recordSessionId) {
    console.log("点击同一个会话，退出聊天");

    // 清除选中状态
    selectedSessionId.value = "";

    // 通过emitter发送退出聊天事件
    emitter.emit("chatSessionChanged" as any, {
      selectedSession: null,
      oldSession: record
    });
    record.unreadCount = 0;
    return;
  }

  // 如果选择的是不同的会话，需要先关闭当前会话
  if (selectedSessionId.value && selectedSessionId.value !== recordSessionId) {
    try {
      // 查找当前选中的会话记录
      const currentRecord = chatRecords.value.find(r => r.sessionId?.toString() === selectedSessionId.value);
      if (currentRecord?.sessionId) {
        console.log("关闭当前会话:", currentRecord.sessionId);
        // await closeChatSession(currentRecord.sessionId.toString());
      }
    } catch (error) {
      console.error("关闭当前会话失败:", error);
      // 即使关闭失败也继续切换到新会话
    }
  }

  // 更新选中状态
  selectedSessionId.value = recordSessionId;

  // 选择会话项，传递给ChatInterface
  selectSessionItem(record);
};

// 搜索处理
// const handleSearch = async () => {
//   const { orderNumber, nickName, userName } = searchFilters.value;
//   const hasSearchCriteria = orderNumber.trim() || nickName.trim() || userName.trim();

//   if (!hasSearchCriteria) {
//     handleClearSearch();
//     return;
//   }

//   try {
//     searchLoading.value = true;
//     isSearchMode.value = true;

//     const searchParams: any = {
//       page: 1,
//       size: 20
//     };

//     // 添加搜索条件
//     if (orderNumber.trim()) {
//       searchParams.orderNumber = orderNumber.trim();
//     }
//     if (nickName.trim()) {
//       searchParams.nickName = nickName.trim();
//     }
//     if (userName.trim()) {
//       searchParams.userName = userName.trim();
//     }

//     // 调用 store 的方法进行搜索
//     await chatStore.loadChatSessions(true, false, searchParams);

//     if (chatStore.sessions && chatStore.sessions.length > 0) {
//       searchResults.value = chatStore.sessions;
//     } else {
//       searchResults.value = [];
//     }

//     console.log("搜索结果:", searchResults.value.length, "条记录");
//   } catch (error) {
//     console.error("搜索失败:", error);
//     ElMessage.error("搜索失败，请重试");
//     searchResults.value = [];
//   } finally {
//     searchLoading.value = false;
//   }
// };

// 清除搜索
const handleClearSearch = () => {
  searchKeyword.value = "";
  isSearchMode.value = false;
  searchResults.value = [];
};

// 清空所有搜索条件
// const handleClearAllSearch = () => {
//   searchFilters.value = {
//     orderNumber: "",
//     nickName: "",
//     userName: ""
//   };
//   handleClearSearch();
// };

// 重置筛选
const handleFilterReset = () => {
  currentFilters.value = {
    orderNumber: "",
    nickName: "",
    userName: "",
    userType: ""
  };
  appliedFiltersCount.value = 0;
  handleClearSearch();
};

// 处理筛选确认
const handleFilterConfirm = async () => {
  // 计算应用的筛选条件数量
  let count = 0;
  if (currentFilters.value.orderNumber.trim()) count++;
  if (currentFilters.value.nickName.trim()) count++;
  if (currentFilters.value.userName.trim()) count++;
  if (currentFilters.value.userType.trim()) count++;

  appliedFiltersCount.value = count;

  // 执行搜索
  await performSearch();
  showFilterDialog.value = false;
};

// 执行搜索的统一方法
const performSearch = async () => {
  const userStore = useUserStore();
  const userId = userStore.thirdUserInfo?.id;
  if (!userId) {
    throw new Error("用户不存在");
  }
  const { orderNumber, nickName, userName, userType } = currentFilters.value;
  const hasSearchCriteria = orderNumber.trim() || nickName.trim() || userName.trim() || userType.trim();

  if (!hasSearchCriteria) {
    handleClearSearch();
    return;
  }

  try {
    searchLoading.value = true;
    isSearchMode.value = true;

    const searchParams: any = {
      page: 1,
      size: 20
    };

    // 添加搜索条件
    if (orderNumber.trim()) {
      searchParams.orderNumber = orderNumber.trim();
    }
    if (nickName.trim()) {
      searchParams.nickName = nickName.trim();
    }
    if (userName.trim()) {
      searchParams.userName = userName.trim();
    }
    if (userType.trim()) {
      searchParams.userType = userType.trim();
    }

    // 调用 store 的方法进行搜索
    // 注意：我们需要获取完整的响应数据，包括total等分页信息
    // 由于chatStore.loadChatSessions没有返回这些信息，我们需要修改调用方式

    const params: any = {
      userId,
      page: 1,
      size: 20,
      ...searchParams
    };

    console.log("performSearch 调用参数:", params);
    const response: any = await getChatSessions(params);

    if (response?.code === 200) {
      searchResults.value = response.data?.records || [];
      totalCount.value = parseInt(response.data?.total || "0");
      hasMoreData.value = searchResults.value.length < totalCount.value;
    } else {
      searchResults.value = [];
      totalCount.value = 0;
      hasMoreData.value = false;
    }

    console.log("搜索结果:", searchResults.value.length, "条记录");
  } catch (error) {
    console.error("搜索失败:", error);
    ElMessage.error("搜索失败，请重试");
    searchResults.value = [];
    totalCount.value = 0;
    hasMoreData.value = false;
  } finally {
    searchLoading.value = false;
  }
};

// 获取客户名称（兼容新旧API格式）
const getCustomerName = (record: any): string => {
  return record.nickName || record.customerName || record.userName || "未知用户";
};

// 获取用户类型文本
const getUserTypeText = (userType: string): string => {
  switch (userType) {
    case "USER":
      return "用户";
    case "AGENT":
      return "客服";
    default:
      return "未知";
  }
};

// 获取用户类型样式类
const getUserTypeClass = (userType: string): string => {
  switch (userType) {
    case "USER":
      return "user-type-user";
    case "DRIVER":
      return "user-type-driver";
    case "AGENT":
      return "user-type-agent";
    default:
      return "user-type-unknown";
  }
};

// 获取订单号（兼容新旧API格式）
// const getOrderNumber = (record: any): string => {
//   return record.orderNumber || record.orderNo || "";
// };

// 编辑订单
// const handleEditOrder = (record: any) => {
//   // 确保有订单ID
//   if (!record.orderId && !record.orderNumber) {
//     ElMessage.warning("无法获取订单信息");
//     return;
//   }

//   // 构造订单对象
//   const orderData = {
//     orderId: record.orderId,
//     orderNumber: record.orderNumber || getOrderNumber(record)
//   };

//   // 打开订单编辑对话框
// };

// 获取未读数量（处理字符串和数字类型）
const getUnreadCount = (record: any): number => {
  if (typeof record.unreadCount === "string") {
    return parseInt(record.unreadCount) || 0;
  }
  return record.unreadCount || 0;
};

// 选择会话项，只传递会话信息，不加载聊天历史
const selectSessionItem = (record: SosChart.ResChatSessionList) => {
  console.log("选择会话项:", record);
  console.log("会话ID:", record.sessionId);

  // 通过emitter发送选中的会话项信息
  emitter.emit("chatSessionChanged" as any, {
    selectedSession: {
      ...record
    }
  });
};

// 获取聊天记录列表 - 使用 store 的方法
const fetchChatRecords = async (loadMore = false) => {
  if (loadMore) {
    if (isLoadingMore.value || !hasMoreData.value) return;
    isLoadingMore.value = true;
  } else {
    loading.value = true;
    currentPage.value = 1;
    hasMoreData.value = true;
  }

  try {
    // 直接调用API获取完整响应，以便获取total信息
    const userStore = useUserStore();
    const userId = userStore.thirdUserInfo?.id;
    if (!userId) {
      throw new Error("用户不存在");
    }

    const pageNum = loadMore ? currentPage.value + 1 : 1;
    const params: any = {
      userId,
      page: pageNum,
      size: pageSize.value
    };

    console.log("fetchChatRecords 调用参数:", params);
    const response: any = await getChatSessions(params);

    if (response?.code === 200) {
      const records = response.data?.records || [];

      if (loadMore) {
        // 加载更多，追加数据
        // 注意：这里我们需要确保不会添加重复的记录
        const existingIds = new Set(chatStore.sessions.map(session => session.sessionId));
        const newRecords = records.filter((record: any) => !existingIds.has(record.sessionId));
        chatStore.sessions = [...chatStore.sessions, ...newRecords];
      } else {
        // 首次加载或刷新，替换数据
        chatStore.sessions = records;
      }

      // 更新总记录数和分页状态
      totalCount.value = parseInt(response.data?.total || "0");

      // 使用API返回的total信息来判断是否还有更多数据
      if (loadMore) {
        currentPage.value = pageNum;
        hasMoreData.value = chatStore.sessions.length < totalCount.value;
      } else {
        hasMoreData.value = chatStore.sessions.length < totalCount.value;
      }

      console.log("获取聊天记录成功，当前会话数量:", chatStore.sessions.length, "总记录数:", totalCount.value);
    }
  } catch (error) {
    console.error("获取聊天记录失败:", error);
    if (!loadMore) {
      ElMessage.error("获取聊天记录失败");
    }
    hasMoreData.value = false;
  } finally {
    loading.value = false;
    isLoadingMore.value = false;
  }
};

// 滚动处理函数
const handleScroll = ({ scrollTop, scrollHeight, clientHeight }: any) => {
  // 检查是否滚动到底部
  const threshold = 50; // 距离底部50px时触发加载
  if (scrollHeight - scrollTop - clientHeight < threshold) {
    fetchChatRecords(true); // 加载更多
  }
};

// 处理未读消息数量变化事件
const handleUnreadCountChanged = () => {
  console.log("收到未读消息数量变化事件，刷新会话列表");
  fetchChatRecords(); // 刷新会话列表
};

const handleCurrentSessionReadOver = (session: SosChart.ResChatSessionList) => {
  const handleCurrentSession = filteredRecords.value.find(record => record.sessionId === session.sessionId);
  if (handleCurrentSession) {
    handleCurrentSession.unreadCount = 0;
  }
};

// 事件监听
emitter.on("currentSessionReadOver" as any, handleCurrentSessionReadOver);
emitter.on("unreadCountChanged" as any, handleUnreadCountChanged);

onMounted(() => {
  fetchChatRecords();
});

onUnmounted(() => {
  emitter.off("currentSessionReadOver" as any, handleCurrentSessionReadOver);
  emitter.off("unreadCountChanged" as any, handleUnreadCountChanged);
});

defineExpose({
  fetchChatRecords
});
</script>

<style scoped lang="scss">
.message-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color);
  .message-list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid var(--el-border-color);
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
    .filter-section {
      display: flex;
      justify-content: flex-end;
      .filter-badge {
        :deep(.el-badge__content) {
          top: 8px;
          right: 8px;
        }
      }
    }
  }
  .message-list-content {
    flex: 1;
    overflow: hidden;
  }
  .chat-records {
    .chat-record-item {
      display: flex;
      padding: 12px 16px;
      cursor: pointer;
      border-bottom: 1px solid var(--el-border-color-lighter);
      transition: all 0.2s ease;
      &:hover {
        background-color: var(--el-fill-color-light);
      }
      &.active {
        background-color: var(--el-color-primary-light-9);
        border-right: 3px solid var(--el-color-primary);
      }
      .record-avatar {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-right: 12px;
        .unread-badge {
          position: absolute;
          top: -5px;
          right: -5px;
        }
        .user-type {
          width: 100%;
          padding: 2px 6px;
          margin-top: 4px;
          font-size: 12px;
          font-weight: 500;
          text-align: center;
          border-radius: 4px;
          &.user-type-user {
            color: var(--el-color-success);
            background-color: var(--el-color-success-light-8);
          }
          &.user-type-driver {
            color: var(--el-color-warning);
            background-color: var(--el-color-warning-light-8);
          }
          &.user-type-agent {
            color: var(--el-color-info);
            background-color: var(--el-color-info-light-8);
          }
          &.user-type-unknown {
            color: var(--el-text-color-secondary);
            background-color: var(--el-fill-color);
          }
        }
      }
      .record-content {
        flex: 1;
        min-width: 0;
        .record-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 4px;
          .customer-info {
            display: flex;
            flex: 1;
            flex-direction: column;
            gap: 4px;
            .customer-details {
              display: flex;
              flex-direction: column;
              gap: 4px;
              .name-time-container {
                display: flex;
                flex-direction: column;
                gap: 2px;
                .customer-name {
                  font-size: 14px;
                  font-weight: 500;
                  color: var(--el-text-color-primary);
                }
                .record-time {
                  font-size: 10px;
                  line-height: 1.2;
                  color: var(--el-text-color-secondary);
                  word-break: break-all;
                  white-space: pre-line;
                }
              }
            }
            .user-info {
              .user-name {
                font-size: 12px;
                color: var(--el-text-color-secondary);
              }
            }
            .order-no {
              font-size: 12px;
              color: var(--el-text-color-secondary);
            }
            .order-no-container {
              display: flex;
              gap: 4px;
              align-items: center;
              cursor: pointer;
              transition: all 0.2s ease;
              &:hover {
                .order-no {
                  color: var(--el-color-primary);
                }
                .edit-icon {
                  color: var(--el-color-primary);
                }
              }
              .order-no {
                font-size: 12px;
                color: var(--el-text-color-secondary);
                transition: color 0.2s ease;
              }
              .edit-icon {
                font-size: 12px;
                color: var(--el-text-color-secondary);
                transition: color 0.2s ease;
              }
            }
          }
        }
        .last-message {
          .message-content {
            display: -webkit-box;
            overflow: hidden;
            font-size: 13px;
            color: var(--el-text-color-regular);
            text-overflow: ellipsis;
            -webkit-line-clamp: 1;
            line-clamp: 1;
            -webkit-box-orient: vertical;
          }
          .no-message {
            font-size: 13px;
            font-style: italic;
            color: var(--el-text-color-placeholder);
          }
        }
      }
    }
  }
  .empty-state {
    padding: 40px 20px;
    text-align: center;
  }
  .load-more-container {
    padding: 16px;
    text-align: center;
    border-top: 1px solid var(--el-border-color-lighter);
    .loading-more {
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: var(--el-text-color-secondary);
      .el-icon {
        font-size: 16px;
      }
    }
    .no-more-data {
      font-size: 13px;
      color: var(--el-text-color-placeholder);
    }
  }
}

// 筛选面板样式
:deep(.filter-popover) {
  .filter-panel {
    .filter-form {
      .el-form-item {
        margin-bottom: 16px;
        .el-form-item__label {
          font-weight: 500;
          color: var(--el-text-color-primary);
        }
      }
    }
    .filter-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      padding-top: 16px;
      margin-top: 16px;
      border-top: 1px solid var(--el-border-color-lighter);
    }
  }
}
</style>
