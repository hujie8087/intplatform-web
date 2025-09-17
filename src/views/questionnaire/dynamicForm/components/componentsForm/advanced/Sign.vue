<template>
  <div class="sign">
    <el-button :disabled="isDev" color="#1677ff" size="default" @click="signVisible = true" type="primary"
      >手写电子签名</el-button
    >
    <el-image
      v-if="props.dataValue"
      :src="getImgUrl"
      fit="cover"
      style="width: 100%; margin-top: 5px; border: 1px dashed #dcdfe6"
    />
    <el-dialog :top="editorScrollInfo.scrollTop + 120 + 'px'" v-if="signVisible" title="签名" v-model="signVisible" width="98%">
      <div class="sign_box" ref="signRef" :id="currId" :tabindex="!props.isPreviewRender ? 0 : -1">
        <canvas style="display: block; border: 1px dashed #dcdfe6" />
        <div class="control-btns">
          <el-radio-group v-model="radio1">
            <el-radio-button
              :key="index"
              v-for="(item, index) in contList"
              :label="item.name"
              size="default"
              @click="control(item.type)"
              >{{ item.name }}</el-radio-button
            >
          </el-radio-group>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleSubmit('cancel')">取消</el-button>
          <el-button type="primary" @click="handleSubmit('ok')"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import SmoothSignature from "smooth-signature";
import { ElMessage } from "element-plus";
import { uploadImg } from "@/api/modules/upload";
import { isArray } from "lodash";
import type { UploadRequestOptions } from "element-plus";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
const compStore = useSelectCompStore();
const filePath = import.meta.env.VITE_APP_BASE_FILE;
const signRef = ref(null);
const radio1 = ref(null);
const isUploaded = ref<boolean>(false);
interface Props {
  id: string;
  isPreviewRender?: boolean;
  previewType?: string;
  dataValue: string;
  editorScrollInfo: any;
  isDev: boolean;
}
const props = defineProps<Props>();
const currId = ref(props.isPreviewRender ? `preview_${props.id}` : `${props.id}`);
const signature: any = ref(null);
const localDataValue = ref(null);
const signVisible = ref(false);
const getImgUrl = computed(() => {
  return filePath + props.dataValue;
});
const contList = [
  {
    name: "清空",
    type: "clear"
  },
  {
    name: "撤销",
    type: "undo"
  },
  {
    name: "重做",
    type: "redo"
  }
];
const control = (type: "clear" | "undo" | "redo" | string) => {
  if (!signature.value) return;
  switch (type) {
    case "clear":
      signature.value.clear();
      localDataValue.value = null; // 清空本地 URL
      isUploaded.value = false;
      break;
    case "redo":
      signature.value.redo();
      isUploaded.value = false;
      break;
    case "undo":
      signature.value.undo();
      isUploaded.value = false;
      break;
  }
};
const initData = () => {
  const signDOM = document.getElementById(currId.value);
  const canvas: HTMLCanvasElement | null | undefined = signDOM?.querySelector("canvas");
  if (!canvas) {
    return;
  }
  signature.value = new SmoothSignature(canvas, {
    scale: 2,
    minWidth: 4,
    maxWidth: 10,
    color: "#333",
    bgColor: "#f6f8fa"
  });
};

const handleSubmit = (state: string) => {
  const isOk = state === "ok";
  if (isOk) {
    uploadSignatureToServer();
    signVisible.value = false;
  } else {
    signVisible.value = false;
  }
};

// ------------------------------
// 新增：核心方法 - 处理签名图片获取
// ------------------------------
/**
 * 判断签名是否为空（避免获取空白画布）
 * @returns boolean 签名是否为空
 */
const isSignatureEmpty = (): boolean => {
  if (!signature.value) return true;
  const canvas = signature.value.canvas; // 获取实例内部的 canvas
  const ctx = canvas.getContext("2d");
  if (!ctx) return true;
  // 方法1：通过画布像素判断（精准，推荐）
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    const a = imageData.data[i + 3];
    // 若存在非背景色的像素（背景色为 #f6f8fa → rgb(246,248,250)），则签名非空
    if (!(r === 246 && g === 248 && b === 250 && a === 255)) {
      return false;
    }
  }
  return true;
};

// 获取签名 File 对象（转换为 UploadRequestOptions 兼容格式）
const getSignatureFile = async (): Promise<File | null> => {
  if (isSignatureEmpty()) {
    ElMessage.warning("请先完成电子签名");
    return null;
  }
  const canvas = signature.value.canvas;
  const base64 = canvas.toDataURL("image/png", 1.0); // 获取 PNG 格式 Base64（质量1.0）
  // 将 Base64 转为 Blob
  const response = await fetch(base64);
  const blob = await response.blob();
  // 将 Blob 转为 File 对象（文件名格式：signature_时间戳.png）
  return new File([blob], `signature_${Date.now()}.png`, {
    type: "image/png"
  });
};

const handleHttpUpload = async (options: UploadRequestOptions) => {
  let formData = new FormData();
  formData.append("files", options.file); // 与接口参数名保持一致
  try {
    const { data } = await uploadImg(formData); // 调用你的上传接口
    // 通知上传成功（更新组件状态）
    options.onSuccess(data, options.file);
    // 更新文件列表中的 URL（从接口响应获取）
    localDataValue.value = isArray(data) ? data[0].url : data.url;
    isUploaded.value = true;
    console.log(localDataValue.value);
    ElMessage.success("签名上传成功");
  } catch (error) {
    options.onError(error as any);
    isUploaded.value = false;
    ElMessage.error("签名上传失败，请重试");
  }
};

// 上传图片
const uploadSignatureToServer = async () => {
  // 1. 获取签名 File 对象
  const signatureFile = await getSignatureFile();
  if (!signatureFile) return;
  // 2. 构造 UploadRequestOptions 参数（模拟 el-upload 的上传参数）
  const uploadOptions: UploadRequestOptions = {
    file: signatureFile, // 签名转换后的 File 对象
    filename: "files", // 与接口参数名一致（即 formData.append 的 key）
    action: "", // 原逻辑用自定义 http-request，此参数可空
    headers: {}, // 如需自定义请求头，可在此添加（如 token）
    data: {}, // 如需额外参数，可在此添加（如业务ID）
    withCredentials: false,
    // 上传成功回调（与原逻辑一致）
    onSuccess: response => {
      // 将签名添加到文件列表（可选，便于后续管理）
      localDataValue.value = isArray(response) ? response[0].url : response.url;
    },
    // 上传失败回调
    onError: error => {
      ElMessage.error(`上传失败：${error.message || "未知错误"}`);
    }
  };
  // 3. 调用原有上传方法，完成签名上传
  await handleHttpUpload(uploadOptions);
};

onMounted(() => {
  // 初始时不立即初始化，因为对话框可能未显示
  watch(
    () => signVisible.value,
    newVal => {
      if (newVal) {
        // 对话框显示时再初始化签名组件
        setTimeout(initData, 0); // 加个延迟确保DOM已渲染
      }
    },
    { immediate: false }
  );
});

watch([props.previewType], () => {
  initData();
  compStore.updateCurrentComp({
    dataValue: localDataValue.value
  });
});

// 监听本地fileList变化，同步到父组件
watch(
  () => localDataValue.value,
  newValue => {
    compStore.updateCurrentComp({
      dataValue: newValue
    });
  },
  { deep: true }
);
</script>
<style lang="scss" scoped>
.sign {
  width: 100%;
}
.control-btns {
  width: 100%;
  margin: 10px;
  text-align: center;
}
.sign_box {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
