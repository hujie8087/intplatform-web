<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getTableList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
        </template>
      </ProTable>
      <TransactionDetailsDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="TransactionDetails">
import { ref, reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import TransactionDetailsDrawer from "./components/TransactionDetailsDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { View } from "@element-plus/icons-vue";
import { getTransactionDetailsList, getTransactionDetailsById } from "@/api/modules/onlineTopUp";
import { TransactionDetails } from "@/api/interface/onlineTopUp";
import dayjs from "dayjs";

// ProTable 实例
const proTable = ref<ProTableInstance>();
const dataCallback = (data: any) => {
  return {
    list: data.data.list,
    total: data.data.total,
    current: data.data.current,
    size: data.data.size
  };
};
const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  newParams.pageNum && (newParams.current = newParams.pageNum);
  newParams.pageSize && (newParams.size = newParams.pageSize);
  delete newParams.pageNum;
  delete newParams.pageSize;
  return getTransactionDetailsList(newParams);
};
// 表格配置项
const columns = reactive<ColumnProps<TransactionDetails.ResTransactionDetails>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "id", label: "序号", width: 80 },
  {
    prop: "yearMonth",
    label: "月份",
    search: {
      el: "date-picker",
      props: {
        type: "month",
        valueFormat: "YYYY-MM"
      }
    }
  },
  { prop: "account", label: "工号", search: { el: "input" } },
  { prop: "name", label: "姓名", search: { el: "input" } },
  { prop: "amount", label: "金额" },
  {
    prop: "createTime",
    label: "充值时间",
    render(scope) {
      return dayjs(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss");
    }
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof TransactionDetailsDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<TransactionDetails.ResTransactionDetails> = {}) => {
  if (row.id) {
    const res = await getTransactionDetailsById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    getTableList: proTable.value?.getTableList
  };
  drawerRef.value?.acceptParams(params);
};
</script>
