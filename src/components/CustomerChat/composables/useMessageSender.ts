import { ref } from "vue";
import { ElMessage } from "element-plus";
import { useMessageBuilder } from "./useMessageBuilder";
import { useFileUpload } from "./useFileUpload";
import { useChatStore } from "@/stores/modules/chat";
import { ContentType, SosChart } from "@/api/interface/sosAlart";

/**
 * 消息发送器 Composable
 * 统一处理各种类型消息的发送逻辑
 */
export function useMessageSender() {
  const { createTextMessage, createImageMessage, createVideoMessage, createAudioMessage, createWaitCardMessage } =
    useMessageBuilder();

  const { chooseAndUploadImage, chooseAndUploadVideo, chooseAndUploadAudio, uploading } = useFileUpload();

  const chatStore = useChatStore();
  const sending = ref(false);

  /**
   * 发送文本消息
   */
  const sendTextMessage = async (content: string): Promise<SosChart.ResChatMessageList> => {
    if (!content.trim()) {
      throw new Error("消息内容不能为空");
    }

    if (!chatStore.currentSession) {
      throw new Error("请先初始化聊天会话");
    }

    sending.value = true;

    try {
      // 创建本地消息对象
      const message = createTextMessage(chatStore.currentSession.sessionId, content);

      // 发送到服务器
      await chatStore.sendMessage(content, ContentType.TEXT);

      return message;
    } catch (error) {
      console.error("发送文本消息失败:", error);
      ElMessage.error("消息发送失败");
      throw error;
    } finally {
      sending.value = false;
    }
  };

  /**
   * 发送图片消息
   */
  const sendImageMessage = async (imageUrl?: string): Promise<SosChart.ResChatMessageList> => {
    if (!chatStore.currentSession) {
      throw new Error("请先初始化聊天会话");
    }

    sending.value = true;

    try {
      let finalImageUrl = imageUrl;

      // 如果没有提供图片URL，则选择并上传图片
      if (!finalImageUrl) {
        finalImageUrl = await chooseAndUploadImage();
      }

      // 创建本地消息对象
      const message = createImageMessage(chatStore.currentSession.sessionId, finalImageUrl);

      // 发送到服务器
      await chatStore.sendMessage(finalImageUrl, ContentType.IMAGE);

      return message;
    } catch (error) {
      console.error("发送图片消息失败:", error);
      ElMessage.error("图片发送失败");
      throw error;
    } finally {
      sending.value = false;
    }
  };

  /**
   * 发送视频消息
   */
  const sendVideoMessage = async (videoUrl?: string): Promise<SosChart.ResChatMessageList> => {
    if (!chatStore.currentSession) {
      throw new Error("请先初始化聊天会话");
    }

    sending.value = true;

    try {
      let finalVideoUrl = videoUrl;

      // 如果没有提供视频URL，则选择并上传视频
      if (!finalVideoUrl) {
        finalVideoUrl = await chooseAndUploadVideo();
      }

      // 创建本地消息对象
      const message = createVideoMessage(chatStore.currentSession.sessionId, finalVideoUrl);

      // 发送到服务器
      await chatStore.sendMessage(finalVideoUrl, ContentType.VIDEO);

      return message;
    } catch (error) {
      console.error("发送视频消息失败:", error);
      ElMessage.error("视频发送失败");
      throw error;
    } finally {
      sending.value = false;
    }
  };

  /**
   * 发送音频消息
   */
  const sendAudioMessage = async (audioUrl?: string, duration?: number): Promise<SosChart.ResChatMessageList> => {
    if (!chatStore.currentSession) {
      throw new Error("请先初始化聊天会话");
    }

    sending.value = true;

    try {
      let finalAudioUrl = audioUrl;

      // 如果没有提供音频URL，则选择并上传音频
      if (!finalAudioUrl) {
        finalAudioUrl = await chooseAndUploadAudio();
      }

      // 创建本地消息对象
      const message = createAudioMessage(chatStore.currentSession.sessionId, finalAudioUrl, duration);

      // 发送到服务器
      await chatStore.sendMessage(finalAudioUrl, ContentType.AUDIO);

      return message;
    } catch (error) {
      console.error("发送音频消息失败:", error);
      ElMessage.error("音频发送失败");
      throw error;
    } finally {
      sending.value = false;
    }
  };

  /**
   * 发送延迟等待卡片消息
   */
  const sendWaitCardMessage = async (waitData: SosChart.TripWaitingExtension): Promise<SosChart.ResChatMessageList> => {
    if (!chatStore.currentSession) {
      throw new Error("请先初始化聊天会话");
    }

    sending.value = true;

    try {
      const content = JSON.stringify(waitData);

      // 创建本地消息对象
      const message = createWaitCardMessage(chatStore.currentSession.sessionId, waitData);

      // 发送到服务器
      await chatStore.sendMessage(content, ContentType.CARD_WAIT);

      return message;
    } catch (error) {
      console.error("发送延迟等待消息失败:", error);
      ElMessage.error("延迟申请发送失败");
      throw error;
    } finally {
      sending.value = false;
    }
  };

  /**
   * 批量发送消息
   */
  const sendMessages = async (
    messages: Array<{
      type: "text" | "image" | "video" | "audio" | "wait_card";
      content: any;
    }>
  ): Promise<SosChart.ResChatMessageList[]> => {
    const results: SosChart.ResChatMessageList[] = [];

    for (const msg of messages) {
      try {
        let result: SosChart.ResChatMessageList;

        switch (msg.type) {
          case "text":
            result = await sendTextMessage(msg.content);
            break;
          case "image":
            result = await sendImageMessage(msg.content);
            break;
          case "video":
            result = await sendVideoMessage(msg.content);
            break;
          case "audio":
            result = await sendAudioMessage(msg.content.url, msg.content.duration);
            break;
          case "wait_card":
            result = await sendWaitCardMessage(msg.content);
            break;
          default:
            throw new Error(`不支持的消息类型: ${msg.type}`);
        }

        results.push(result);
      } catch (error) {
        console.error(`发送${msg.type}消息失败:`, error);
        // 继续发送其他消息
      }
    }

    return results;
  };

  return {
    sending,
    uploading,
    sendTextMessage,
    sendImageMessage,
    sendVideoMessage,
    sendAudioMessage,
    sendWaitCardMessage,
    sendMessages
  };
}
