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
        row-key="orderNo"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="">
          <!-- 批量确认 -->
          <el-button type="success" :disabled="!proTable?.isSelected" :icon="Check" @click="batchConfirm">批量接收</el-button>
          <!-- 批量驳回 -->
          <el-button
            type="danger"
            :disabled="!proTable?.isSelected || selectedList.length !== 1"
            :icon="Close"
            @click="batchReject"
            >驳回</el-button
          >
          <!-- 导出结算单 -->
          <el-button type="warning" v-mealAuth="['order:orders:export']" :icon="Download" @click="handleBatchExportCheck"
            >导出部门订单核对</el-button
          >
          <!-- 导出查看结算任务列表 -->
          <el-button
            type="warning"
            v-mealAuth="['order:orders:export']"
            plain
            :icon="Download"
            @click="handleBatchExportCheckTaskTable"
            >查看部门订单核对任务列表</el-button
          >
        </template>
        <!-- Expand -->
        <template #expand="scope">
          <div class="card" style="margin: 0 10px" v-if="scope.row.foodType !== '2'">
            <el-table :data="scope.row.children" border style="width: 100%">
              <el-table-column prop="createTime" label="订单日期" align="center" />
              <el-table-column prop="userName" label="姓名" align="center" />
              <el-table-column prop="userNo" label="工号" align="center" />
              <el-table-column prop="postName" label="岗位" align="center" />
              <el-table-column prop="companyName" label="费用归属公司" align="center" />
              <el-table-column prop="deptName" label="部门名称" align="center" />
            </el-table>
          </div>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" v-show="scope.row.leaderStatus === '0' && scope.row.centerStatus === '1'" link
            >提交</el-button
          >
          <el-button type="danger" v-show="scope.row.leaderStatus === '0' && scope.row.centerStatus === '1'" link>驳回</el-button>
          <el-tag
            v-show="scope.row.leaderStatus === '1' && (scope.row.centerStatus === '2' || scope.row.centerStatus === '3')"
            disabled
            link
            >已提交</el-tag
          >

          <el-tag v-show="scope.row.leaderStatus === '2'" type="danger">已驳回</el-tag>
        </template>
      </ProTable>
      <UserTaskListTable ref="userTaskListTableRef" />
      <UserTaskInfoForm ref="userTaskInfoFormRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="MdcOrder">
import { ref, reactive, computed } from "vue";
import ProTable from "@/components/ProTable/index.vue";
// import MdcOrderDrawer from "./components/MdcOrderDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Check, Close, Download } from "@element-plus/icons-vue";
import { batchSubmit, deptReject, exportDeptOrderCheck, listOrders } from "@/api/modules/mdc/system/order/orders";
import { DictOptions } from "@/api/interface";
import { getAllCarNameList, getAllMessHallNameList, getAllSiteAddressList } from "@/api/modules/mdc/system";
import dayjs from "dayjs";
import { MdcOrder } from "@/api/interface/mealDelivery/order";
import { useDict } from "@/hooks/useDict";
// import UserTaskInfoForm from "../orders/components/UserTaskInfoForm.vue";
import UserTaskInfoForm from "@/components/UserTaskInfoForm/index.vue";
import UserTaskListTable from "@/components/UserTaskListTable/index.vue";
import { queryUserTaskInfo } from "@/api/modules/mdc/monitor/usertask";
import { useHandleData } from "@/hooks/useHandleData";

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

const selectedList = computed(() => {
  return proTable.value?.selectedList.filter(item => item.orderNo) ?? [];
});

