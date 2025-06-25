<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" title="任务详情">
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
// import { queryUserTaskInfo } from "@/api/modules/mdc/monitor/usertask";
import { ref } from "vue";

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
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
  if (params.api) {
    params.api(params.params).then((res: any) => {
      console.log(res);
      //   show(res.data.taskId);
    });
  }
};
// const taskInterId = ref(0);
// const show = (taskId: string) => {
//   setInterval(() => {
//     queryUserTaskInfo(taskId).then(({ data }) => {
//       taskDetailForm.value.taskId = data.taskId;
//       taskDetailForm.value.startTime = data.startTime;
//       taskDetailForm.value.endTime = data.endTime;
//       taskDetailForm.value.status = data.status;
//       taskDetailForm.value.processPercent = data.processPercent;
//       taskDetailForm.value.message = data.message;
//       taskDetailForm.value.outputPath = data.outputPath;
//       taskDetailForm.value.createTime = data.createTime;
//       taskDetailForm.value.createBy = data.createBy;

//       if ("Success" === data.status && "" !== data.outputPath) {
//         clearInterval(taskInterId.value);
//         success.value = true;
//         taskDetailForm.value.outputPath = data.outputPath;
//       } else if ("Error" === data.status) {
//         clearInterval(taskInterId.value);
//         taskInterId.value = 0;
//       }
//     });
//   }, 500);
// };

// 提交数据（新增/编辑）
const downloadFile = () => {
  console.log(taskDetailForm.value.outputPath);
};
defineExpose({
  acceptParams
});
</script>
