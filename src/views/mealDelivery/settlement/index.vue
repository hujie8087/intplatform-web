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
        :init-param="initParam"
        row-key="oId"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="">
          <el-button type="success" v-mealAuth="['order:orders:export']" plain :icon="Download" @click="handleBatchPrintDetail"
            >导出明细
          </el-button>
          <!-- 导出结算单 -->
          <el-button
            type="primary"
            v-mealAuth="['order:orders:export']"
            plain
            :icon="Download"
            @click="handleBatchExportSettlement"
            >导出结算单</el-button
          >
          <!-- 导出查看结算任务列表 -->
          <el-button
            type="warning"
            v-mealAuth="['order:orders:export']"
            plain
            :icon="Download"
            @click="handleBatchPrintDetailTaskTable"
            >查看明细任务列表</el-button
          >
          <!-- 导出查看结算任务列表 -->
          <el-button
            type="warning"
            v-mealAuth="['order:orders:export']"
            plain
            :icon="Download"
            @click="handleBatchExportSettlementTaskTable"
            >查看结算任务列表</el-button
          >
        </template>
        <!-- Expand -->
        <template #expand="scope">
          <div class="card" style="margin: 0 10px">
            <el-table :data="scope.row.children" v-if="scope.row.foodType !== '2'" border style="width: 100%">
              <el-table-column label="订单编号" align="center" prop="orderNo" />
              <el-table-column label="订单日期" prop="orderTime" />
              <el-table-column label="费用归属公司" prop="companyName" />
              <el-table-column label="部门名称" prop="deptPath" />
              <el-table-column label="姓名" prop="userName" />
              <el-table-column label="工号" prop="userNo" />
              <el-table-column label="岗位" prop="postName" />
            </el-table>
          </div>
        </template>
      </ProTable>
      <SettlementDrawer ref="drawerRef" />
      <UserTaskInfoForm ref="userTaskInfoFormRef" />
      <UserTaskListTable ref="userTaskListTableRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="Settlement">
