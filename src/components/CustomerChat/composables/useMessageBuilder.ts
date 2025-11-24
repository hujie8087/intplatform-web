import dayjs from "dayjs";
import { ContentType, MessageType, SenderType, SosChart, UserType } from "@/api/interface/sosAlart";
import { useUserStore } from "@/stores/modules/user";
import { getTripWaitingDetail } from "@/api/modules/sosAlart";
/**
 * 消息构建器 Composable
 * 统一处理各种类型消息的创建逻辑
 */
export function useMessageBuilder() {
  const userInfo = useUserStore().thirdUserInfo || {};
  /**
   * 创建基础消息对象
   */
  const createBaseMessage = (sessionId: string, content: string, contentType: ContentType): SosChart.ResChatMessageList => {
    return {
      id: Date.now().toString(),
      messageId: Date.now().toString(),
      sessionId: sessionId,
      content: content,
      contentType: contentType,
      senderType: SenderType.AGENT, // web端默认为客服
      senderName: userInfo?.name || userInfo?.account || "客服",
      senderId: userInfo?.account || "",
      timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      createTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      avatar: "",
      status: "sent",
      // 必需字段
      type: MessageType.CHAT_MESSAGE,
      userId: userInfo?.account || "",
      nickName: userInfo?.name || "客服",
      userName: userInfo?.account || "",
      userType: UserType.AGENT // web端默认为客服
    };
  };

  /**
   * 创建发送消息请求对象
   */
  const createSendMessageRequest = (sessionId: string, content: string, contentType: ContentType) => {
    return {
      sessionId: sessionId,
      content: content,
      contentType: contentType,
      senderType: SenderType.AGENT, // web端默认为客服
      timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss")
    };
  };

  /**
   * 创建文本消息
   */
  const createTextMessage = (sessionId: string, content: string): SosChart.ResChatMessageList => {
    return createBaseMessage(sessionId, content, ContentType.TEXT);
  };

  /**
   * 创建图片消息
   */
  const createImageMessage = (sessionId: string, imageUrl: string): SosChart.ResChatMessageList => {
    return createBaseMessage(sessionId, imageUrl, ContentType.IMAGE);
  };

  /**
   * 创建视频消息
   */
  const createVideoMessage = (sessionId: string, videoUrl: string): SosChart.ResChatMessageList => {
    return createBaseMessage(sessionId, videoUrl, ContentType.VIDEO);
  };

  /**
   * 创建音频消息
   */
  const createAudioMessage = (sessionId: string, audioUrl: string, duration?: number): SosChart.ResChatMessageList => {
    const message = createBaseMessage(sessionId, audioUrl, ContentType.AUDIO);
    if (duration) {
      message.duration = duration;
    }
    return message;
  };

  /**
   * 创建延迟等待卡片消息
   */
  const createWaitCardMessage = (sessionId: string, waitData: any): SosChart.ResChatMessageList => {
    const content = JSON.stringify(waitData);
    return createBaseMessage(sessionId, content, ContentType.CARD_WAIT);
  };

  /**
   * 从WebSocket消息创建本地消息对象
   */
  const createMessageFromWebSocket = (messageData: any): SosChart.ResChatMessageList => {
    return {
      id: messageData.id || messageData.messageId || Date.now().toString(),
      messageId: messageData.messageId || messageData.id,
      sessionId: messageData.sessionId,
      content: messageData.content || messageData.message || "",
      contentType: messageData.contentType || messageData.type || ContentType.TEXT,
      senderType: messageData.senderType || SenderType.USER, // 接收的消息通常来自用户
      senderName: messageData.senderName || messageData.sender || "用户",
      senderId: messageData.senderId || "",
      timestamp: messageData.timestamp || messageData.createTime || dayjs().format("YYYY-MM-DD HH:mm:ss"),
      createTime: messageData.createTime || messageData.timestamp || dayjs().format("YYYY-MM-DD HH:mm:ss"),
      avatar: messageData.avatar || "",
      status: messageData.status || "received",
      duration: messageData.duration,
      // 必需字段
      type: messageData.type || MessageType.NEW_MESSAGE,
      userId: messageData.userId || messageData.senderId || "",
      nickName: messageData.nickName || messageData.senderName || "",
      userName: messageData.userName || messageData.senderName || "",
      userType: messageData.userType || UserType.USER // 接收的消息通常来自用户
    };
  };

  /**
   * 获取显示的发送者名称
   */
  const getDisplaySenderName = (message: SosChart.ResChatMessageList): string => {
    if (message.senderType === SenderType.AGENT) {
      return "我";
    }
    return message.senderName || "用户";
  };

  /**
   * 格式化时间显示
   */
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // 如果是今天
    if (diff < 24 * 60 * 60 * 1000 && now.getDate() === date.getDate()) {
      return date.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
    }

    // 如果是昨天
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    if (yesterday.getDate() === date.getDate()) {
      return (
        "昨天 " +
        date.toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        })
      );
    }

    // 其他情况显示日期
    return date.toLocaleDateString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  };

  /**
   * 获取CARD_WAIT消息的数据
   */
  const getWaitCardData = (message: SosChart.ResChatMessageList) => {
    try {
      return JSON.parse(message.content);
    } catch (error) {
      console.error("解析CARD_WAIT数据失败:", error);
      return {};
    }
  };

  /**
   * 同步相同tweId的CARD_WAIT消息状态
   * @param messages 消息列表
   * @param newMessage 新消息或最新状态的消息
   * @param isInitialLoad 是否为初始化页面加载
   */
  const syncWaitCardMessagesByTweId = (
    messages: SosChart.ResChatMessageList[],
    newMessage?: SosChart.ResChatMessageList,
    isInitialLoad: boolean = false
  ) => {
    try {
      console.log("开始同步CARD_WAIT消息状态，消息总数:", messages.length);
      // 收集所有CARD_WAIT消息并按tweId分组
      const waitCardGroups = new Map<string, SosChart.ResChatMessageList[]>();

      messages.forEach(msg => {
        if (msg.contentType === ContentType.CARD_WAIT) {
          try {
            const waitData = JSON.parse(msg.content);
            if (waitData.tweId) {
              if (!waitCardGroups.has(waitData.tweId)) {
                waitCardGroups.set(waitData.tweId, []);
              }
              waitCardGroups.get(waitData.tweId)!.push(msg);
            }
          } catch (error) {
            console.error("解析CARD_WAIT消息失败:", error);
          }
        }
      });

      // 如果有新消息，也加入分组
      if (newMessage && newMessage.contentType === ContentType.CARD_WAIT) {
        try {
          const newWaitData = JSON.parse(newMessage.content);
          if (newWaitData.tweId) {
            if (!waitCardGroups.has(newWaitData.tweId)) {
              waitCardGroups.set(newWaitData.tweId, []);
            }
            waitCardGroups.get(newWaitData.tweId)!.push(newMessage);
          }
        } catch (error) {
          console.error("解析新CARD_WAIT消息失败:", error);
        }
      }

      // console.log('找到的CARD_WAIT消息分组:', waitCardGroups.size)

      // 对每个tweId组进行状态同步
      waitCardGroups.forEach(async (groupMessages, tweId) => {
        // console.log(`处理tweId: ${tweId}, 消息数量: ${groupMessages.length}`)
        if (groupMessages.length <= 1) return;

        // 如果是初始化页面加载且有tweId，先尝试从API获取最新状态
        if (isInitialLoad && tweId) {
          try {
            console.log(`初始化页面，请求tweId: ${tweId} 的最新状态`);
            const response = (await getTripWaitingDetail(tweId)) as any;
            if (response && response.code === 200 && response.data) {
              // 使用API返回的最新数据更新所有相同tweId的消息
              const apiData = response.data;
              groupMessages.forEach(msg => {
                try {
                  const msgWaitData = JSON.parse(msg.content);
                  // 更新为API返回的最新状态
                  msgWaitData.status = apiData.status;
                  msgWaitData.auditUserName = apiData.auditUserName;
                  msgWaitData.auditTime = apiData.auditTime;
                  msgWaitData.rejectReason = apiData.rejectReason;
                  msgWaitData.lastStatus = apiData.status !== "0" ? apiData.status : -1;
                  msgWaitData.lastAuditUserName = apiData.auditUserName || "";
                  msgWaitData.lastAuditTime = apiData.auditTime || "";

                  // 更新消息内容
                  msg.content = JSON.stringify(msgWaitData);
                } catch (error) {
                  console.error("更新API数据到CARD_WAIT消息失败:", error);
                }
              });
              return; // API更新成功，跳过后续的本地同步逻辑
            }
          } catch (error) {
            console.error(`请求tweId: ${tweId} 详情失败，使用本地同步:`, error);
            // API请求失败，继续使用本地同步逻辑
          }
        }

        // 找到最新的已处理消息（状态不为0）或者时间最新的消息
        let latestMessage: SosChart.ResChatMessageList | null = null;
        let latestProcessedMessage: SosChart.ResChatMessageList | null = null;

        // 按时间排序，找到最新的消息
        const sortedByTime = groupMessages.sort((a, b) => {
          try {
            const aData = JSON.parse(a.content);
            const bData = JSON.parse(b.content);
            const aTime = new Date(aData.createTime || a.createTime || a.timestamp).getTime();
            const bTime = new Date(bData.createTime || b.createTime || b.timestamp).getTime();
            return bTime - aTime; // 降序，最新的在前
          } catch (error) {
            return 0;
          }
        });

        latestMessage = sortedByTime[0] as SosChart.ResChatMessageList;

        // 查找最新的已处理消息（状态不为0）
        for (const msg of sortedByTime) {
          try {
            const waitData = JSON.parse(msg.content);
            if (waitData.status !== "0") {
              latestProcessedMessage = msg as SosChart.ResChatMessageList;
              break;
            }
          } catch (error) {
            continue;
          }
        }

        // 优先使用已处理的消息，否则使用时间最新的消息
        const referenceMessage = latestProcessedMessage || latestMessage;
        let referenceWaitData: any;

        try {
          referenceWaitData = JSON.parse(referenceMessage.content);
        } catch (error) {
          console.error("解析参考CARD_WAIT消息失败:", error);
          return;
        }

        // 将参考状态同步到所有相同tweId的消息
        groupMessages.forEach(msg => {
          try {
            const msgWaitData = JSON.parse(msg.content);

            // 为所有消息添加lastStatus字段，表示该tweId组的最新处理状态
            if (referenceWaitData.status !== "0") {
              // 有已处理的消息，设置lastStatus为最新处理状态
              msgWaitData.lastStatus = referenceWaitData.status;
              msgWaitData.lastAuditUserName = referenceWaitData.auditUserName;
              msgWaitData.lastAuditTime = referenceWaitData.auditTime;
              // 只有拒绝状态才同步拒绝原因
              if (referenceWaitData.status === "2") {
                msgWaitData.rejectReason = referenceWaitData.rejectReason;
              }
            } else {
              // 没有已处理的消息，设置lastStatus为-1或清除
              msgWaitData.lastStatus = -1;
              msgWaitData.lastAuditUserName = "";
              msgWaitData.lastAuditTime = "";
              msgWaitData.rejectReason = "";
            }

            // 更新消息内容
            msg.content = JSON.stringify(msgWaitData);
          } catch (error) {
            console.error("更新CARD_WAIT消息状态失败:", error);
          }
        });
      });
    } catch (error) {
      console.error("同步CARD_WAIT消息状态失败:", error);
    }
  };

  return {
    createBaseMessage,
    createSendMessageRequest,
    createTextMessage,
    createImageMessage,
    createVideoMessage,
    createAudioMessage,
    createWaitCardMessage,
    createMessageFromWebSocket,
    getDisplaySenderName,
    formatTime,
    getWaitCardData,
    syncWaitCardMessagesByTweId
  };
}
