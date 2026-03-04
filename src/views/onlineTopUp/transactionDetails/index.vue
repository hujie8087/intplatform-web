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
        <!-- 表格 header 按钮 -->
        <template #tableHeader>
          <el-button type="primary" :icon="EditPen" @click="batchAdd">修改工资扣款月份</el-button>
        </template>
        <!-- 表格操作 -->
        <template #sign="scope">
          <el-image
            v-if="scope.row.sign"
            style="width: 100px"
            :src="baseFileUrl + scope.row.sign"
            :max-scale="7"
            :min-scale="0.2"
            :preview-src-list="[baseFileUrl + scope.row.sign]"
            fit="cover"
            preview-teleported
            :z-index="100"
          />
          <span v-else>--</span>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <!-- 退款 -->
          <el-button type="danger" link :icon="View" v-auth="['onlineTopUp:transactionDetails:refund']" @click="refund(scope.row)"
            >退款</el-button
          >
          <!-- 离职退款 -->
          <el-button
            type="danger"
            link
            :icon="View"
            v-auth="['onlineTopUp:transactionDetails:leaveRefund']"
            @click="leaveRefund(scope.row)"
            >离职退款</el-button
          >
        </template>
      </ProTable>
      <TransactionDetailsDrawer ref="drawerRef" />
      <UpdateMonthDrawer ref="updateMonthDrawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="TransactionDetails">
import { ref, reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import TransactionDetailsDrawer from "./components/TransactionDetailsDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { EditPen, View } from "@element-plus/icons-vue";
import { getTransactionDetailsList, getTransactionDetailsById, refundById, leaveRefundById } from "@/api/modules/onlineTopUp";
import { TransactionDetails } from "@/api/interface/onlineTopUp";
import dayjs from "dayjs";
import { useHandleData } from "@/hooks/useHandleData";
import UpdateMonthDrawer from "./components/UpdateMonthDrawer.vue";

const baseFileUrl = import.meta.env.VITE_APP_BASE_FILE;

const statusEnum = [
  { label: "充值", value: 1, tagType: "primary" },
  { label: "退款", value: 2, tagType: "danger" },
  { label: "离职", value: 3, tagType: "warning" }
];

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
  if (newParams.createTime) {
    newParams.startTime = newParams.createTime[0];
    newParams.endTime = newParams.createTime[1];
    delete newParams.createTime;
  }
  delete newParams.pageNum;
  delete newParams.pageSize;
  return getTransactionDetailsList(newParams);
};
// 表格配置项
const columns = reactive<ColumnProps<TransactionDetails.ResTransactionDetails>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "no", label: "单号", width: 120 },
  {
    prop: "yearMonth",
    label: "充值月份",
    search: {
      el: "date-picker",
      props: {
        type: "month",
        valueFormat: "YYYY-MM"
      }
    },
    width: 100
  },
  { prop: "account", label: "工号", search: { el: "input" } },
  { prop: "name", label: "姓名", search: { el: "input" } },
  { prop: "amount", label: "金额" },
  {
    prop: "createTime",
    label: "充值时间",
    render(scope) {
      return dayjs(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss");
    },
    search: {
      el: "date-picker",
      props: {
        type: "datetimerange",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        defaultTime: [new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)]
      }
    }
  },
  {
    prop: "sign",
    label: "签名",
    width: 150
  },
  { prop: "deductedMonths", label: "扣减月份", search: { el: "date-picker", props: { type: "month", valueFormat: "YYYY-MM" } } },
  { prop: "status", label: "类型", enum: statusEnum, tag: true },
  { prop: "operation", label: "操作", width: 300, fixed: "right" }
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

// 退款
const refund = async (row: TransactionDetails.ResTransactionDetails) => {
  await useHandleData(refundById, row.id, `退款【${row.name}】`);
  proTable.value?.getTableList();
};

// 离职退款
const leaveRefund = async (row: TransactionDetails.ResTransactionDetails) => {
  await useHandleData(leaveRefundById, row.id, `离职退款【${row.name}】`);
  proTable.value?.getTableList();
};
// 修改工资扣款月份
const updateMonthDrawerRef = ref<InstanceType<typeof UpdateMonthDrawer> | null>(null);
const batchAdd = () => {
  updateMonthDrawerRef.value?.acceptParams({
    title: "修改工资扣款月份",
    isView: false,
    getTableList: proTable.value?.getTableList,
    statusEnum
  });
};
</script>
<style>
.el-image-viewer__wrapper .el-image-viewer__canvas img {
  background-color: #ffffff !important;
}
</style>