import { ref, reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import SettlementDrawer from "./components/SettlementDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Download } from "@element-plus/icons-vue";
import { queryFoodOrderSettlementList } from "@/api/modules/mdc/system/order/orders";
import { Settlement } from "@/api/interface/mealDelivery/settlement";
import { useDict } from "@/hooks/useDict";
import { DictOptions } from "@/api/interface";
import { getAllCarNameList, getAllMessHallNameList, getAllSiteAddressList } from "@/api/modules/mdc/system";
import { exportOrders3, exportSettlement } from "@/api/modules/mdc/system/order/orders";
import UserTaskInfoForm from "@/components/UserTaskInfoForm/index.vue";
import UserTaskListTable from "@/components/UserTaskListTable/index.vue";
import { queryUserTaskInfo } from "@/api/modules/mdc/monitor/usertask";
import dayjs from "dayjs";
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
const deliveryTypeOptions = ref<DictOptions[]>([]);
useDict("delivery_type").then(res => {
  deliveryTypeOptions.value = res.delivery_type;
});

const foodNameMap = ref<DictOptions[]>([
  { label: "早餐", value: "0", tagType: "primary" },
  { label: "午餐", value: "1", tagType: "success" },
  { label: "晚餐", value: "2", tagType: "warning" },
  { label: "夜宵", value: "3", tagType: "danger" },
  { label: "20L", value: "4", tagType: "info" },
  { label: "点心", value: "5", tagType: "warning" },
  { label: "早茶", value: "6", tagType: "info" }
]);

// 出餐方式
const foodTypeOptions = ref<DictOptions[]>([
  { label: "中国餐", value: "0", tagType: "primary" },
  { label: "印尼餐", value: "1", tagType: "success" },
  { label: "桶装水", value: "2", tagType: "warning" }
]);

const printStatusOptions = ref<DictOptions[]>([
  { label: "未打印", value: "0", tagType: "danger" },
  { label: "已打印", value: "1", tagType: "success" }
]);

const orderStatusOptions = ref<DictOptions[]>([
  { label: "已下单", value: "0", tagType: "danger" },
  { label: "配餐中", value: "1", tagType: "success" },
  { label: "送餐中", value: "2", tagType: "warning" },
  { label: "已送达", value: "3", tagType: "info" }
]);

const orderStatusMapping = (row: Settlement.ResSettlement): { text: string; color: string } => {
  const { orderStatus, centerStatus } = row;
  if ("0" === orderStatus && "1" === centerStatus) {
    // 班组已下单
    return { text: "班组已下单", color: "primary" };
  } else if ("0" === orderStatus && "2" === centerStatus) {
    // 部门已审核
    return { text: "部门已审核", color: "primary" };
  } else if ("1" === orderStatus && "3" === centerStatus) {
    // 餐厅备餐中
    return { text: "餐厅备餐中", color: "warning" };
  } else if ("3" === orderStatus && "3" === centerStatus) {
    // 取餐配送中
    return { text: "取餐配送中", color: "success" };
  } else if ("4" === orderStatus && "3" === centerStatus) {
    // 送达
    return { text: "已送达", color: "info" };
  }
  return { text: "未知", color: "danger" };
};

const orderDateTime = (row: Settlement.ResSettlement) => {
  const key = `${row.orderStatus}_${row.centerStatus}`;
  const timeMap = {
    "0_1": row.teamSubmitTime,
    "0_2": row.deptSubmitTime,
    "1_3": row.leadTime,
    "3_3": row.mealTime,
    "4_3": row.completeTime
  };

  return timeMap[key] ?? "";
};

// const tagTypeOptions = ref<string[]>(["success", "danger", "warning", "info", "primary", "error"]);
// const orderDate = ref<string[]>([
//   dayjs().startOf("day").format("YYYY-MM-DD HH:mm:ss"),
//   dayjs().endOf("day").format("YYYY-MM-DD HH:mm:ss")
// ]);
const initParam = reactive({
  pageNum: 1,
  pageSize: 300,
  orderArrays: [],
  sourceType: 0
});
const getTableList = (params: any) => {
  const newParams = JSON.parse(JSON.stringify(params)); // 深拷贝（可选）
  if (Array.isArray(newParams.orderDate) && newParams.orderDate.length === 2) {
    newParams.params = {
      beginTime: newParams.orderDate[0] + " 00:00:00",
      endTime: newParams.orderDate[1] + " 00:00:00"
    };
    delete newParams.orderDate;
  }
  return queryFoodOrderSettlementList(newParams);
};

// 获取车辆列表
const carList = ref<DictOptions[]>([]);
const getCarList = async () => {
  const res = await getAllCarNameList();
  carList.value = res.data.map(item => ({
    label: item.fcName,
    value: item.fcId
  }));
};
getCarList();

// 获取食堂列表
const messHallListOptions = ref<DictOptions[]>([]);
const getMessHallList = async () => {
  const res = await getAllMessHallNameList();
  messHallListOptions.value = res.data.map(item => ({
    label: item.fdName,
    value: item.fdId
  }));
};
getMessHallList();

// 获取配送站点列表
const siteAddressListOptions = ref<DictOptions[]>([]);
const getSiteAddressList = async () => {
  const res = await getAllSiteAddressList();
  siteAddressListOptions.value = res.data.map(item => ({
    label: item.fsAddress,
    value: item.fsAddress
  }));
};
getSiteAddressList();

// 表格配置项
const expandedRowSet = ref(new Set());
const orderDataCache = new Map();

function getCachedOrderData(row) {
  const key = row.orderNo;
  if (!orderDataCache.has(key)) {
    orderDataCache.set(key, getOrderData(row));
  }
  return orderDataCache.get(key);
}

const columns = reactive<ColumnProps<Settlement.ResSettlement>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "expand", width: 30 },
  { prop: "orderNo", label: "订单编号", width: 160, search: { el: "input" } },
  {
    prop: "orderDate",
    label: "订单日期",
    width: 80,
    search: {
      span: 2,
      el: "date-picker",
      // props: { type: "datetimerange", valueFormat: "YYYY-MM-DD HH:mm:ss" },
      // dayjs().subtract(4, "day").startOf("day").format("YYYY-MM-DD HH:mm:ss"),
      // dayjs().endOf("day").format("YYYY-MM-DD HH:mm:ss")
      props: { type: "daterange", valueFormat: "YYYY-MM-DD" },
      defaultValue: [
        dayjs().startOf("day").format("YYYY-MM-DD"), // 今天 00:00
        dayjs().add(1, "day").endOf("day").format("YYYY-MM-DD") // 明天 23:59:59
      ]
    }
  },
  { prop: "companyName", label: "付费公司", width: 80 },
  {
    prop: "deptPath",
    label: "部门名称",
    width: 120,
    render(scope) {
      return <div style="white-space: normal;">{scope.row.deptPath}</div>;
    }
  },
  { prop: "num", label: "数量", width: 60 },
  {
    prop: "createBy",
    label: "申报人",
    search: { el: "input" },
    render(scope) {
      return <div style="white-space: normal;">{scope.row.createBy}</div>;
    }
  },
  { prop: "jobNumber", label: "申报人工号", width: 100 },
  {
    prop: "deliverySite",
    label: "配送站点",
    width: 80,
    enum: siteAddressListOptions,
    search: {
      el: "select",
      props: {
        filterable: true
      }
    }
  },
  {
    prop: "phoneNumber",
    label: "联系方式",
    width: 100,
    render(scope) {
      return <div style="white-space: normal;">{scope.row.phoneNumber}</div>;
    }
  },
  { prop: "foodType", label: "餐饮类型", width: 70, enum: foodTypeOptions, tag: true, search: { el: "select" } },
  {
    prop: "foodName",
    label: "餐饮名称",
    width: 70,
    enum: foodNameMap,
    tag: true,
    search: {
      el: "select",
      props: {
        filterable: true
      }
    }
  },
  {
    prop: "canteen",
    label: "出餐食堂",
    width: 120,
    enum: messHallListOptions,
    render(scope) {
      return <div style="white-space: normal;">{scope.row.canteen}</div>;
    },
    search: { el: "select", props: { filterable: true } }
  },
  { prop: "packageType", label: "打包类型", width: 70, enum: deliveryTypeOptions, tag: true, search: { el: "select" } },
  { prop: "deliveryType", label: "配送方式", width: 70, enum: deliveryTypeOptions, tag: true, search: { el: "select" } },
  {
    prop: "fcName",
    label: "车号",
    width: 60
  },
  {
    prop: "fcId",
    label: "车号",
    isShow: false,
    enum: carList,
    search: {
      el: "select",
      props: {
        filterable: true
      }
    }
  },
  {
    prop: "orderStatus",
    label: "订单状态",
    width: 120,
    render(scope) {
      const rowId = scope.row.orderNo;
      const isExpanded = expandedRowSet.value.has(rowId);
      return (
        <div>
          <div
            class="table-column-order-status"
            v-show={!isExpanded}
            onClick={() => {
              expandedRowSet.value.add(rowId);
            }}
          >
            <el-tag type={orderStatusMapping(scope.row).color}>{orderStatusMapping(scope.row).text}</el-tag>
            <br />
            <span style="font-size: 12px; line-height: 12px; color: #909399">{orderDateTime(scope.row)}</span>
          </div>
          <div
            v-show={isExpanded}
            onClick={() => {
              expandedRowSet.value.delete(rowId);
            }}
          >
            <el-timeline reverse={false} style="padding: 0">
              {getCachedOrderData(scope.row).map((activity, index) => (
                <el-timeline-item
                  key={index}
                  timestamp={activity.timestamp}
                  color={activity.color}
                  style="font-size: 12px; text-align: left;padding:0"
                >
                  {activity.content}
                </el-timeline-item>
              ))}
            </el-timeline>
          </div>
        </div>
      );
    }
  },
  {
    prop: "orderArrays",
    label: "订单状态",
    isShow: false,
    enum: orderStatusOptions,
    tag: true,
    search: {
      el: "select",
      props: {
        multiple: true
      }
    }
  },
  { prop: "printed", label: "打印状态", width: 80, enum: printStatusOptions, tag: true, search: { el: "select" } }
]);

