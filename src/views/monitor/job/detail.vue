<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="listJobLog"
        :data-callback="dataCallback"
        :init-param="initParam"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button
            type="warning"
            :icon="Delete"
            :disabled="!scope.isSelected"
            @click="batchDeleteJobLog(scope.selectedListIds)"
          >
            删除
          </el-button>
          <el-button type="warning" :icon="Delete" @click="cleanJobLogHandle"> 清空 </el-button>
          <el-button type="primary" :icon="Download" plain @click="downloadFile">导出</el-button>
          <el-button type="primary" :icon="Switch" plain @click="closeWindow">关闭</el-button>
        </template>
        <template #status="scope">
          <el-tag :type="scope.row.status === '0' ? 'success' : 'error'">{{ scope.row.status ? "成功" : "失败" }}</el-tag>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="Delete" @click="deleteJobLog(scope.row)">删除</el-button>
        </template>
      </ProTable>
    </div>
  </div>
</template>

<script setup lang="tsx" name="monitorJobLogDetail">
import { DictOptions } from "@/api/interface";
import { Task } from "@/api/interface/monitor";
import ProTable from "@/components/ProTable/index.vue";
import { cleanJobLog, delJobLog, listJobLog } from "@/api/modules/monitor/job";
import { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import { useDict } from "@/hooks/useDict";
import { useDownload } from "@/hooks/useDownload";
import { useHandleData } from "@/hooks/useHandleData";
import { Delete, Download, Switch } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";
import { ref } from "vue";
import { reactive } from "vue";
import { useRoute } from "vue-router";
const baseUrl = import.meta.env.VITE_API_URL;
const route = useRoute();
// ProTable 实例
const proTable = ref<ProTableInstance>();
const dataCallback = (data: any) => {
  return {
    list: data.rows,
    total: data.total,
    current: data.current,
    size: data.size
  };
};
const initParam = reactive(route.query);
// 字典数据
const sys_common_status = ref<DictOptions[]>([]);
const sys_job_group = ref<DictOptions[]>([]);
useDict("sys_common_status", "sys_job_group").then(res => {
  sys_common_status.value = res.sys_common_status;
  sys_job_group.value = res.sys_job_group;
});

// 表格配置项
const columns = reactive<ColumnProps<Task.ResTaskLog>[]>([
  { type: "selection", label: "", width: 80 },
  { prop: "jobLogId", label: "日志编号", width: 120 },
  { prop: "jobName", label: "任务名称", search: { el: "input" } },
  { prop: "jobGroup", enum: sys_job_group, label: "任务组名", search: { el: "select" } },
  { prop: "invokeTarget", label: "调用目标字符串" },
  { prop: "jobMessage", label: "日志信息" },
  {
    prop: "status",
    label: "状态",
    enum: sys_common_status,
    search: { el: "select", props: { filterable: true } }
  },
  { prop: "createTime", label: "执行时间", width: 180, search: { el: "date-picker" } },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除任务日志信息
const deleteJobLog = async (params: Task.ResTask) => {
  await useHandleData(delJobLog, [params.jobId], `删除【${params.jobName}】任务日志`);
  proTable.value?.getTableList();
};

// 批量删除任务日志信息
const batchDeleteJobLog = async jobIds => {
  await useHandleData(delJobLog, jobIds, `删除所选任务`);
  proTable.value?.getTableList();
};

// 请客任务日志信息
const cleanJobLogHandle = async () => {
  await useHandleData(cleanJobLog, {}, `清空任务日志`);
  proTable.value?.getTableList();
};

// 导出任务日志列表
const downloadFile = async () => {
  ElMessageBox.confirm("确认导出任务数据?", "温馨提示", { type: "warning" }).then(() =>
    useDownload(`${baseUrl}/monitor/jobLog/export`, "任务日志列表", true, ".xlsx", "post", proTable.value?.searchParam)
  );
};
// 关闭当前tab
const closeWindow = () => {
  window.close();
};
</script>
