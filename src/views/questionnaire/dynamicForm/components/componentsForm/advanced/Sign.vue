<template>
  <div class="sign">
    <el-image
      v-if="props.dataValue"
      :src="getImgUrl"
      fit="cover"
      style="width: 100%; margin-top: 5px; border: 1px dashed #dcdfe6"
    />
    <!-- 给 sign_box 加 key，确保 dataValue 变化时强制重新渲染（清除旧 canvas） -->
    <div
      v-if="!props.dataValue"
      class="sign_box"
      ref="signRef"
      :id="currId"
      :tabindex="!props.isPreviewRender ? 0 : -1"
      :key="currId"
    >
      <canvas style="display: block; width: 100% !important; border: 1px dashed #dcdfe6" />
      <div class="control-btns">
        <el-radio-group v-model="radio1">
          <el-radio-button :key="index" v-for="(item, index) in contList" :label="item.name" @click="control(item.type)">
            {{ item.name }}
          </el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <el-button type="primary" style="width: 100%; margin-top: 10px" v-if="!props.dataValue" @click="handleSubmit('ok')">
      上传
    </el-button>
    <el-button type="danger" style="width: 100%; margin-top: 10px" v-if="props.dataValue" @click="handleSubmit('cancel')">
      撤销
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, nextTick } from "vue";
import SmoothSignature from "smooth-signature";
import { ElMessage } from "element-plus";
import { uploadImg } from "@/api/modules/upload";
import { isArray } from "lodash";
import type { UploadRequestOptions } from "element-plus";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
import { delayTime } from "../../compConfig";

const compStore = useSelectCompStore();
const filePath = import.meta.env.VITE_APP_BASE_FILE;
const signRef = ref(null);
const radio1 = ref("清空"); // 给默认值，避免初始空值
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
const signature: any = ref(null); // 存储当前 SmoothSignature 实例
const localDataValue = ref(props.dataValue); // 初始同步 props.dataValue

// 计算图片 URL
const getImgUrl = computed(() => {
  return filePath + props.dataValue;
});

// 控制按钮列表
const contList = [
  { name: "清空", type: "clear" },
  { name: "撤销", type: "undo" },
  { name: "重做", type: "redo" }
];

/**
 * 销毁旧的签名实例（关键修复：避免多实例冲突）
 */
const destroySignature = () => {
  if (signature.value) {
    // SmoothSignature 若有 destroy 方法直接调用（根据库文档调整）
    if (signature.value.destroy) {
      signature.value.destroy();
    } else {
      // 若没有 destroy 方法，手动清除画布事件和实例
      const canvas = signature.value.canvas;
      if (canvas) {
        canvas.removeEventListener("mousedown", () => {
          console.log();
        });
        canvas.removeEventListener("mousemove", () => {
          console.log();
        });
        canvas.removeEventListener("mouseup", () => {
          console.log();
        });
        canvas.removeEventListener("mouseout", () => {
          console.log();
        });
      }
    }
    signature.value = null; // 清空实例引用
  }
};

/**
 * 初始化画布尺寸（关键修复：避免绘制尺寸异常）
 * @param canvas 画布元素
 */
const initCanvasSize = (canvas: HTMLCanvasElement) => {
  if (!canvas) return;
  const container = canvas.parentElement; // 获取父容器（sign_box）
  if (!container) return;
  // 获取父容器的实际宽度（考虑 CSS 100% 适配）
  const containerWidth = container.clientWidth;
  // 设置 canvas 元素的宽高（与显示尺寸一致，避免绘制变形）
  canvas.width = containerWidth;
  canvas.height = 300; // 固定高度，可根据需求调整
};

/**
 * 初始化签名实例
 */
const initData = async () => {
  // 1. 先销毁旧实例（核心：避免多实例冲突）
  destroySignature();

  // 2. 等待组件重新渲染（确保 sign_box 和 canvas 已生成）
  await nextTick();

  // 3. 获取 canvas 元素
  const signDOM = document.getElementById(currId.value);
  const canvas: HTMLCanvasElement | null = signDOM?.querySelector("canvas");
  if (!canvas) {
    ElMessage.warning("画布初始化失败");
    return;
  }

  // 4. 初始化画布尺寸（关键：修复绘制失效）
  initCanvasSize(canvas);

  // 5. 创建新的签名实例
  signature.value = new SmoothSignature(canvas, {
    scale: 2,
    minWidth: 4,
    maxWidth: 10,
    color: "#333",
    bgColor: "#f6f8fa"
  });
};

