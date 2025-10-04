<template>
  <el-upload
    v-model:file-list="dataValue"
    class="upload-demo"
    action="#"
    multiple
    :http-request="handleHttpUpload"
    :on-preview="handlePreview"
    :on-remove="handleRemove"
    :before-upload="beforeUpload"
    :before-remove="beforeRemove"
    :limit="3"
    :on-exceed="handleExceed"
  >
    <el-button :disabled="isDev" type="primary">点击上传图片</el-button>
    <template #tip>
      <div class="el-upload__tip">上传图片最大为 5M</div>
    </template>
  </el-upload>
  <div class="custom-dialog" :style="{ top: `${editorScrollInfo.scrollTop}px` }" v-if="previewVisible" @click="handleDialogClick">
    <!-- 对话框内容 -->
    <div class="dialog-content">
      <el-tooltip effect="dark" placement="top-start" content="关闭">
        <el-icon class="close" @click="handleClose"><CircleCloseFilled /></el-icon>
      </el-tooltip>
      <!-- 图片容器 -->
      <div class="image-wrapper">
        <img :src="getFirstImgUrl" class="preview-image" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, inject, watch, computed } from "vue";
import type { UploadProps, UploadRequestOptions, UploadUserFile } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { ElNotification, formContextKey, formItemContextKey } from "element-plus";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
import { isArray } from "lodash";
import { delayTime } from "../../compConfig";
import { uploadSurvey } from "@/api/modules/upload";

const compStore = useSelectCompStore();
const filePath = import.meta.env.VITE_APP_BASE_FILE;
interface Props {
  id: string;
  placeholder: string;
  isDev: boolean;
  dataValue: Array<any>;
  editorScrollInfo: any;
}
const props = defineProps<Props>();
const dataValue = ref(props.dataValue ? props.dataValue : []);
const previewVisible = ref(false); // 预览弹窗是否显示
const selectedFile = ref<UploadUserFile>();
const getFirstImgUrl = computed(() => {
  return filePath + selectedFile.value?.url;
});
const handlePreview: UploadProps["onPreview"] = currentFile => {
  selectedFile.value = currentFile;
  if (!selectedFile.value && selectedFile.value.status != "success" && !selectedFile.value.url) {
    ElMessage.warning("暂无可预览的图片");
    return;
  }
  // 4. 显示预览弹窗
  previewVisible.value = true;
};
const handleRemove: UploadProps["onRemove"] = () => {
  // 删除后同步可预览列表
};
const beforeUpload: UploadProps["beforeUpload"] = rawFile => {
  const imgSize = rawFile.size / 1024 / 1024 < 5;
  const imgType = ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(rawFile.type as File.ImageMimeType);
  if (!imgType)
    ElNotification({
      title: "温馨提示",
      message: "上传图片不符合所需的格式！",
      type: "warning"
    });
  if (!imgSize)
    setTimeout(() => {
      ElNotification({
        title: "温馨提示",
        message: `上传图片大小不能超过5M！`,
        type: "warning"
      });
    }, 0);
  return imgType && imgSize;
};
const handleExceed: UploadProps["onExceed"] = (files, uploadFiles) => {
  // 关键：将 files 统一转为数组（避免单个文件时为 File 对象而非数组）
  const selectedFiles = Array.isArray(files) ? files : [files];
  // 计算本次选择的文件数和总文件数
  const selectedCount = selectedFiles.length;
  const totalCount = selectedCount + uploadFiles.length;
  ElMessage.warning(`上传文件限制为3份，您本次选择${selectedCount}份文件，合计文件为${totalCount}份`);
};
const beforeRemove: UploadProps["beforeRemove"] = uploadFile => {
  return ElMessageBox.confirm(`确定要删除 ${uploadFile.name} 吗?`).then(
    () => true,
    () => false
  );
};
// 获取 el-form 组件上下文
const formContext = inject(formContextKey, void 0);
// 获取 el-form-item 组件上下文
const formItemContext = inject(formItemContextKey, void 0);
const handleHttpUpload = async (options: UploadRequestOptions) => {
  let formData = new FormData();
  formData.append("files", options.file);
  try {
    const api = uploadSurvey;
    const { data } = await api(formData);
    // 通知Upload组件上传成功
    options.onSuccess(data, options.file);
    // 更新文件列表中的URL（从接口响应获取）
    const index = dataValue.value.findIndex(item => item.uid === options.file.uid);
    if (index !== -1) {
      dataValue.value[index].url = isArray(data) ? data[0].url : data.url; // 假设接口返回data.url
      dataValue.value[index].response = data; // 保存完整响应数据
    }
    // 调用 el-form 内部的校验方法（可自动校验）
    formItemContext?.prop && formContext?.validateField([formItemContext.prop as string]);
    ElMessage.success("上传成功");
  } catch (error) {
    options.onError(error as any);
  }
};

// 关闭对话框
const handleClose = () => {
  previewVisible.value = false;
};

// 监听本地dataValue变化，同步到父组件
watch(
  () => dataValue.value,
  newList => {
    // 转换为父组件需要的格式（过滤临时文件和多余字段）
    const formattedList = newList
      .filter(item => item.status === "success") // 只保留已上传成功的文件
      .map(item => ({
        name: item.name,
        url: item.url,
        uid: item.uid,
        ...(item.response || {}) // 合并接口返回的其他数据
      }));
    setTimeout(() => {
      compStore.updateCurrentComp({
        dataValue: formattedList,
        id: props.id
      });
    }, delayTime);
  },
  { deep: true }
);
</script>
<style lang="scss" scoped>
.custom-dialog {
  position: fixed;
  left: 0;
  z-index: 1000;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 20px;
  .dialog-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgb(0 0 0 / 70%);
    backdrop-filter: blur(2px);
    transition: opacity 0.3s ease;
  }
  .dialog-content {
    position: relative;
    z-index: 1;
    max-width: 90%;
    max-height: 90vh;
    overflow: hidden;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgb(0 0 0 / 30%);
    animation: dialog-fade-in 0.3s ease;
    .close {
      position: absolute;
      top: 4px;
      right: 2px;
      font-size: 20px;
      cursor: pointer;
    }
  }
  .image-wrapper {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 200px;
    padding: 24px;
    .preview-image {
      max-width: 100%;
      max-height: 80vh;
      object-fit: contain;
      transition: opacity 0.3s ease;
    }
    .load-error {
      padding: 20px;
      font-size: 16px;
      color: #f56c6c;
    }
  }
}

// 对话框淡入动画
@keyframes dialog-fade-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
