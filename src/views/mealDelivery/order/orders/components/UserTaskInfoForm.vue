<template>
  <div class="userTaskInfoForm" id="userTaskInfoForm">
    <el-dialog title="任务详情" v-model="openDialog" @close="dialogEvent">
      <el-form :model="taskDetailForm" ref="taskDetailFormRef">
        <el-row>
          <el-col :span="12">
            <el-form-item label="任务Id">{{ taskDetailForm.taskId }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="创建人">{{ taskDetailForm.createBy }}</el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="创建时间">{{ taskDetailForm.createTime }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开始时间">{{ taskDetailForm.startTime }}</el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="状态">{{ taskDetailForm.status }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间">{{ taskDetailForm.endTime }}</el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-progress :text-inside="true" :stroke-width="26" :percentage="taskDetailForm.processPercent"></el-progress>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="!success">{{ taskDetailForm.message }}</el-form-item>
            <el-form-item v-if="success"
              ><a style=" color: blue;text-decoration: underline" @click="downloadFile">下载文件</a></el-form-item
            >
          </el-col>
        </el-row>
      </el-form>
    </el-dialog>
  </div>
</template>
<script setup lang="ts" name="UserTaskInfoForm">
// import { queryUserTaskInfo } from "@/api/monitor/usertask";
import { ref } from "vue";
// import { useDownload } from "@/hooks/useDownload";
import { queryUserTaskInfo } from "@/api/modules/mdc/monitor/usertask";

const baseFile = import.meta.env.VITE_APP_BASE_FILE;
const taskDetailFormRef = ref();
const openDialog = ref(false);
const timer = ref<number | null>(null);
const taskDetailForm = ref({
  taskId: "-",
  createBy: "-",
  createTime: "--",
  startTime: "--",
  status: "-",
  endTime: "--",
  processPercent: 0,
  message: "0",
  outputPath: ""
});
const success = ref(false);
const outputPath = ref("");
const filename = ref("");

const create = (file: string) => {
  filename.value = file;
  openDialog.value = false;
  taskDetailForm.value = {
    taskId: "-",
    createBy: "-",
    createTime: "--",
    startTime: "--",
    status: "-",
    endTime: "--",
    processPercent: 0,
    message: "0",
    outputPath: ""
  };
  success.value = false;
  outputPath.value = "";
};

const downloadFile = () => {
  // useDownload(`${baseFile}${outputPath.value}`, filename.value, true, ".xlsx", "post", {});
  window.open(`${baseFile}${outputPath.value}`, "_blank");
};

const dialogEvent = () => {
  timer.value = null;
};

const show = (taskId: string) => {
  openDialog.value = true;
  if (timer.value !== null) {
    window.clearInterval(timer.value);
    timer.value = null;
  }
  timer.value = window.setInterval(async () => {
    const { data } = await queryUserTaskInfo(taskId);
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
      outputPath.value = data.outputPath;
      window.clearInterval(timer.value!);
      timer.value = null;
    } else if (data.code !== 200) {
      window.clearInterval(timer.value!);
      timer.value = null;
    }
  }, 500);
};
defineExpose({
  create,
  show
});
</script>
<style scoped></style>
