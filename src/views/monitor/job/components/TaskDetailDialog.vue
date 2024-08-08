<template>
  <el-dialog v-model="dialogVisible" :destroy-on-close="true" width="880" title="任务详细">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="任务编号：">{{ drawerProps.rowData.jobId }}</el-descriptions-item>
      <el-descriptions-item label="任务分组：">{{ drawerProps.rowData.jobName }}</el-descriptions-item>
      <el-descriptions-item label="任务名称：">{{ drawerProps.rowData.jobName }}</el-descriptions-item>
      <el-descriptions-item label="创建时间：">{{ drawerProps.rowData.createTime }}</el-descriptions-item>
      <el-descriptions-item label="cron表达式：">{{ drawerProps.rowData.cronExpression }}</el-descriptions-item>
      <el-descriptions-item label="下次执行时间：">{{ drawerProps.rowData.nextValidTime }}</el-descriptions-item>
      <el-descriptions-item label="调用目标方法：" :span="2">{{ drawerProps.rowData.invokeTarget }}</el-descriptions-item>
      <el-descriptions-item label="任务状态：">
        <el-tag :type="drawerProps.rowData.status === '0' ? 'primary' : 'error'">{{
          drawerProps.rowData.status === "0" ? "正常" : "暂停"
        }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="是否并发：">
        <el-tag :type="drawerProps.rowData.concurrent === '0' ? 'primary' : 'error'">{{
          drawerProps.rowData.concurrent === "0" ? "允许" : "禁止"
        }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="执行策略：">
        <span v-if="drawerProps.rowData.misfirePolicy == '0'">默认策略</span>
        <span v-else-if="drawerProps.rowData.misfirePolicy == '1'">立即执行</span>
        <span v-else-if="drawerProps.rowData.misfirePolicy == '2'">执行一次</span>
        <span v-else-if="drawerProps.rowData.misfirePolicy == '3'">放弃执行</span>
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button type="primary" @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { Task } from "@/api/interface/monitor";
import { ref } from "vue";
interface DrawerProps {
  rowData: Task.ResTask;
}
// drawer框状态
const dialogVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  rowData: {} as Task.ResTask
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  console.log(drawerProps.value.rowData);
  dialogVisible.value = true;
};

defineExpose({
  acceptParams
});
</script>

<style scoped></style>
