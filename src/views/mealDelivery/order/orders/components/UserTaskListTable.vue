<template>
  <div class="userTaskListTable" id="userTaskListTable">
    <el-dialog title="任务详情" v-model="openDialog" width="80%" :destroy-on-close="true">
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
    </el-dialog>
    <UserTaskInfoForm ref="userTaskInfoFormRef"></UserTaskInfoForm>
  </div>
</template>
<script setup lang="ts" name="UserTaskListTable">
import { queryUserTaskListWithPage } from "@/api/modules/mdc/monitor/usertask";
import UserTaskInfoForm from "./UserTaskInfoForm.vue";
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
  pageSize: 25
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

const create = (taskCategory: number, dataOperate: number, file: string) => {
  openDialog.value = true;
  fileName.value = file;
  console.log(initParams);
  // proTableRef.value?.getTableList();
};

const userTaskInfoFormRef = ref<InstanceType<typeof UserTaskInfoForm>>();

const queryDetailClickEvent = (row: any) => {
  userTaskInfoFormRef.value?.create(fileName.value);
  userTaskInfoFormRef.value?.show(row.taskId);
};

defineExpose({
  queryDetailClickEvent,
  create
});

// export default {
//   name: "UserTaskListTable",
//   components: { UserTaskInfoForm },
//   data() {
//     return {
//       openDialog: false,
//       filename: "",
//       loading: false,
//       taskCategory: 0,
//       dataOperate: 0,
//       dataList: [],
//       // 总条数
//       total: 0,
//       queryParams: {
//         pageNum: 1,
//         pageSize: 25
//       }
//     };
//   },
//   created() {},
//   methods: {
//     create(taskCategory, dataOperate, filename) {
//       this.openDialog = false;
//       this.taskCategory = taskCategory;
//       this.dataOperate = dataOperate;
//       this.filename = filename;

//       this.initUserTaskListTable();
//     },
//     show() {
//       this.openDialog = true;
//     },
//     initUserTaskListTable() {
//       this.loading = true;

//       let taskCategory = this.taskCategory;
//       let dataOperate = this.dataOperate;
//       const queryParams = this.queryParams;
//       let pageNum = queryParams.pageNum;
//       let pageSize = queryParams.pageSize;
//       queryUserTaskListWithPage(taskCategory, dataOperate, pageNum, pageSize)
//         .then(response => {
//           this.dataList = response["rows"];
//           this.total = response["total"];
//           this.$refs.table.bodyWrapper.scrollTop = 0;
//         })
//         .finally(() => {
//           this.loading = false;
//         });
//     },
//     queryDetailClickEvent(row) {
//       let taskId = row["taskId"];
//       const userTaskInfoForm = this.$refs.userTaskInfoForm;
//       userTaskInfoForm.create(this.filename);
//       userTaskInfoForm.show(taskId);
//     }
//   }
// };
</script>

<style scoped></style>
