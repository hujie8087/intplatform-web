import { ref } from "vue";
import { ElMessage } from "element-plus";
import { useChatStore } from "@/stores/modules/chat";
import { ContentType } from "@/api/interface/sosAlart";
import { uploadByfName } from "@/api/modules/upload";

/**
 * 文件上传 Composable
 * 统一处理图片、视频、音频上传逻辑
 */
export function useFileUpload() {
  const uploading = ref(false);
  const uploadProgress = ref(0);
  const chatStore = useChatStore();

  /**
   * 上传文件到uploadFileGeneral接口
   */
  const uploadFileGeneral = async (
    file: File,
    filePathPrefix: string,
    fileType: "image" | "video" | "audio"
  ): Promise<{ url: string; name: string }> => {
    // 显示上传loading
    uploading.value = true;

    try {
      // 根据文件类型映射到ContentType枚举
      let contentTypeEnum: ContentType;
      switch (fileType) {
        case "image":
          contentTypeEnum = ContentType.IMAGE;
          break;
        case "video":
          contentTypeEnum = ContentType.VIDEO;
          break;
        case "audio":
          contentTypeEnum = ContentType.AUDIO;
          break;
        default:
          contentTypeEnum = ContentType.IMAGE;
      }

      const formData = new FormData();
      formData.append("files", file);
      formData.append("filePath", "");
      formData.append("fName", filePathPrefix);
      formData.append("contentType", contentTypeEnum);

      const response: any = await uploadByfName({ file: file, fName: filePathPrefix });

      if (response?.code === 200 && response?.data) {
        return {
          url: response.data[0].url,
          name: response.data[0].name
        };
      } else {
        throw new Error(response?.msg || "上传失败");
      }
    } finally {
      // 关闭loading
      uploading.value = false;
    }
  };

  /**
   * 上传文件的通用方法
   */
  const uploadFileCommon = async (file: File, fileType: "image" | "video" | "audio"): Promise<string> => {
    uploadProgress.value = 0;

    try {
      // 获取当前会话信息构建filePathPrefix
      const currentSession = chatStore.currentSession;
      if (!currentSession) {
        throw new Error("请先选择聊天会话");
      }

      // 构建filePathPrefix: chatMessage/{用户工号userName}/{订单编号}/image 或 video
      const userName = currentSession.userName || "unknown";
      const orderNumber = currentSession.orderNumber || currentSession.orderId || "unknown";
      const fileTypeFolder = fileType === "image" ? "image" : fileType === "video" ? "video" : "audio";
      const filePathPrefix = `chatMessage/${userName}/${orderNumber}/${fileTypeFolder}`;

      const result = await uploadFileGeneral(file, filePathPrefix, fileType);
      if (result && result.url) {
        ElMessage.success(`${fileType === "image" ? "图片" : fileType === "video" ? "视频" : "音频"}上传成功`);
        // 返回相对路径，发送消息时存储相对路径
        return result.url;
      } else {
        throw new Error("上传失败：未获取到文件URL");
      }
    } catch (error) {
      console.error(`${fileType}上传失败:`, error);
      ElMessage.error(`${fileType === "image" ? "图片" : fileType === "video" ? "视频" : "音频"}上传失败`);
      throw error;
    } finally {
      uploadProgress.value = 0;
    }
  };

  /**
   * 获取完整的资源URL（用于显示）
   */
  const getFullResourceUrl = (relativePath: string): string => {
    if (!relativePath) return "";
    if (relativePath.startsWith("http")) return relativePath;
    return import.meta.env.VITE_RESOURCE_API + relativePath;
  };

  /**
   * 选择并上传图片
   */
  const chooseAndUploadImage = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.style.display = "none";

      input.onchange = async event => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];

        if (!file) {
          reject(new Error("未选择文件"));
          return;
        }

        // 检查文件大小（限制为5MB）
        if (file.size > 5 * 1024 * 1024) {
          ElMessage.error("图片大小不能超过5MB");
          reject(new Error("文件过大"));
          return;
        }

        try {
          const url = await uploadFileCommon(file, "image");
          resolve(url);
        } catch (error) {
          reject(error);
        } finally {
          document.body.removeChild(input);
        }
      };

      document.body.appendChild(input);
      input.click();
    });
  };

  /**
   * 选择并上传视频
   */
  const chooseAndUploadVideo = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "video/*";
      input.style.display = "none";

      input.onchange = async event => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];

        if (!file) {
          reject(new Error("未选择文件"));
          return;
        }

        // 检查文件大小（限制为50MB）
        if (file.size > 50 * 1024 * 1024) {
          ElMessage.error("视频大小不能超过50MB");
          reject(new Error("文件过大"));
          return;
        }

        try {
          const url = await uploadFileCommon(file, "video");
          resolve(url);
        } catch (error) {
          reject(error);
        } finally {
          document.body.removeChild(input);
        }
      };

      document.body.appendChild(input);
      input.click();
    });
  };

  /**
   * 选择并上传音频
   */
  const chooseAndUploadAudio = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "audio/*";
      input.style.display = "none";

      input.onchange = async event => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];

        if (!file) {
          reject(new Error("未选择文件"));
          return;
        }

        // 检查文件大小（限制为10MB）
        if (file.size > 10 * 1024 * 1024) {
          ElMessage.error("音频大小不能超过10MB");
          reject(new Error("文件过大"));
          return;
        }

        try {
          const url = await uploadFileCommon(file, "audio");
          resolve(url);
        } catch (error) {
          reject(error);
        } finally {
          document.body.removeChild(input);
        }
      };

      document.body.appendChild(input);
      input.click();
    });
  };

  /**
   * 处理拖拽上传
   */
  const handleDragUpload = async (event: DragEvent, fileType: "image" | "video" | "audio"): Promise<string> => {
    event.preventDefault();

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) {
      throw new Error("未找到文件");
    }

    const file = files[0];

    // 检查文件类型
    if (!file.type.startsWith(fileType)) {
      ElMessage.error(`请选择${fileType === "image" ? "图片" : fileType === "video" ? "视频" : "音频"}文件`);
      throw new Error("文件类型不正确");
    }

    return await uploadFileCommon(file, fileType);
  };

  /**
   * 直接上传文件（已有文件）
   */
  const uploadExistingFile = async (file: File, fileType: "image" | "video" | "audio"): Promise<string> => {
    return uploadFileCommon(file, fileType);
  };

  /**
   * 录制并上传音频（web端暂不支持录音，提示用户选择文件）
   */
  const recordAndUploadAudio = (): Promise<{
    url: string;
    duration: number;
  }> => {
    return new Promise((resolve, reject) => {
      ElMessage.info("Web端暂不支持录音，请选择音频文件");
      chooseAndUploadAudio()
        .then(url => {
          resolve({ url, duration: 0 }); // web端无法获取音频时长
        })
        .catch(reject);
    });
  };

  return {
    uploading,
    uploadProgress,
    chooseAndUploadImage,
    chooseAndUploadVideo,
    chooseAndUploadAudio,
    recordAndUploadAudio,
    uploadExistingFile,
    handleDragUpload,
    getFullResourceUrl
  };
}
