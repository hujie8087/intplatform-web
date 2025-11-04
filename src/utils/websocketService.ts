import { ref } from "vue";
import { dayjs, ElMessage } from "element-plus";
import { emitter } from "./mitt";

/**
 * 原生WebSocket服务类
 * 用于管理WebSocket连接和消息处理
 */
class NativeWebSocketService {
  private socket: WebSocket | null = null;
  public isConnected = ref(false);
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000; // 3秒重连间隔
  private longWaitTimer: NodeJS.Timeout | null = null;
  private longWaitInterval = 180000; // 3分钟等待间隔
  private shortTermReconnects = 0;
  private maxShortTermReconnects = 3; // 短时间内最多重连3次
  private shortTermWindow = 60000; // 1分钟时间窗口
  private shortTermResetTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private heartbeatInterval = 30000; // 30秒心跳间隔

  // 消息回调函数
  private messageCallbacks: ((message: any) => void)[] = [];

  // 当前连接参数
  private currentUserId: string = "";
  private currentSessionId: string = "";
  private currentUserType: string = "AGENT";

  /**
   * 初始化WebSocket连接
   */
  async connect(userId: string = "1", customWsUrl?: string): Promise<boolean> {
    // 如果已经连接，先断开
    if (this.isConnected.value && this.socket) {
      console.log("WebSocket已连接，先断开现有连接");
      this.disconnect();
    }

    try {
      console.log("初始化WebSocket连接，用户ID:", userId, "自定义URL:", customWsUrl);

      // 保存连接参数
      this.currentUserId = userId;
      this.currentSessionId = "global";
      this.currentUserType = "AGENT"; // web端默认为客服

      // 使用提供的自定义URL，如果不提供则使用环境变量配置的URL
      let wsUrl: string;
      if (customWsUrl) {
        wsUrl = customWsUrl;
      } else {
        const baseUrl = import.meta.env.VITE_WEB_SOCKET_URL || "ws://localhost:8080/websocket/";
        wsUrl = `${baseUrl}${userId}`;
      }

      console.log("最终使用的WebSocket URL:", wsUrl);

      // 创建原生WebSocket连接
      this.socket = new WebSocket(wsUrl);

      return new Promise(resolve => {
        if (!this.socket) {
          console.error("WebSocket创建失败");
          resolve(false);
          return;
        }

        // 连接成功
        this.socket.onopen = event => {
          console.log("WebSocket连接成功:", event);
          this.isConnected.value = true;
          this.reconnectAttempts = 0;

          // 开始心跳
          this.startHeartbeat();

          // 发送认证信息
          this.sendAuthMessage();

          // 发送连接成功事件
          emitter.emit("websocketConnected");

          // ElMessage.success('客服系统连接成功');
          resolve(true);
        };

        // 接收消息
        this.socket.onmessage = event => {
          console.log("WebSocket接收到原始数据:", event.data);
          this.handleMessage(event.data);
        };

        // 连接关闭
        this.socket.onclose = event => {
          console.log("WebSocket连接关闭:", event);
          this.isConnected.value = false;
          this.stopHeartbeat();

          // 发送连接断开事件
          emitter.emit("websocketDisconnected");

          // 如果不是主动关闭，尝试重连
          if (event.code !== 1000) {
            this.scheduleReconnect();
          }
        };

        // 连接错误
        this.socket.onerror = error => {
          console.error("WebSocket连接失败:", error);
          this.isConnected.value = false;
          this.stopHeartbeat();

          // 发送连接断开事件
          emitter.emit("websocketDisconnected");

          ElMessage.error("WebSocket连接失败");
          this.scheduleReconnect();
          resolve(false);
        };
      });
    } catch (error) {
      console.error("WebSocket连接异常:", error);
      this.isConnected.value = false;
      ElMessage.error("连接异常");
      return false;
    }
  }

  /**
   * 发送认证信息
   */
  private sendAuthMessage(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    const authMessage = {
      type: "AUTH",
      userId: this.currentUserId,
      sessionId: this.currentSessionId,
      userType: this.currentUserType,
      timestamp: new Date().toISOString()
    };

    this.socket.send(JSON.stringify(authMessage));
    console.log("发送认证信息:", authMessage);
  }

