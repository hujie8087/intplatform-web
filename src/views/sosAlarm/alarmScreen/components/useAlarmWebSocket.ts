import { onMounted, onUnmounted, ref } from "vue";
import NativeWebSocketService from "@/utils/websocketService";
import { useUserStore } from "@/stores/modules/user";

interface AlarmData {
  id: number;
  level: number;
  reportDescription: string;
  reportBy: string;
  reportLocation: string;
  reportTime: string;
  tel: string;
  latitude?: number;
  longitude?: number;
  orderNumber?: string;
  orderNo?: string;
  orderId?: string | number;
}

export function useAlarmWebSocket() {
  const alarmWebSocketService = new NativeWebSocketService();
  const userStore = useUserStore();
  const alarmReports = ref<AlarmData[]>([]);

  // 处理WebSocket消息
  const handleWebSocketMessage = (message: any) => {
    console.log("AlarmWebSocket收到消息:", message);

    if (message.type === "unprocessed_reports" && message.data) {
      console.log("接收到未处理的报警数据:", message.data);
      alarmReports.value = message.data;
      console.log("更新后的报警数据:", alarmReports.value);
    } else {
      console.log("消息类型不匹配或数据为空:", message.type, message.data);
    }
  };

  // 初始化WebSocket连接
  const initWebSocket = () => {
    console.log("开始初始化AlarmWebSocket，用户信息:", userStore);

    if (userStore.userInfo.user.userId) {
      const userId = userStore.userInfo.user.userId.toString();
      // 使用固定的WebSocket地址
      const wsUrl = `ws://192.168.91.50:10302/websocket/customer-service/${userId}`;

      console.log("准备连接WebSocket，URL:", wsUrl);

      // 先断开现有连接（如果有）
      alarmWebSocketService.disconnect();

      // 注册消息处理器并建立连接
      alarmWebSocketService.onMessage(handleWebSocketMessage);
      // 通过第二个参数传递自定义URL
      alarmWebSocketService.connect(userId, wsUrl);

      console.log("WebSocket连接请求已发送");
    } else {
      console.warn("用户未登录，无法初始化WebSocket连接，当前用户ID:", userStore.userInfo.user.userId);
    }
  };

  // 断开WebSocket连接
  const disconnectWebSocket = () => {
    console.log("断开AlarmWebSocket连接");
    alarmWebSocketService.offMessage(handleWebSocketMessage);
    alarmWebSocketService.disconnect();
  };

  onMounted(() => {
    console.log("挂载AlarmWebSocket hook");
    initWebSocket();
  });

  onUnmounted(() => {
    console.log("卸载AlarmWebSocket hook");
    disconnectWebSocket();
  });

  return {
    alarmReports,
    initWebSocket,
    disconnectWebSocket
  };
}
