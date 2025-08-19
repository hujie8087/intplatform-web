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
          <!-- 批量打印(小票) -->
          <el-button type="primary" :disabled="!proTable?.isSelected" :icon="Printer" @click="printTicket"
            >批量打印(小票)</el-button
          >
          <!-- 批量打印(A4) -->
          <el-button type="primary" :disabled="!proTable?.isSelected" :icon="Printer" @click="printA4">批量打印(A4)</el-button>
          <!-- 批量确认 -->
          <el-button
            type="success"
            v-mealAuth="['order:orders:receiveOrder']"
            :disabled="!proTable?.isSelected"
            :icon="Check"
            @click="batchConfirm"
            >批量接收</el-button
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
      </ProTable>
      <PrintTemplate ref="printTemplateRef" />
      <!-- <PrintTable ref="printTableRef" :orderList="orderList" :foodTypeList="foodTypeList" :foodTypeOptions="foodTypeOptions" /> -->
    </div>
  </div>
</template>
<script setup lang="tsx" name="MdcCanteenOrder">
import { ref, reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
// import MdcOrderDrawer from "./components/MdcOrderDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Check, Printer } from "@element-plus/icons-vue";
import {
  canteensList,
  queryFoodOrderDeliverySummaryList,
  receiveOrder,
  updatePrintStatus
} from "@/api/modules/mdc/system/order/orders";
import { DictOptions } from "@/api/interface";
import { getAllCarNameList, getAllMessHallNameList, getAllSiteAddressList } from "@/api/modules/mdc/system";
import PrintTemplate from "../orders/components/PrintTemplate.vue";
// import PrintTable from "../orders/components/PrintTable.vue";
import dayjs from "dayjs";
import { MdcOrder } from "@/api/interface/mealDelivery/order";
import { ElMessage } from "element-plus";
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

const printTemplateRef = ref<InstanceType<typeof PrintTemplate>>();
// const printTableRef = ref<InstanceType<typeof PrintTable>>();
// 字典数据
const packageTypeOptions = ref<DictOptions[]>([
  { label: "打包袋", value: "0", tagType: "primary" },
  { label: "餐盒", value: "1", tagType: "success" },
  { label: "桶装", value: "2", tagType: "warning" }
]);

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

const orderStatusMapping = (row: MdcOrder.ResMdcOrder): { text: string; color: string } => {
  const { orderStatus, centerStatus } = row;
  console.log(orderStatus, centerStatus);

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
  centerStatus: 3,
  statusArrays: [2, 3]
});
const getTableList = (params: any) => {
  const newParams = JSON.parse(JSON.stringify(params)); // 深拷贝（可选）
  if (Array.isArray(newParams.orderDate) && newParams.orderDate.length === 2) {
    newParams.params = {
      beginTime: newParams.orderDate[0],
      endTime: newParams.orderDate[1]
    };
    delete newParams.orderDate;
  }
  return canteensList(newParams);
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

const columns = reactive<ColumnProps<MdcOrder.ResMdcOrder>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "expand", width: 30 },
  { prop: "orderNo", label: "订单编号", search: { el: "input" } },
  {
    prop: "orderDate",
    label: "订单日期",
    isShow: false,
    search: {
      span: 2,
      el: "date-picker",
      props: { type: "datetimerange", valueFormat: "YYYY-MM-DD HH:mm:ss" },
      defaultValue: [
        dayjs().subtract(4, "day").startOf("day").format("YYYY-MM-DD HH:mm:ss"),
        dayjs().endOf("day").format("YYYY-MM-DD HH:mm:ss")
      ]
    }
  },
  {
    prop: "deliverySite",
    label: "配送站点",
    enum: siteAddressListOptions,
    search: {
      el: "select",
      props: {
        filterable: true
      }
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
  { prop: "foodType", label: "餐饮类型", width: 80, enum: foodTypeOptions, tag: true, search: { el: "select" } },
  {
    prop: "foodName",
    label: "餐饮名称",
    width: 80,
    enum: foodNameMap,
    tag: true,
    search: {
      el: "select",
      props: {
        filterable: true
      }
    }
  },
  { prop: "packageType", label: "打包类型", width: 80, enum: packageTypeOptions, tag: true, search: { el: "select" } },
  {
    prop: "fcName",
    label: "车号",
    width: 70
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
  { prop: "printed", label: "打印状态", width: 80, enum: printStatusOptions, tag: true, search: { el: "select" } },
  {
    prop: "leaderStatus",
    label: "接收状态",
    width: 80,
    render(scope) {
      return (
        <span>
          <el-button
            v-show={scope.row.leaderStatus === "1" && scope.row.orderStatus === "1"}
            size="mini"
            type="text"
            style="color: red"
          >
            驳回
          </el-button>
          <el-tag v-show={scope.row.leaderStatus === "1" && scope.row.orderStatus >= "3"} type="info" size="mini">
            已接收
          </el-tag>
          <el-tag v-show={scope.row.leaderStatus === "2"} type="danger" size="mini">
            已驳回
          </el-tag>
        </span>
      );
    }
  }
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

const printOrderCallback = async (orderIds: number[]) => {
  const res = await updatePrintStatus(orderIds.join(","));
  if (res.code === 200) {
    ElMessage.success("打印成功");
    proTable.value?.getTableList();
  }
};
// 批量打印(小票)
const printTicket = async () => {
  let fcNameList: string[] = [];
  let foodTypeList: string[] = [];
  let ids: number[] = [];
  let selectedList = [...(proTable.value?.selectedList.filter(item => !item.userNo) ?? [])];
  console.log(selectedList);
  if (!selectedList.length) {
    ElMessage.warning("请选择要打印的订单!");
    return;
  }

  for (let i = 0; i < selectedList.length; i++) {
    const row = selectedList[i] as MdcOrder.ResMdcOrder;
    let centerStatus = row.centerStatus;
    if ("2" === centerStatus) {
      ElMessage.warning("待打印的数据中含有未提交的订单, 请先提交 !");
      return;
    }
    let leaderStatus = row.leaderStatus;
    if ("2" === leaderStatus) {
      ElMessage.warning("待打印的数据中含有已驳回的订单!");
      return;
    }
    if (row.foodType !== undefined) {
      foodTypeList.push(row.foodType);
      ids.push(row.oId ?? "");
    }
    if (row.fcName !== undefined) {
      fcNameList.push(row.fcName);
    }

    try {
      // 对每个 deptId 调用 listDeptExcludeChild
      // const persoInfo = await getDept(row.deptId);
      // 将返回的数据添加到行数据中
      selectedList[i].persoInfo = row.createBy;
    } catch (error) {
      console.error("Error fetching department info:", error);
      // 可以处理错误，例如显示消息或跳过当前行
    }
  }
  if ([...new Set(fcNameList)].length > 1) {
    ElMessage.warning("请选择同一车号进行打印");
    return;
  }
  if ([...new Set(foodTypeList)].length > 1) {
    ElMessage.warning("请选择同一餐饮类型进行打印");
    return;
  }

  try {
    let res = await queryFoodOrderDeliverySummaryList(ids);
    // 获取要打印的区域
    const data = {
      data: res.data.map(item => {
        if (item.foodType === "0") {
          return {
            ...item,
            pageSize: 15,
            pageNumber: Math.ceil(item.num / 15)
          };
        } else {
          return {
            ...item,
            pageSize: 30,
            pageNumber: Math.ceil(item.num / 30)
          };
        }
      })
    };

    // 使用 Vue 3 的方式创建打印组件
    if (printTemplateRef.value) {
      // 设置打印回调
      printTemplateRef.value.printOrder(data.data, async () => {
        await printOrderCallback(ids);
      });
    } else {
      ElMessage.error("打印组件未初始化");
    }
  } catch (error) {
    console.error("打印失败:", error);
    ElMessage.error("打印失败，请重试");
  }
};

// 批量打印(A4)
const printA4 = async () => {
  let fcNameList: string[] = [];
  let foodTypeList: string[] = [];
  let ids: number[] = [];
  let selectedList = [...(proTable.value?.selectedList.filter(item => !item.userNo) ?? [])];
  for (let i = 0; i < selectedList.length; i++) {
    const row = selectedList[i];
    let leaderStatus = row["leaderStatus"];
    if ("2" === leaderStatus) {
      ElMessage.warning("待打印的数据中含有已驳回的订单!");
      return;
    }
    let centerStatus = row["centerStatus"];
    if ("2" === centerStatus) {
      ElMessage.warning("待打印的数据中含有未提交的订单, 请先提交 !");
      return;
    }
    if (row.foodType !== undefined) {
      foodTypeList.push(row.foodType);
      ids.push(row.oId);
    }
    if (row.fcName !== undefined) {
      fcNameList.push(row.fcName);
    }
    try {
      // 对每个 deptId 调用 listDeptExcludeChild
      // const persoInfo = await getDept(row.deptId);
      // 将返回的数据添加到行数据中
      selectedList[i].persoInfo = row.createBy;
    } catch (error) {
      console.error("Error fetching department info:", error);
      // 可以处理错误，例如显示消息或跳过当前行
    }
  }
  if (selectedList.length > 0 && selectedList.some(item => item.orderStatus === 4)) {
    ElMessage.warning("待打印的数据中含有未提交的订单, 请先提交 !");
    return;
  }
  console.log(fcNameList);
  if ([...new Set(fcNameList)].length > 1) {
    ElMessage.warning("请选择同一车号进行打印");
    return;
  }
  if ([...new Set(foodTypeList)].length > 1) {
    ElMessage.warning("请选择同一餐饮类型进行打印");
    return;
  }
  try {
    let res = await queryFoodOrderDeliverySummaryList(ids);
    // 获取要打印的区域
    const data = {
      data: res.data,
      foodTypeList,
      foodTypeOptions: foodTypeOptions.value
    };
    // 使用 Vue 3 的方式创建打印组件
    if (printTemplateRef.value) {
      // 设置打印回调
      printTemplateRef.value.printOrderA4(data, async () => {
        await printOrderCallback(ids);
      });
    } else {
      ElMessage.error("打印组件未初始化");
    }
  } catch (error) {
    console.error("打印失败:", error);
    ElMessage.error("打印失败，请重试");
  }
};

// 批量接收
const batchConfirm = async () => {
  const orderIds = proTable.value?.selectedList.filter(item => item.orderNo).map(item => item.oId) ?? [];
  await useHandleData(receiveOrder, orderIds.join(","), `接收${orderIds.length}条订单`);
  proTable.value?.getTableList();
};
</script>
<style lang="scss" scoped>
:deep(.el-table--small .cell) {
  padding: 0 4px;
}
</style>
