import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { ResPage, ResPageData } from "@/api/interface";
import { SosChart } from "@/api/interface/sosAlart";

/**
 * 创建或获取聊天会话
 * @param data 会话创建参数
 */
export const createChatSession = (data: SosChart.ReqSendMessage) => {
  return http.post<SosChart.ResChatSessionList>(PORT1 + `/customer/chat/sessions/create`, data);
};

/**
 * 根据订单号获取聊天会话
 */
export const getChatSessionByOrder = (orderNumber: string) => {
  return http.get<SosChart.ResChatSessionList>(
    PORT1 + `/customer/chat/sessions/getSessionByOrder`,
    { orderNumber },
    { loading: false }
  );
};

/**
 * 获取聊天会话列表 - 后台管理员查看所有会话
 * @param params 查询参数
 */
export const getChatSessions = (params?: any) => {
  return http.get<ResPageData<SosChart.ResChatSessionList>>(PORT1 + `/customer/chat/sessions/agent/list`, params);
};

/**
 * 获取用户的聊天会话列表
 * @param params 查询参数
 */
export const getUserChatSessions = (params: any) => {
  return http.get<ResPage<SosChart.ResChatSessionList>>(PORT1 + `/customer/chat/sessions/user/list`, params);
};

/**
 * 获取聊天历史消息
 * @param sessionId 会话ID
 * @param params 分页参数
 */
export const getChatHistory = (sessionId: string, params?: any) => {
  return http.get<ResPage<SosChart.ResChatMessageList>>(PORT1 + `/customer/chat/messages/history/${sessionId}`, params, {
    loading: false
  });
};

/**
 * 发送聊天消息
 * @param data 消息数据
 */
export const sendChatMessage = (data: SosChart.ReqSendMessage) => {
  return http.post<SosChart.ResChatMessageList>(PORT1 + `/customer/chat/messages/send`, data);
};

/**
 * 标记消息为已读
 * @param data 包含sessionId的请求数据
 */
export const markMessagesAsRead = (data: { sessionId: string; senderType: string }) => {
  return http.post<SosChart.ResChatMessageList>(PORT1 + `/customer/chat/messages/read`, data, { loading: false });
};

/**
 * 关闭聊天会话
 * @param sessionId 会话ID
 */
export const closeChatSession = (sessionId: string) => {
  return http.post<SosChart.ResChatMessageList>(PORT1 + `/customer/chat/sessions/close/${sessionId}`);
};

/**
 * 获取未读消息数量
 * @param userId 用户ID
 */
export const getUnreadMessageCount = (userId: string) => {
  return http.get<number>(PORT1 + `/customer/chat/messages/unread/count`, { userId });
};

/**
 * 获取所有未读消息数量的总和
 * @param params 请求参数
 */
export const getAllUnreadMessageCount = (userType: string) => {
  return http.get<number>(PORT1 + `/customer/chat/messages/unreadCount`, { userType }, { loading: false });
};