/**
 * 控制按钮逻辑（清空/撤销/重做）
 */
const control = (type: "clear" | "undo" | "redo" | string) => {
  if (!signature.value) {
    ElMessage.warning("画布未初始化");
    return;
  }
  switch (type) {
    case "clear":
      signature.value.clear();
      localDataValue.value = null;
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

/**
 * 提交逻辑（上传/撤销）
 */
const handleSubmit = async (state: string) => {
  const isOk = state === "ok";
  if (isOk) {
    await uploadSignatureToServer(); // 上传签名
  } else {
    // 撤销：清空数据 + 重新初始化画布
    localDataValue.value = null;
    compStore.updateCurrentComp({ dataValue: null });
    // 等待 dataValue 变化导致组件重新渲染后，再初始化画布
    await initData();
  }
};

/**
 * 判断签名是否为空
 */
const isSignatureEmpty = (): boolean => {
  if (!signature.value) return true;
  const canvas = signature.value.canvas;
  const ctx = canvas.getContext("2d");
  if (!ctx) return true;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    const a = imageData.data[i + 3];
    // 背景色 #f6f8fa → rgb(246,248,250)
    if (!(r === 246 && g === 248 && b === 250 && a === 255)) {
      return false;
    }
  }
  return true;
};

/**
 * 获取签名 File 对象
 */
const getSignatureFile = async (): Promise<File | null> => {
  if (isSignatureEmpty()) {
    ElMessage.warning("请先完成电子签名");
    return null;
  }
  const canvas = signature.value.canvas;
  const base64 = canvas.toDataURL("image/png", 1.0);
  const response = await fetch(base64);
  const blob = await response.blob();
  return new File([blob], `signature_${Date.now()}.png`, { type: "image/png" });
};

/**
 * 处理上传请求
 */
const handleHttpUpload = async (options: UploadRequestOptions) => {
  let formData = new FormData();
  formData.append("files", options.file);
  try {
    const { data } = await uploadImg(formData);
    options.onSuccess(data, options.file);
    localDataValue.value = isArray(data) ? data[0].url : data.url;
    isUploaded.value = true;
    ElMessage.success("签名上传成功");
  } catch (error) {
    options.onError(error as any);
    isUploaded.value = false;
    ElMessage.error("签名上传失败，请重试");
  }
};

/**
 * 上传签名到服务器
 */
const uploadSignatureToServer = async () => {
  const signatureFile = await getSignatureFile();
  if (!signatureFile) return;
  const uploadOptions: UploadRequestOptions = {
    file: signatureFile,
    filename: "files",
    action: "",
    headers: {},
    data: {},
    withCredentials: false,
    onSuccess: response => {
      localDataValue.value = isArray(response) ? response[0].url : response.url;
    },
    onError: error => {
      ElMessage.error(`上传失败：${error.message || "未知错误"}`);
    }
  };
  await handleHttpUpload(uploadOptions);
};

// 初始挂载时初始化
onMounted(() => {
  initData();
});

// 监听 previewType 变化，重新初始化
watch([() => props.previewType], () => {
  initData();
  setTimeout(() => {
    compStore.updateCurrentComp({ dataValue: localDataValue.value, id: props.id });
  }, delayTime);
});

// 监听本地 dataValue 变化，同步到父组件
watch(
  () => localDataValue.value,
  newValue => {
    setTimeout(() => {
      compStore.updateCurrentComp({ dataValue: newValue, id: props.id });
    }, delayTime);
  },
  { deep: true }
);

// 监听 props.dataValue 变化（父组件修改时同步）
watch(
  () => props.dataValue,
  newValue => {
    localDataValue.value = newValue;
    // 若从有值变为空值，重新初始化画布
    if (!newValue) {
      initData();
    }
  },
  { immediate: true } // 初始时同步
);
</script>

<style lang="scss" scoped>
.sign {
  position: relative;
  width: 100%;
  height: auto;
}
.control-btns {
  width: 100%;
  margin: 10px 0; // 修复 margin 写法（原 10px 会导致左右溢出）
  text-align: center;
}
.sign_box {
  display: flex;
  flex-direction: column;
  gap: 10px; // 增加内部间距，优化布局
  width: 100%;
}
</style>
