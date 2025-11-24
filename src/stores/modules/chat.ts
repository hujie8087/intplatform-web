import { defineStore } from "pinia";
import { ChatState } from "@/stores/interface";
import piniaPersistConfig from "@/stores/helper/persist";
import { ContentType, MessageType, SenderType, SessionStatus, SosChart, UserType } from "@/api/interface/sosAlart";
import { useUserStore } from "./user";
import { webSocketService } from "@/utils/websocketService";
import dayjs from "dayjs";
import { nextTick } from "vue";
import {
  createChatSession,
  getAllUnreadMessageCount,
  getChatHistory,
  getChatSessions,
  markMessagesAsRead
} from "@/api/modules/sosAlart/chat";
import { emitter } from "@/utils/mitt";
export const useChatStore = defineStore({
  id: "logistics-chat",
  state: (): ChatState => ({
    currentSession: null,
    sessions: [],
    messages: [],
    isConnected: false,
    isLoading: false,
    unreadCount: 0,
    sessionPolling: null,
    pollingFailCount: 0,
    maxFailCount: 2,
    unreadPolling: null,
    currentFilterParams: null
  }),
  getters: {
    hasCurrentSession: state => !!state.currentSession,
    currentSessionId: state => state.currentSession?.sessionId?.toString() || ""
  },
  actions: {
    async createChatSessionAction(params: SosChart.ReqSendMessage) {
      try {
        this.isLoading = true;
        console.log("创建聊天会话参数:", params);

        // 调用REST API创建会话
        const response: any = await createChatSession(params);
        console.log("创建会话响应:", response);

        if (response?.code === 200 && response?.data) {
          const session = response.data as SosChart.ResChatSessionList;
          this.currentSession = session;
          console.log("会话创建成功，sessionId:", session.sessionId);
          return session;
        }
        console.error("创建会话失败: 无效响应", response);
        return null;
      } catch (error) {
        console.error("创建聊天会话失败:", error);
        return null;
      } finally {
        this.isLoading = false;
      }
    },
    async initWebSocketConnection(providedUserId?: string) {
      try {
        const userStore = useUserStore();
        const userId = providedUserId || userStore.userInfo?.user?.userId?.toString();

        if (!userId) {
          console.log("用户未登录，跳过WebSocket初始化");
          return false;
        }

        console.log("初始化WebSocket连接，用户ID:", userId);
        const currentConnected = webSocketService.isConnected.value;
        // 如果当前连接状态就不用再初始化
        if (currentConnected) return true;

        try {
          await webSocketService.connect(userId);
          this.isConnected = true;

          return true;
        } catch (error) {
          console.error("WebSocket连接失败:", error);
          this.isConnected = false;
          return false;
        }
      } catch (error) {
        console.error("初始化WebSocket连接失败:", error);
        return false;
      }
    },
    handleWebSocketMessage(messageData: any) {
      try {
        console.log("收到WebSocket消息1:", messageData);

        // 如果是新消息，添加到消息列表
        if (messageData.type === MessageType.NEW_MESSAGE || messageData.type === MessageType.AGENT_MESSAGE) {
          const newMessage: SosChart.ResChatMessageList = {
            id: messageData.id || messageData.messageId || Date.now().toString(),
            messageId: messageData.messageId || messageData.id,
            sessionId: messageData.sessionId,
            content: messageData.content || "",
            contentType: messageData.contentType || ContentType.TEXT,
            senderType: messageData.senderType || SenderType.AGENT,
            senderName: messageData.senderName || "客服",
            senderId: messageData.senderId || "",
            timestamp: messageData.timestamp || new Date().toISOString(),
            type: messageData.type || MessageType.NEW_MESSAGE,
            userId: messageData.userId || messageData.senderId || "",
            nickName: messageData.nickName || messageData.senderName || "",
            userName: messageData.userName || "",
            userType: messageData.userType || UserType.AGENT,
            createTime: messageData.createTime || messageData.timestamp || new Date().toISOString(),
            avatar: messageData.avatar || "",
            status: "received"
          };

          // 如果是当前会话的消息，添加到消息列表
          if (this.currentSession && messageData.sessionId === this.currentSession.sessionId) {
            this.messages.push(newMessage);
          }

          // 更新会话列表中的最后消息
          const sessionIndex = this.sessions.findIndex(s => s.sessionId === messageData.sessionId);
          if (sessionIndex > -1) {
            this.sessions[sessionIndex].lastMessage = messageData.content;
            this.sessions[sessionIndex].lastMessageTime = messageData.timestamp;
            if (this.currentSession?.sessionId !== messageData.sessionId) {
              this.sessions[sessionIndex].unreadCount = (this.sessions[sessionIndex].unreadCount || 0) + 1;
            }
          }
        }
      } catch (error) {
        console.error("处理WebSocket消息失败:", error);
      }
    },
    sendMessage(content: string, contentType: ContentType = ContentType.TEXT) {
      if (!this.currentSession || !this.isConnected) {
        return false;
      }

      // const userStore = useUserStore()
      const userInfo = useUserStore().thirdUserInfo;

      if (!userInfo) {
        return false;
      }

      try {
        const messageData: SosChart.ReqSendMessage = {
          sessionId: this.currentSession.sessionId,
          senderType: SenderType.AGENT, // web端默认为客服
          senderId: userInfo.account || "",
          senderName: userInfo.name || userInfo.account || "客服",
          type: MessageType.CHAT_MESSAGE,
          userId: userInfo.account || "",
          nickName: userInfo.name || "",
          userName: userInfo.account || "",
          userType: UserType.AGENT, // web端默认为客服
          contentType: contentType,
          content: content,
          timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          targetUserId: this.currentSession.userName || "",
          targetUserType: this.currentSession.userType,
          orderId: this.currentSession.orderId?.toString() || ""
        };

        console.log("发送消息参数:", messageData);

        // 先添加到本地消息列表
        const localMessage: SosChart.ResChatMessageList = {
          ...messageData,
          id: Date.now().toString(),
          messageId: Date.now().toString(),
          isRead: true,
          status: "sending"
        };
        this.messages.push(localMessage);

        // 如果是CARD_WAIT类型消息，立即触发同步
        if (contentType === ContentType.CARD_WAIT) {
          // 动态导入同步函数以避免循环依赖
          // import("@/components/CustomerChat/composables/useMessageBuilder").then(({ useMessageBuilder }) => {
          //   const { syncWaitCardMessagesByTweId } = useMessageBuilder();
          //   console.log("发送CARD_WAIT消息后立即同步状态");
          //   syncWaitCardMessagesByTweId(messages.value, localMessage, false);
          // });
        }

        // 通过WebSocket发送消息
        const success = webSocketService.sendMessage(messageData);
        if (success) {
          // 更新消息状态
          localMessage.status = "sent";

          // 更新当前会话的最后消息
          this.currentSession.lastMessage = content;
          this.currentSession.lastMessageTime = messageData.timestamp;

          // 当前会话未读数量置空 并且调用markAsRead方法
          nextTick(() => {
            this.currentSession!.unreadCount = 0;
            this.markAsRead(this.currentSession);
          });
          return true;
        } else {
          // 发送失败，移除本地消息
          this.messages.pop();
          return false;
        }
      } catch (error) {
        console.error("发送消息失败:", error);
        return false;
      }
    },
    /**
     * 加载聊天历史
     */
    async loadChatHistory(sessionId?: string, page: number = 1, size: number = 100) {
      const targetSessionId = sessionId || this.currentSessionId;
      if (!targetSessionId) throw new Error("会话ID不存在");

      try {
        this.isLoading = true;
        const response = await getChatHistory(targetSessionId, {
          page,
          size
        });

        if (response.code === 200 && response.data) {
          const historyData = response.data;

          if (page === 1) {
            // 首次加载，替换消息列表
            this.messages = historyData.rows || historyData || [];
          } else {
            // 加载更多，添加到消息列表前面
            this.messages.unshift(...(historyData.rows || historyData || []));
          }

          console.log("聊天历史加载成功");
        }
      } catch (error) {
        console.error("加载聊天历史失败:", error);
      } finally {
        this.isLoading = false;
      }
    },
    /**
     * 获取会话列表
     */
    async loadChatSessions(showError = true, loadMore = false, filterParams?: any) {
      try {
        if (!loadMore) {
          this.isLoading = true;
        }

        // 保存筛选参数，用于轮询时使用
        if (filterParams !== undefined) {
          this.currentFilterParams = filterParams;
        }

        // const userStore = useUserStore()
        const userName = useUserStore().thirdUserInfo?.id;

        if (!userName) {
          throw new Error("用户不存在");
        }

        // 构建查询参数，优先使用传入的筛选参数，否则使用保存的筛选参数
        const finalFilterParams = filterParams !== undefined ? filterParams : this.currentFilterParams;
        const size = 100;
        const params: any = {
          userName,
          page: loadMore ? Math.floor(this.sessions.length / size) + 1 : 1,
          size: size,
          ...(finalFilterParams || {})
        };

        console.log("loadChatSessions 调用参数:", params);
        const response = await getChatSessions(params);

        if (response?.code === 200 && response?.data?.records) {
          if (loadMore) {
            // 加载更多，追加数据
            this.sessions = [...this.sessions, ...response.data.records];
          } else {
            // 首次加载或刷新，替换数据
            this.sessions = response.data.records;
          }

          this.pollingFailCount = 0; // 重置失败计数
          console.log(`会话列表加载成功，当前${this.sessions.length}条记录`);
        }
      } catch (error) {
        this.pollingFailCount++;
        console.error(`加载会话列表失败 (${this.pollingFailCount}/${this.maxFailCount}):`, error);

        // 只在显示错误且失败次数未达到上限时显示toast
        if (showError && this.pollingFailCount <= this.maxFailCount) {
        }

        // 达到最大失败次数时停止轮询
        if (this.pollingFailCount >= this.maxFailCount) {
          console.warn("会话列表加载失败次数过多，停止轮询");
          this.stopSessionPolling();
        }
      } finally {
        this.isLoading = false;
      }
    },
    /**
     * 断开WebSocket连接
     */
    disconnectWebSocket() {
      webSocketService.disconnect();
      this.isConnected = false;
      console.log("WebSocket已断开");
    },

    /**
     * 清空当前会话
     */
    clearCurrentSession() {
      this.currentSession = null;
      this.messages = [];
    },

    /**
     * 开启会话列表轮询（单位：秒，默认 4 秒）
     */
    startSessionPolling(time = 8) {
      if (this.sessionPolling) {
        console.log("[轮询] 会话列表轮询已开启");
        return;
      }

      console.log("[轮询] 启动会话列表轮询");
      this.pollingFailCount = 0; // 重置失败计数

      // 立即执行一次
      this.loadChatSessions(false);

      this.sessionPolling = setInterval(async () => {
        try {
          console.log("[轮询] 查询会话列表...");
          // 轮询时使用保存的筛选参数
          await this.loadChatSessions(false, false, this.currentFilterParams); // 轮询时不显示错误toast
        } catch (err) {
          console.warn("[轮询] 获取会话列表失败", err);
        }
      }, time * 1000);
    },

    /**
     * 停止会话列表轮询
     */
    stopSessionPolling() {
      if (this.sessionPolling) {
        clearInterval(this.sessionPolling);
        this.sessionPolling = null;
        console.log("[轮询] 停止会话列表轮询");
      }
      this.pollingFailCount = 0; // 重置失败计数
    },

    /**
     * 关闭聊天会话
     */
    async closeChatSession(sessionId: string) {
      try {
        // 这里需要调用关闭会话的API
        console.log("会话关闭成功:", sessionId);

        // 更新本地会话状态
        const sessionIndex = this.sessions.findIndex(s => s.sessionId.toString() === sessionId);
        if (sessionIndex > -1) {
          this.sessions[sessionIndex].status = SessionStatus.CLOSED;
        }

        // 如果关闭的是当前会话，清理当前会话
        if (this.currentSessionId === sessionId) {
          this.clearCurrentSession();
        }
      } catch (error) {
        console.error("关闭会话失败:", error);
        throw error;
      }
    },

    /**
     * 加载消息列表
     */
    async loadMessages() {
      if (!this.currentSession) {
        console.warn("没有当前会话，无法加载消息");
        return;
      }

      try {
        const response: any = await getChatHistory(this.currentSession.sessionId.toString());
        if (response.data && Array.isArray(response.data.records)) {
          this.messages = response.data.records.map((msg: any) => ({
            messageId: msg.messageId || msg.id,
            sessionId: msg.sessionId,
            type: msg.type || MessageType.CHAT_MESSAGE,
            senderType: msg.senderType,
            senderId: msg.senderId,
            senderName: msg.senderName,
            userId: msg.userId || msg.senderId,
            nickName: msg.nickName || msg.senderName,
            userName: msg.userName || "",
            userType: msg.userType || UserType.AGENT,
            contentType: msg.contentType,
            content: msg.content,
            timestamp: msg.timestamp || msg.createTime,
            isRead: msg.isRead,
            status: msg.status,
            // 兼容字段 - 历史消息通常有id字段
            id: msg.id || msg.messageId?.toString() || Date.now().toString()
          }));
          console.log("消息加载成功:", this.messages.length);
        }
      } catch (error) {
        console.error("加载消息失败:", error);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * 标记消息为已读
     */
    async markAsRead(session: any) {
      const targetSessionId = session?.sessionId?.toString() || this.currentSessionId;
      if (!targetSessionId) return;
      console.log("markAsRead session", session);

      try {
        await markMessagesAsRead({
          sessionId: this.currentSession?.sessionId?.toString() || "",
          senderType: SenderType.AGENT
        });
        this.currentSession!.unreadCount = 0;
      } catch (error) {
        console.error("标记已读失败:", error);
      }
    },

    /**
     * 设置当前会话
     */
    async setCurrentSession(sessionData: any) {
      try {
        // 如果已经有会话ID，直接设置
        if (sessionData.sessionId) {
          this.currentSession = {
            sessionId: sessionData.sessionId,
            userId: sessionData.userId,
            userType: sessionData.userType,
            userName: sessionData.userName || "",
            nickName: sessionData.nickName || "",
            orderId: sessionData.orderId || "",
            orderNumber: sessionData.orderNumber || "",
            status: sessionData.status || SessionStatus.OPEN,
            createBy: sessionData.createBy || "",
            updateBy: sessionData.updateBy || "",
            createTime: sessionData.createTime || new Date().toISOString(),
            updateTime: sessionData.updateTime || new Date().toISOString(),
            unreadCount: sessionData.unreadCount || 0,
            lastMessage: sessionData.lastMessage || "",
            lastMessageTime: sessionData.lastMessageTime || ""
          };
          console.log("当前会话设置成功:", this.currentSession);
          return this.currentSession;
        } else {
          // 如果没有会话ID，需要创建会话
          const createParams: any = {
            userId: sessionData.userId,
            userType: sessionData.userType,
            userName: sessionData.userName || "",
            nickName: sessionData.nickName || sessionData.customerName || "",
            orderId: sessionData.orderId || "",
            orderNumber: sessionData.orderNumber || `PK${Date.now()}`,
            senderType: SenderType.AGENT,
            content: "",
            contentType: ContentType.TEXT,
            timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            targetUserId: "",
            sessionId: ""
          };

          const session = await this.createChatSessionAction(createParams as SosChart.ReqSendMessage);
          return session;
        }
      } catch (error) {
        console.error("设置当前会话失败:", error);
        throw error;
      }
    },

    /**
     * 获取未读消息数量
     */
    async fetchUnreadCount() {
      try {
        const response: any = await getAllUnreadMessageCount("AGENT");

        if (response?.code === 200 && response?.data) {
          const newUnreadCount = typeof response.data === "string" ? parseInt(response.data) || 0 : response.data || 0;

          // 检查未读数量是否发生变化
          if (newUnreadCount !== this.unreadCount) {
            console.log(`未读消息数量变化: ${this.unreadCount} -> ${newUnreadCount}`);
            this.unreadCount = newUnreadCount;

            // 发送事件通知会话列表刷新
            emitter.emit("unreadCountChanged" as any, {
              oldCount: this.unreadCount,
              newCount: newUnreadCount
            });
          }
        } else {
          if (this.unreadCount !== 0) {
            this.unreadCount = 0;
            emitter.emit("unreadCountChanged" as any, {
              oldCount: this.unreadCount,
              newCount: 0
            });
          }
        }
      } catch (error) {
        console.error("获取未读消息数量失败:", error);
        if (this.unreadCount !== 0) {
          this.unreadCount = 0;
          emitter.emit("unreadCountChanged" as any, {
            oldCount: this.unreadCount,
            newCount: 0
          });
        }
      }
    },

    /**
     * 开始未读消息轮询
     */
    startUnreadPolling() {
      this.fetchUnreadCount();
      this.unreadPolling = setInterval(this.fetchUnreadCount, 8000); // 每5秒刷新一次
    },

    /**
     * 停止未读消息轮询
     */
    stopUnreadPolling() {
      if (this.unreadPolling) {
        clearInterval(this.unreadPolling);
        this.unreadPolling = null;
      }
    },

    /**
     * 注册WebSocket消息处理器
     */
    registerWebSocketMessageHandler(handler: (message: any) => void) {
      webSocketService.onMessage(handler);
    }
  },
  persist: piniaPersistConfig("logistics-chat")
});
