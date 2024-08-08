<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable ref="proTable" highlight-current-row :columns="columns" :request-api="listJob" :data-callback="dataCallback">
        <!-- 表格 header 按钮 -->
        <template #tableHeader>
          <el-button type="primary" :icon="CirclePlus" @click="openDrawer('添加')">新增</el-button>
          <!-- <el-button type="warning" :icon="Delete" :disabled="!scope.isSelected" @click="batchDeleteJob(scope.selectedListIds)">
            删除
          </el-button> -->
          <el-button type="primary" :icon="Download" plain @click="downloadFile">导出</el-button>
          <el-button type="primary" :icon="Switch" plain @click="downloadFile">日志</el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link v-if="scope.row.userId !== 1" :icon="EditPen" @click="openDrawer('编辑', scope.row)">
            编辑
          </el-button>
          <el-button type="primary" link :icon="Delete" @click="deleteJob(scope.row)">删除</el-button>
          <el-dropdown v-if="scope.row.userId !== 1" style="display: inline-block; margin-left: 10px; vertical-align: middle">
            <el-button type="primary" link :icon="DArrowRight">更多</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-button type="primary" link :icon="CaretRight" @click="runJobHandle(scope.row)">执行一次</el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button type="primary" link :icon="View" @click="showTaskDetail(scope.row)">任务详情</el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button type="primary" link :icon="Operation" @click="toTaskDetail(scope.row)">调度日志</el-button>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </ProTable>
      <JobDrawer ref="drawerRef" />
      <RoleDrawer ref="roleDrawerRef" />
      <TaskDetailDialog ref="taskDetailDialogRef" />
      <ImportExcel ref="dialogRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="useSelectFilter">
import { ref, reactive } from "vue";
import { ElMessageBox } from "element-plus";
import { useHandleData } from "@/hooks/useHandleData";
import { useDownload } from "@/hooks/useDownload";
import ProTable from "@/components/ProTable/index.vue";
import ImportExcel from "@/components/ImportExcel/index.vue";
import JobDrawer from "./components/JobDrawer.vue";
import RoleDrawer from "./components/RoleDrawer.vue";
import TaskDetailDialog from "./components/TaskDetailDialog.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, Download, View, Switch, DArrowRight, CaretRight, Operation } from "@element-plus/icons-vue";
import { Task } from "@/api/interface/monitor";
import { listJob, changeJobStatus, delJob, updateJob, addJob, runJob, getJob } from "@/api/modules/monitor/job";
import { DictOptions } from "@/api/interface";
import { useDict } from "@/hooks/useDict";
import { useRouter } from "vue-router";

const baseUrl = import.meta.env.VITE_API_URL;
const router = useRouter();
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

// 字典数据
const sys_job_status = ref<DictOptions[]>([]);
const sys_job_group = ref<DictOptions[]>([]);
useDict("sys_job_status", "sys_job_group").then(res => {
  sys_job_status.value = res.sys_job_status;
  sys_job_group.value = res.sys_job_group;
});
// 表格配置项
const columns = reactive<ColumnProps<Task.ResTask>[]>([
  { type: "selection", label: "", width: 80 },
  { type: "index", label: "任务编号", width: 120 },
  { prop: "jobName", label: "任务名称", search: { el: "input" } },
  { prop: "jobGroup", enum: sys_job_group, label: "任务组名", search: { el: "select" } },
  { prop: "invokeTarget", label: "调用目标字符串" },
  { prop: "cronExpression", label: "cron执行表达式" },
  {
    prop: "status",
    label: "状态",
    enum: sys_job_status,
    search: { el: "tree-select", props: { filterable: true } },
    render: scope => {
      return (
        <>
          <el-switch
            model-value={scope.row.status}
            active-text={scope.row.status === "0" ? "启用" : "禁用"}
            active-value={"0"}
            inactive-value={"1"}
            onClick={() => changeStatus(scope.row)}
          />
        </>
      );
    }
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

const toTaskDetail = async (params: Task.ResTask) => {
  // 跳转详情
  // router.push(`/job/detail`);
  router.push(`/monitor/job-log?jobName=${params.jobName}&jobGroup=${params.jobGroup}`);
};
// 删除任务信息
const deleteJob = async (params: Task.ResTask) => {
  await useHandleData(delJob, [params.jobId], `删除【${params.jobName}】任务`);
  proTable.value?.getTableList();
};

// // 批量删除任务信息
// const batchDeleteJob = async jobIds => {
//   await useHandleData(delJob, jobIds, `删除所选任务`);
//   proTable.value?.getTableList();
// };

// 执行任务
const runJobHandle = async (job: Task.ResTask) => {
  await useHandleData(runJob, job, `立即执行一次"${job.jobName}"任务`);
  proTable.value?.getTableList();
};

// 导出任务列表
const downloadFile = async () => {
  ElMessageBox.confirm("确认导出任务数据?", "温馨提示", { type: "warning" }).then(() =>
    useDownload(`${baseUrl}/monitor/job/export`, "任务列表", true, ".xlsx", "post", proTable.value?.searchParam)
  );
};

// 查看任务详情
const taskDetailDialogRef = ref();
const showTaskDetail = async (row: Task.ResTask) => {
  const data = await getJob(row.jobId);
  taskDetailDialogRef.value?.acceptParams({ rowData: data.data });
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof JobDrawer> | null>(null);
const openDrawer = (title: string, row: Partial<Task.ResTask> = {}) => {
  const params = {
    title,
    isView: title === "查看",
    rowData: row,
    api: title === "添加" ? addJob : title === "编辑" ? updateJob : undefined,
    getTableList: proTable.value?.getTableList,
    sys_job_status: sys_job_status.value,
    sys_job_group: sys_job_group.value
  };
  drawerRef.value?.acceptParams(params);
};

// 切换状态
const changeStatus = async (row: Task.ResTask) => {
  await useHandleData(
    changeJobStatus,
    { jobId: row.jobId, status: row.status == "1" ? "0" : "1" },
    `切换【${row.jobName}】任务状态`
  );
  proTable.value?.getTableList();
};
</script>
