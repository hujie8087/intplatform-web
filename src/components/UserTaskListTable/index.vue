<template>
  <div class="userTaskListTable" id="userTaskListTable">
    <el-dialog title="任务详情" v-model="openDialog" width="80%" :destroy-on-close="true">
      <div style="height: 580px">
        <ProTable
          ref="proTableRef"
          :columns="columns"
          :request-api="getTableList"
          :init-param="initParams"
          :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
          :data-callback="dataCallback"
          :page-sizes="[25, 50, 100]"
        >
          <template #operation="scope">
            <el-button type="text" @click="queryDetailClickEvent(scope.row)">查看详情</el-button>
          </template>
        </ProTable>
      </div>
    </el-dialog>
    <UserTaskInfoForm ref="userTaskInfoFormRef"></UserTaskInfoForm>
  </div>
</template>
<script setup lang="ts" name="UserTaskListTable">
import { queryUserTaskListWithPage } from "@/api/modules/mdc/monitor/usertask";
import UserTaskInfoForm from "@/components/UserTaskInfoForm/index.vue";
import { reactive, ref } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance } from "@/components/ProTable/interface";
import dayjs from "dayjs";

const getTableList = (params: any) => {
  const newParams = JSON.parse(JSON.stringify(params)); // 深拷贝（可选）
  console.log(newParams);
  return queryUserTaskListWithPage(newParams);
};

const dataCallback = (data: any) => {
  return {
    list: data.rows,
    total: data.total,
    current: data.current,
    size: data.size
  };
};

const initParams = reactive({
  taskCategory: 3,
  dataOperate: 1,
  pageSize: 10
});

const proTableRef = ref<ProTableInstance>();
const openDialog = ref(false);
const fileName = ref<string>("");

const columns = ref([
  {
    label: "任务Id",
    prop: "taskId"
  },
  {
    label: "状态",
    prop: "status"
  },
  {
    label: "描述",
    prop: "message"
  },
  {
    label: "创建时间",
    prop: "createTime",
    render: (scope: any) => {
      return scope.row.createTime ? dayjs(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss") : "";
    }
  },
  {
    label: "创建人",
    prop: "createBy"
  },
  {
    label: "操作",
    prop: "operation"
  }
]);
const queryUserTaskInfo = ref();
interface DrawerProps {
  taskCategory: string | number;
  dataOperate: string | number;
  api?: (params: any) => Promise<any>;
  fileName: string;
}
const create = (params: DrawerProps): void => {
  debugger;
  fileName.value = params.fileName;
  Object.assign(initParams, {
    taskCategory: params.taskCategory,
    dataOperate: params.dataOperate
  });
  queryUserTaskInfo.value = params.api;
  openDialog.value = true;
};

const userTaskInfoFormRef = ref<InstanceType<typeof UserTaskInfoForm>>();

const queryDetailClickEvent = (row: any) => {
  userTaskInfoFormRef.value?.acceptParams({
    rowData: {},
    fileName: fileName.value,
    api: queryUserTaskInfo.value as any,
    params: {
      taskId: row.taskId
    }
  });
};

defineExpose({
  queryDetailClickEvent,
  create
});
</script>

<style scoped></style>