const foodNameMap = ref<DictOptions[]>([
  { label: "早餐", value: "0", tagType: "primary" },
  { label: "午餐", value: "1", tagType: "success" },
  { label: "晚餐", value: "2", tagType: "warning" },
  { label: "夜宵", value: "3", tagType: "danger" },
  { label: "20L", value: "4", tagType: "info" },
  { label: "点心", value: "5", tagType: "warning" },
  { label: "凌晨餐", value: "6", tagType: "info" }
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

const orderStatusMapping = (row: MdcOrder.ResMdcOrder): { text: string; color: string } => {
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

const orderDateTime = (row: MdcOrder.ResMdcOrder) => {
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

const initParam = reactive({
  pageNum: 1,
  pageSize: 300,
  orderArrays: [],
  sourceType: 0,
  statusArrays: [1, 2, 3]
});
const getTableList = (params: any) => {
  const newParams = JSON.parse(JSON.stringify(params)); // 深拷贝（可选）
  if (Array.isArray(newParams.orderDate) && newParams.orderDate.length === 2) {
    newParams.params = {
      beginTime: newParams.orderDate[0] + " 06:00:00",
      endTime: newParams.orderDate[1] + " 06:00:00"
    };
    delete newParams.orderDate;
  }
  return listOrders(newParams);
};
// 字典数据
const deliveryTypeOptions = ref<DictOptions[]>([]);
useDict("delivery_type").then(res => {
  deliveryTypeOptions.value = res.delivery_type;
});

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
// const orderDataCache = new Map();

// function getCachedOrderData(row) {
//   const key = row.orderNo;
//   if (!orderDataCache.has(key)) {
//     orderDataCache.set(key, getOrderData(row));
//   }
//   return orderDataCache.get(key);
// }

const initDateRange = () => {
  // defaultValue: [dayjs().subtract(4, "day").startOf("day").format("YYYY-MM-DD"), dayjs().endOf("day").format("YYYY-MM-DD")]
  const now = new Date();
  const phi = new Date();
  phi.setHours(6, 0, 0, 0); // 设置为今天的6点

  let start, end;
  if (now < phi) {
    // now < phi
    start = dayjs().subtract(1, "day").format("YYYY-MM-DD");
    end = dayjs().format("YYYY-MM-DD");
  } else {
    // phi <= now
    start = dayjs().format("YYYY-MM-DD");
    end = dayjs().add(1, "day").format("YYYY-MM-DD");
  }
  return [start, end];
};

const columns = reactive<ColumnProps<MdcOrder.ResMdcOrder>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "expand", width: 30 },
  { prop: "orderNo", label: "订单编号", width: 160, search: { el: "input" } },
  {
    prop: "canteen",
    label: "出餐食堂",
    enum: messHallListOptions,
    render(scope) {
      return <div style="white-space: normal;">{scope.row.canteen}</div>;
    },
    search: { el: "select", props: { filterable: true } }
  },
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
    prop: "orderDate",
    label: "订单日期",
    isShow: false,
    search: {
      span: 1,
      el: "date-picker",
      props: { type: "daterange", valueFormat: "YYYY-MM-DD" },
      // defaultValue: [dayjs().subtract(4, "day").startOf("day").format("YYYY-MM-DD"), dayjs().endOf("day").format("YYYY-MM-DD")]
      defaultValue: initDateRange()
    }
  },
  { prop: "pNum", label: "数量", width: 60 },
  {
    prop: "createBy",
    label: "申报人",
    search: { el: "input" },
    render(scope) {
      return <div style="white-space: normal;">{scope.row.createBy}</div>;
    }
  },
  {
    prop: "phone",
    label: "联系方式",
    width: 100,
    render(scope) {
      return <div style="white-space: normal;">{scope.row.phone}</div>;
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
              {getOrderData(scope.row).map((activity, index) => (
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
  { prop: "printed", label: "打印状态", width: 80, enum: printStatusOptions, tag: true, search: { el: "select" } },
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
  { prop: "operation", label: "操作", width: 100, fixed: "right" }
]);

const getOrderData = (row: MdcOrder.ResMdcOrder): { timestamp: string; color: string; content: string }[] => {
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

// 导出结算单
const userTaskInfoFormRef = ref<InstanceType<typeof UserTaskInfoForm>>();
const handleBatchExportCheck = () => {
  let totalParam = {
    ...proTable.value?.totalParam
  };
  delete totalParam.orderDate;
  exportDeptOrderCheck({
    ...totalParam,
    params: {
      beginTime: proTable.value?.searchParam.orderDate[0] + " 06:00:00",
      endTime: proTable.value?.searchParam.orderDate[1] + " 06:00:00"
    }
  }).then(res => {
    let taskId = res.data;
    userTaskInfoFormRef.value?.acceptParams({
      rowData: {},
      fileName: "报餐送餐系统-部门订单核对表" + new Date().getTime() + ".xlsx",
      api: queryUserTaskInfo,
      params: {
        taskId
      }
    });
  });
};

// 查看核对任务列表
const userTaskListTableRef = ref();
const handleBatchExportCheckTaskTable = () => {
  // userTaskListTableRef.value?.create(3, 1, "报餐送餐系统-部门订单核对表" + new Date().getTime() + ".xlsx");
  userTaskListTableRef.value.create({
    taskCategory: 5,
    dataOperate: 1,
    api: queryUserTaskInfo,
    fileName: "报餐送餐系统-部门订单核对表" + new Date().getTime() + ".xlsx"
  });
};

// 批量确认
const batchConfirm = async () => {
  const orderIds = proTable.value?.selectedList.filter(item => item.orderNo).map(item => item.oId) ?? [];
  await useHandleData(batchSubmit, orderIds.join(","), `确认${orderIds.length}条订单`);
  proTable.value?.getTableList();
};

// 批量驳回
const batchReject = async () => {
  const orderIds = proTable.value?.selectedList.filter(item => item.orderNo).map(item => item.oId) ?? [];
  await useHandleData(deptReject, orderIds.join(","), `驳回${orderIds.length}条订单`);
  proTable.value?.getTableList();
};
</script>
<style lang="scss" scoped>
:deep(.el-table--small .cell) {
  padding: 0 4px;
}
</style>
