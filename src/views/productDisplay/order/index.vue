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
        <template #tableHeader="scope">
          <el-button
            type="success"
            v-auth="['food:order:take']"
            :disabled="!scope.isSelected"
            :icon="CirclePlus"
            @click="batchStatusChanges(scope.selectedListIds, 2)"
            >取餐</el-button
          >
          <el-button
            type="danger"
            v-auth="['food:order:invalid']"
            :disabled="!scope.isSelected"
            :icon="Delete"
            @click="batchStatusChanges(scope.selectedListIds, 0)"
          >
            作废
          </el-button>
          <el-button type="primary" v-auth="['food:order:export']" :icon="Download" @click="handleExport">导出</el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer(scope.row)">查看</el-button>
          <el-button
            type="success"
            link
            :icon="Van"
            v-auth="['food:order:take']"
            v-if="scope.row.status !== 2"
            @click="handleStatusChanges(scope.row, 2)"
            >取餐</el-button
          >
          <el-button
            type="danger"
            link
            v-auth="['food:order:invalid']"
            :icon="DocumentDelete"
            v-if="scope.row.status !== 2"
            @click="handleStatusChanges(scope.row, 0)"
            >作废</el-button
          >
          <!-- 打印 -->
          <el-button type="warning" link v-auth="['food:order:print']" :icon="Printer" @click="handlePrint(scope.row)"
            >打印</el-button
          >
          <!-- 打印菜品 -->
          <el-button type="warning" link v-auth="['food:order:print']" :icon="Printer" @click="handlePrintDish(scope.row)"
            >打印菜品</el-button
          >
        </template>
      </ProTable>
      <OrderDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="Order">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, DocumentDelete, Download, Printer, Van, View } from "@element-plus/icons-vue";
import {
  getOrderList,
  getOrderDishList,
  updateOrderStatus,
  editOrder,
  updateMoreOrderStatus
} from "@/api/modules/productDisplay/order";
import { Order } from "@/api/interface/productDisplay/order";
import { DictOptions } from "@/api/interface";
import { getCanteenListOptions, getPickupType } from "@/api/modules/productDisplay/marketCanteen";
import OrderDrawer from "./components/OrderDrawer.vue";
import { ElMessageBox } from "element-plus";
import { useDownload } from "@/hooks/useDownload";
import { useDict } from "@/hooks/useDict";
import { useUserStore } from "@/stores/modules/user";
import dayjs from "dayjs";

const baseUrl = import.meta.env.VITE_API_URL;
const userStore = useUserStore();
const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  newParams.createTime && (newParams.startQueryTime = newParams.createTime[0]);
  newParams.createTime && (newParams.endQueryTime = newParams.createTime[1]);
  delete newParams.createTime;
  return getOrderList(newParams);
};

// 字典数据
const orderStatusOptions = ref<DictOptions[]>([]);
const orderPrintOptions = ref<DictOptions[]>([]);
useDict("order_type_status", "order_print_status").then(res => {
  orderStatusOptions.value = res.order_type_status.map(item => ({ ...item, value: +item.value }));
  orderPrintOptions.value = res.order_print_status.map(item => ({ ...item, value: +item.value }));
});

const tagTypeList = ref<string[]>(["warning", "success", "danger", "info", "primary"]);

// 取餐类型
const pickupTypeOptions = ref<DictOptions[]>([]);
const getPickupTypeList = async () => {
  const res = await getPickupType();
  pickupTypeOptions.value = res.rows.map((item, index) => ({
    label: item.name,
    value: item.id,
    tagType: tagTypeList.value[index]
  }));
};
getPickupTypeList();

// 所属餐厅
const canteenOptions = ref<DictOptions[]>([]);
const getCanteenList = async () => {
  const res = await getCanteenListOptions();
  canteenOptions.value = res.data.map(item => ({ label: item.name, value: item.id }));
};
getCanteenList();

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