  /**
   * 开始心跳-防止自动关闭
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.sendHeartbeat();
      }
    }, this.heartbeatInterval);
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * 发送心跳消息
   */
  private sendHeartbeat(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    const heartbeatMessage = {
      type: "HEARTBEAT",
      timestamp: new Date().toISOString()
    };

    this.socket.send(JSON.stringify(heartbeatMessage));
    console.log("发送心跳:", heartbeatMessage);
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      console.log("收到WebSocket消息:", message);
      console.log("当前注册的消息回调数量:", this.messageCallbacks.length);

      // 忽略心跳响应
      if (message.type === "HEARTBEAT") {
        return;
      }

      // 通知所有注册的回调函数
      this.messageCallbacks.forEach((callback, index) => {
        try {
          console.log(`调用第${index + 1}个回调函数`);
          callback(message);
        } catch (error) {
          console.error("消息回调执行失败:", error);
        }
      });
    } catch (error) {
      console.error("解析WebSocket消息失败:", error);
    }
  }

  /**
   * 发送消息
   */
  sendMessage(message: any, targetUserId?: string): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error("WebSocket未连接，无法发送消息");
      ElMessage.error("连接已断开，无法发送消息");
      return false;
    }

    try {
      const messageData = Object.assign({}, message, {
        targetUserId: targetUserId || message.targetUserId,
        timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss")
      });

      this.socket.send(JSON.stringify(messageData));
      // console.log('发送消息成功:', messageData);
      return true;
    } catch (error) {
      console.error("发送消息失败:", error);
      ElMessage.error("消息发送失败");
      return false;
    }
  }

  /**
   * 注册消息回调
   */
  onMessage(callback: (message: any) => void): void {
    this.messageCallbacks.push(callback);
    console.log("注册消息回调，当前回调数量:", this.messageCallbacks.length);
  }

  /**
   * 移除消息回调
   */
  offMessage(callback: (message: any) => void): void {
    const index = this.messageCallbacks.indexOf(callback);
    if (index > -1) {
      this.messageCallbacks.splice(index, 1);
      console.log("移除消息回调，当前回调数量:", this.messageCallbacks.length);
    } else {
      console.log("未找到要移除的回调函数");
    }
  }

  /**
   * 安排重连
   */
  private scheduleReconnect(): void {
    // 增加短时间重连计数
    this.shortTermReconnects++;

    // 如果短时间内重连次数过多，等待3分钟
    if (this.shortTermReconnects > this.maxShortTermReconnects) {
      console.warn(`短时间内重连次数过多(${this.shortTermReconnects}次)，等待3分钟后重试`);
      ElMessage.warning("连接频繁断开，3分钟后自动重试");

      this.longWaitTimer = setTimeout(() => {
        console.log("3分钟等待结束，重置重连计数并尝试重连");
        this.shortTermReconnects = 0;
        this.reconnectAttempts = 0;
        this.connect(this.currentUserId);
      }, this.longWaitInterval);
      return;
    }

    // 正常重连逻辑
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("达到最大重连次数，停止重连");
      ElMessage.error("连接失败，请刷新页面重试");
      return;
    }

    this.reconnectAttempts++;
    console.log(`安排第${this.reconnectAttempts}次重连，${this.reconnectInterval}ms后执行`);

    this.reconnectTimer = setTimeout(() => {
      console.log(`执行第${this.reconnectAttempts}次重连`);
      this.connect(this.currentUserId);
    }, this.reconnectInterval);

    // 设置短时间重连计数重置定时器
    if (this.shortTermResetTimer) {
      clearTimeout(this.shortTermResetTimer);
    }
    this.shortTermResetTimer = setTimeout(() => {
      console.log("重置短时间重连计数");
      this.shortTermReconnects = 0;
    }, this.shortTermWindow);
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    console.log("断开WebSocket连接");

    // 清除所有定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.longWaitTimer) {
      clearTimeout(this.longWaitTimer);
      this.longWaitTimer = null;
    }

    if (this.shortTermResetTimer) {
      clearTimeout(this.shortTermResetTimer);
      this.shortTermResetTimer = null;
    }

    // // 停止心跳
    // this.stopHeartbeat();

    // 关闭WebSocket连接
    if (this.socket) {
      try {
        this.socket.close(1000, "主动断开连接");
      } catch (error) {
        console.error("关闭WebSocket连接失败:", error);
      }
      this.socket = null;
    }

    this.isConnected.value = false;
    this.reconnectAttempts = 0;

    // 发送连接断开事件
    emitter.emit("websocketDisconnected");
  }

  /**
   * 获取连接状态
   */
  getConnectionStatus(): boolean {
    return this.isConnected.value;
  }

  /**
   * 获取连接状态的响应式引用
   */
  getConnectionStatusRef() {
    return this.isConnected;
  }
}

// 创建全局实例
export const webSocketService = new NativeWebSocketService();

// 导出类型
export default NativeWebSocketService;
