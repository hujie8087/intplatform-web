// 消息内容类型枚举 - 匹配后端ContentType
export enum ContentType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  FILE = "FILE",
  CARD_WAIT = "CARD_WAIT"
}

// 消息类型枚举 - 匹配后端MessageType
export enum MessageType {
  NEW_MESSAGE = "NEW_MESSAGE", // 接收消息
  CHAT_MESSAGE = "CHAT_MESSAGE", // 发送消息
  AGENT_MESSAGE = "AGENT_MESSAGE",
  SYSTEM_MESSAGE = "SYSTEM_MESSAGE",
  HEARTBEAT = "HEARTBEAT"
}

// 用户类型枚举 - 匹配后端UserType
export enum UserType {
  USER = "USER",
  DRIVER = "DRIVER",
  AGENT = "AGENT"
}

// 发送者类型枚举 - 与UserType保持一致，用于消息发送者标识
export enum SenderType {
  USER = "USER",
  DRIVER = "DRIVER",
  AGENT = "AGENT"
}

// 会话状态枚举 - 匹配后端SessionStatus
export enum SessionStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED"
}

export namespace SosChart {
  export interface ResChatMessageList {
    id?: string;
    /** 消息ID */
    messageId?: string;
    /** 会话ID */
    sessionId: string;
    /** 消息类型 */
    type: MessageType;
    /** 发送者类型 */
    senderType: SenderType;
    /** 发送者ID */
    senderId: string;
    /** 发送者名称 */
    senderName: string;
    /** 发送者ID-备 */
    userId: string;
    /** 发送者昵称-备 */
    nickName: string;
    /** 发送者账号-备 */
    userName: string;
    /** 消息内容类型 */
    contentType: ContentType;
    /** 消息内容 */
    content: string;
    /** 发送时间 */
    timestamp: string;
    /** 是否已读 */
    isRead?: boolean;
    /** 消息状态 */
    status?: string;
    /** 用户类型，用户 USER / 客服 AGENT */
    userType: UserType;
    // 创建时间 创建人 更新时间 更新人
    createTime?: string;
    updateTime?: string;
    createBy?: string;
    updateBy?: string;
    avatar?: string;
    extra?: any;
    duration?: number;
  }

  export interface ResChatSessionList {
    /** 会话ID */
    sessionId: string;
    /** 用户ID */
    userId: string;
    /** 用户类型 USER/DRIVER */
    userType: UserType;
    /** 用户账号 */
    userName: string;
    /** 用户昵称 */
    nickName: string;
    /** 订单ID */
    orderId: string;
    /** 订单编号 */
    orderNumber: string;
    /** 会话状态 */
    status: SessionStatus;
    /** 创建人 */
    createBy?: string;
    /** 更新人 */
    updateBy?: string;
    /** 创建时间 */
    createTime: string;
    /** 更新时间 */
    updateTime: string;
    /** 未读消息数量 */
    unreadCount?: number;
    /** 最后一条消息 */
    lastMessage?: string;
    /** 最后消息时间 */
    lastMessageTime?: string;

    // 扩展字段用于UI显示
    messages?: ResChatMessageList[];
    customerAvatar?: string;
    orderInfo?: {
      orderNo: string;
      customerName: string;
      customerAvatar?: string;
      customerPhone?: string;
      startLocation?: string;
      endLocation?: string;
      orderTime?: string;
      orderStatus?: string;
    };
  }

  export interface ReqCreateSession {
    /** 用户ID */
    userId: string;
    /** 用户类型 USER/DRIVER */
    userType: UserType;
    /** 用户账号 */
    userName: string;
    /** 用户昵称 */
    nickName: string;
    /** 订单ID */
    orderId: string;
    /** 订单编号 */
    orderNumber: string;
    /** 发送者类型 */
    senderType: SenderType;
  }

  // 发送消息请求接口 - 匹配后端SendMessageRequest
  export interface ReqSendMessage {
    id?: string;
    /** 消息ID */
    messageId?: string;
    /** 会话ID */
    sessionId: string;
    /** 发送者类型 */
    senderType: SenderType;
    /** 发送者ID */
    senderId: string;
    /** 发送者昵称 */
    senderName: string;
    /** 发送者类型-备 */
    type: MessageType;
    /** 发送者ID-备 */
    userId: string;
    /** 发送者昵称-备 */
    nickName: string;
    /** 发送者账号-备 */
    userName: string;
    /** 消息内容类型 */
    contentType: ContentType;
    /** 消息内容 */
    content: string;
    /** 发送时间 */
    timestamp: string;
    /** 用户类型，用户 USER / 客服 AGENT */
    userType: UserType;
    targetUserId: string;
    targetUserType: UserType;
    orderId: string;
    // 状态
    status?: string;
  }

  // 文件上传响应接口
  export interface FileUploadResponse {
    url: string;
    fileName: string;
    fileSize: number;
  }

  // 延迟等待时间申请接口
  export interface TripWaitingExtension {
    /** 审核时间 */
    auditTime?: string;
    /** 审核人ID */
    auditUserName?: string;
    /** 创建人 */
    createBy?: string;
    /** 创建时间 */
    createTime?: string;
    /** 删除状态(0 正常 1 删除) */
    delFlag?: string;
    /** 申请延长的分钟数 */
    extendMin: number;
    /** 申请人姓名 */
    nickName?: string;
    /** 关联订单ID */
    orderId?: string;
    /** 订单编号 */
    orderNumber?: string;
    /** 拒绝原因 */
    rejectReason?: string;
    /** 备注 */
    remark?: string;
    /** 站点id */
    stationId?: string;
    /** 站点名称 */
    stationName?: string;
    /** 状态：0待审核，1通过，2拒绝 */
    status?: string;
    /** 关联行程ID */
    tripId?: string;
    /** 主键ID */
    tweId?: string;
    /** 更新人 */
    updateBy?: string;
    /** 更新时间 */
    updateTime?: string;
    /** 申请人id */
    userId?: string;
    /** 申请人工号 */
    userName?: string;
    [property: string]: any;
  }
}