// 修改订单状态
const handleStatusChanges = async (row: Order.ResOrder, status: number) => {
  let title = orderStatusOptions.value.find(item => item.value === status)?.label;

  await useHandleData(updateOrderStatus, { id: row.id, status }, `确定【${title}】${row.no}订单`);
  proTable.value?.getTableList();
};

// 批量作废
const batchStatusChanges = async (ids: number[], status: number) => {
  let arr: { id: number; status: number }[] = [];
  ids.forEach(id => {
    arr.push({ id, status });
  });
  await useHandleData(updateMoreOrderStatus, arr, `确定作废订单`);
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 表格配置项
const columns = reactive<ColumnProps<Order.ResOrder>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "no", label: "订单编号", width: 120 },
  { prop: "name", label: "姓名", search: { el: "input" } },
  { prop: "nick", label: "工号", search: { el: "input" } },
  { prop: "tel", label: "联系电话", search: { el: "input" } },
  {
    prop: "canteenId",
    label: "餐厅",
    enum: canteenOptions,
    search: { el: "select" }
  },
  {
    prop: "status",
    label: "状态",
    enum: orderStatusOptions,
    tag: true,
    width: 100,
    search: { el: "select" }
  },
  { prop: "print", label: "是否打印", width: 100, tag: true, enum: orderPrintOptions },
  { prop: "address", label: "配送地址" },
  { prop: "deliveryArea", label: "配送时间" },
  {
    prop: "pickupType",
    label: "取餐类型",
    enum: pickupTypeOptions,
    tag: true,
    width: 100,
    search: { el: "select" }
  },
  {
    prop: "createTime",
    label: "创建时间",
    width: 180,
    search: {
      el: "date-picker",
      span: 2,
      props: {
        type: "datetimerange",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        format: "YYYY-MM-DD HH:mm:ss",
        defaultTime: ["2000-01-01 00:00:00", "2100-01-01 23:59:59"]
      }
    }
  },
  {
    prop: "",
    label: "打单人",
    width: 180,
    render: scope => {
      return (
        <div>
          <div>{scope.row.singlePlayer}</div>
          <div>{scope.row.singleTime}</div>
        </div>
      );
    }
  },
  { prop: "totalPrice", label: "总金额", width: 80 },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 打印
const handlePrint = async (row: Order.ResOrder) => {
  // window.open("https://api.iwipwedabay.com//api/food/mis//findById/" + row.id);
  // window.open("http://10.40.11.26:10210/findById/" + row.id);
  window.open("http://10.40.10.18:10210/findById/" + row.id);
  await editOrder({ ...row, singlePlayer: userStore.userInfo.user.userName, singleTime: dayjs().format("YYYY-MM-DD HH:mm:ss") });
};
// 打印菜品
const handlePrintDish = async (row: Order.ResOrder) => {
  window.open(
    "http://172.90.0.15:8080/webroot/decision/view/report?viewlet=foodOrder%252Fdetilorder.cpt&ref_t=design&ref_c=eb39c913-2ff1-4716-87e1-9ebb6a57ea0c&id=" +
      row.id
  );
  await editOrder({ ...row, print: 1 });
  proTable.value?.getTableList();
};
// 导出
const handleExport = async () => {
  ElMessageBox.confirm("确认导出订单数据?", "温馨提示", { type: "warning" }).then(() =>
    useDownload(`${baseUrl}/productdisplay/food/order/export`, "订单数据", true, ".xlsx", "post", proTable.value?.searchParam)
  );
};

const drawerRef = ref<InstanceType<typeof OrderDrawer> | null>(null);
const orderDetailDishList = ref<Order.ResOrderDish[]>([]);
// 打开查看订单详情
const openDrawer = async (row: Partial<Order.ResOrder> = {}) => {
  if (row.id) {
    const res = await getOrderDishList({ orderId: row.id, page: 1, size: 999999 });
    orderDetailDishList.value = res.rows;
  }
  const params = {
    title: "查看",
    rowData: { ...row },
    getTableList: proTable.value?.getTableList,
    pickupTypeOptions: pickupTypeOptions.value,
    orderDetailDishList: orderDetailDishList.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
