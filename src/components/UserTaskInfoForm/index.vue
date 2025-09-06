<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" title="任务详情" @close="dialogEvent">
    <el-descriptions :column="2" border label-width="100px">
      <el-descriptions-item label="任务ID">{{ taskDetailForm.taskId }}</el-descriptions-item>
      <el-descriptions-item label="创建人">{{ taskDetailForm.createBy }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ taskDetailForm.createTime }}</el-descriptions-item>
      <el-descriptions-item label="开始时间">{{ taskDetailForm.startTime }}</el-descriptions-item>
      <el-descriptions-item label="状态">{{ taskDetailForm.status }}</el-descriptions-item>
      <el-descriptions-item label="结束时间">{{ taskDetailForm.endTime }}</el-descriptions-item>
      <el-descriptions-item label="进度"><el-progress :percentage="taskDetailForm.processPercent" /></el-descriptions-item>
      <el-descriptions-item label="" v-if="success">
        <el-button type="primary" @click="downloadFile">下载文件</el-button>
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.cancel") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="WaterSettlementDrawer">
import { ref } from "vue";
import axios from "axios";
const baseFile = import.meta.env.VITE_APP_BASE_FILE;

interface TaskDetailForm {
  taskId: string;
  createBy: string;
  createTime: string;
  startTime: string;
  status: string;
  endTime: string;
  processPercent: number;
  message: string;
  outputPath: string;
}

const taskDetailForm = ref<TaskDetailForm>({
  taskId: "",
  createBy: "",
  createTime: "",
  startTime: "",
  status: "",
  endTime: "",
  processPercent: 0,
  message: "",
  outputPath: ""
});

const success = ref(false);
interface DrawerProps {
  rowData: Partial<TaskDetailForm>;
  fileName: string;
  api?: (params: any) => Promise<any>;
  params?: any;
}
// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  rowData: {},
  fileName: ""
});
const timer = ref<number | null>(null);
const dialogEvent = () => {
  timer.value = null;
};
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
  if (params.api) {
    if (timer.value !== null) {
      window.clearInterval(timer.value);
      timer.value = null;
    }
    let queryUserTaskInfo = params.api;
    timer.value = window.setInterval(async () => {
      // try {
      const { data } = await queryUserTaskInfo(params.params.taskId);
      taskDetailForm.value.taskId = data.taskId;
      taskDetailForm.value.startTime = data.startTime;
      taskDetailForm.value.endTime = data.endTime;
      taskDetailForm.value.status = data.status;
      taskDetailForm.value.processPercent = data.processPercent;
      taskDetailForm.value.message = data.message;
      taskDetailForm.value.outputPath = data.outputPath;
      taskDetailForm.value.createTime = data.createTime;
      taskDetailForm.value.createBy = data.createBy;
      if (data.status === "Success" && data.outputPath !== "") {
        success.value = true;
        // outputPath.value = data.outputPath;
        taskDetailForm.value.outputPath = data.outputPath;
        window.clearInterval(timer.value!);
        timer.value = null;
      } else if ("Error" === data.status) {
        window.clearInterval(timer.value!);
        timer.value = null;
      }
      // } catch (error) {
      //   window.clearInterval(timer.value!);
      // }
    }, 500);
  }
};
// 提交数据（新增/编辑）
const downloadFile = async () => {
  // window.open(`${baseFile}${taskDetailForm.value.outputPath}`, "_blank");
  let url = `${baseFile}${taskDetailForm.value.outputPath}`;
  let fileName = drawerProps.value.fileName; // 自定义保存的文件名
  try {
    const res = await axios.get(url, { responseType: "blob" });
    const blob = new Blob([res.data], { type: "application/octet-stream" });
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error("下载失败：", err);
  }
};
defineExpose({
  acceptParams
});
</script>