const getOrderData = (row: Settlement.ResSettlement): { timestamp: string; color: string; content: string }[] => {
  return [
    {
      timestamp: row.teamSubmitTime,
      color: row.teamSubmitTime ? "#0bbd87" : "#CCC",
      content: "班组已下单"
    },
    {
      timestamp: row.deptSubmitTime,
      color: row.deptSubmitTime ? "#0bbd87" : "#CCC",
      content: "部门已审核"
    },
    {
      timestamp: row.leadTime,
      color: row.leadTime ? "#0bbd87" : "#CCC",
      content: "餐厅备餐中"
    },
    {
      timestamp: row.mealTime,
      color: row.mealTime ? "#0bbd87" : "#CCC",
      content: "取餐配送中"
    },
    {
      timestamp: row.completeTime,
      color: row.completeTime ? "#0bbd87" : "#CCC",
      content: "已送达"
    }
  ];
};

const userTaskInfoFormRef = ref<InstanceType<typeof UserTaskInfoForm>>();
const userTaskListTableRef = ref();
// 导出结算单
const handleBatchExportSettlement = () => {
  let totalParam = JSON.parse(JSON.stringify(proTable.value?.totalParam));
  delete totalParam.orderDate;
  exportSettlement({
    ...totalParam,
    params: {
      beginTime: proTable.value?.searchParam.orderDate[0] + " 00:00:00",
      endTime: proTable.value?.searchParam.orderDate[1] + " 00:00:00"
    }
  }).then(res => {
    let taskId = res.data;
    userTaskInfoFormRef.value?.acceptParams({
      rowData: {},
      fileName: "报餐送餐系统-结算表" + new Date().getTime() + ".xlsx",
      api: queryUserTaskInfo,
      params: {
        taskId
      }
    });
  });
};
// 导出明细
const handleBatchPrintDetail = () => {
  let totalParam = JSON.parse(JSON.stringify(proTable.value?.totalParam));
  delete totalParam.orderDate;
  exportOrders3({
    ...totalParam,
    params: {
      beginTime: proTable.value?.searchParam.orderDate[0] + " 00:00:00",
      endTime: proTable.value?.searchParam.orderDate[1] + " 00:00:00"
    }
  }).then(res => {
    let taskId = res.data;
    userTaskInfoFormRef.value?.acceptParams({
      rowData: {},
      fileName: "报餐送餐系统-明细表" + new Date().getTime() + ".xlsx",
      api: queryUserTaskInfo,
      params: {
        taskId
      }
    });
  });
};
// 导出查看明细任务列表
const handleBatchPrintDetailTaskTable = () => {
  userTaskListTableRef.value.create({
    taskCategory: 1,
    dataOperate: 1,
    api: queryUserTaskInfo,
    fileName: "报餐送餐系统-明细表" + new Date().getTime() + ".xlsx"
  });
};
// 导出结算任务列表
const handleBatchExportSettlementTaskTable = () => {
  userTaskListTableRef.value.create({
    taskCategory: 2,
    dataOperate: 1,
    api: queryUserTaskInfo,
    fileName: "报餐送餐系统-明细表" + new Date().getTime() + ".xlsx"
  });
};
</script>
<style lang="scss" scoped>
:deep(.el-table--small .cell) {
  padding: 0 4px;
}
</style>
