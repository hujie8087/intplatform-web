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
    <el-button color="#1677FF" :disabled="isDev" type="primary" size="default">点击上传图片</el-button>
    <template #tip>
      <div class="el-upload__tip">上传图片最大为 5M</div>
    </template>
  </el-upload>
  <el-dialog
    :top="editorScrollInfo.scrollTop + 120 + 'px'"
    v-if="previewVisible"
    title="图片预览"
    v-model="previewVisible"
    width="360px"
  >
    <div>
      <el-image style="width: 320px; height: 320px" :src="getFirstImgUrl" fit="cover" />
    </div>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref, inject, watch, computed } from "vue";
import type { UploadProps, UploadRequestOptions, UploadUserFile } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { ElNotification, formContextKey, formItemContextKey } from "element-plus";
import { uploadImg } from "@/api/modules/upload";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
import { isArray } from "lodash";
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
  console.log("删除");
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
  console.log(files, "files");
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
    const api = uploadImg;
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
    compStore.updateCurrentComp({
      dataValue: formattedList
    });
  },
  { deep: true }
);
</script>
<style lang="scss" scoped></style>
