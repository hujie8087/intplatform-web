import { onMounted, onUnmounted, ref } from "vue";
import NativeWebSocketService from "@/utils/websocketService";
import { useUserStore } from "@/stores/modules/user";

interface AlarmData {
  createBy: string;
  delFlag: string;
  deviceType: string;
  id: number;
  latitude: number;
  level: number;
  longitude: number;
  orderNo: string;
  params: any;
  processingBy: string;
  processingResult: string;
  reportBy: string;
  reportDescription: string;
  reportLocation: string;
  reportTime: string;
  systemSource: number;
  tel: string;
}

export function useAlarmWebSocket() {
  const alarmWebSocketService = new NativeWebSocketService();
  const userStore = useUserStore();
  const alarmReports = ref<AlarmData[]>([]);

  // 处理WebSocket消息
  const handleWebSocketMessage = (message: any) => {
    console.log("AlarmWebSocket收到消息:", message);

    if (message.type === "unprocessed_reports" && message.data) {
      alarmReports.value = message.data;
      // 播放报警声音
      playAlarmSound();
    } else {
      console.log("消息类型不匹配或数据为空:", message.type, message.data);
    }
  };

  const playAlarmSound = () => {
    const audio = new Audio("/src/assets/sounds/alarmVoice.wav");
    audio.play();
  };

  // 初始化WebSocket连接
  const initWebSocket = () => {
    console.log("开始初始化AlarmWebSocket，用户信息:", userStore);

    if (userStore.thirdUserInfo.account) {
      const userId = userStore.thirdUserInfo.account;
      // 使用固定的WebSocket地址
      const wsUrl = `${import.meta.env.VITE_ALARM_WS_URL}${userId}`;

      console.log("准备连接WebSocket，URL:", wsUrl);

      // 先断开现有连接（如果有）
      alarmWebSocketService.disconnect();

      // 注册消息处理器并建立连接
      alarmWebSocketService.onMessage(handleWebSocketMessage);
      // 通过第二个参数传递自定义URL
      alarmWebSocketService.connect(userId, wsUrl);

      console.log("WebSocket连接请求已发送");
    } else {
      console.warn("用户未登录，无法初始化WebSocket连接，当前用户ID:", userStore.thirdUserInfo.account);
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
