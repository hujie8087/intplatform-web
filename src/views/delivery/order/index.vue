<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getOrderList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="danger" :icon="Delete" :disabled="!scope.isSelected" @click="batchDelete">批量删除</el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="info" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="danger" link :icon="Delete" @click="openDeleteHandle(scope.row)">删除</el-button>
        </template>
      </ProTable>
      <DeliveryOrderDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="DeliveryOrder">
import { ref, reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import DeliveryOrderDrawer from "./components/DeliveryOrderDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { View, Delete } from "@element-plus/icons-vue";
import { getOrderList, addOrder, editOrder, getOrderById, deleteOrder } from "@/api/modules/delivery/order";
import { OrderDelivery } from "@/api/interface/delivery/order";
import { DictOptions } from "@/api/interface";
import { useHandleData } from "@/hooks/useHandleData";
import { getDeliveryStationList } from "@/api/modules/delivery/station";
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
const tagTypeOptions = ref<string[]>(["success", "danger", "warning", "info", "primary", "error"]);
// 获取配送站点
const deliveryStationOptions = ref<DictOptions[]>([]);
const getDeliveryStationOptions = async () => {
  const res = await getDeliveryStationList({ pageNum: 1, pageSize: 9999 });
  deliveryStationOptions.value = res.rows.map((item, index) => ({
    label: item.sourceStation,
    value: item.code,
    tagType: tagTypeOptions.value[index % tagTypeOptions.value.length]
  }));
};

getDeliveryStationOptions();

// 字典数据 配送状态(0  待接单 1  已接单  2 已送达  3  已收货  4  已评价 )
const orderStatusOptions = ref<DictOptions[]>([
  { label: "待打包", value: 99, tagType: "danger" },
  { label: "待配送", value: 0, tagType: "danger" },
  { label: "已接单", value: 1, tagType: "warning" },
  { label: "已送达", value: 2, tagType: "success" },
  { label: "已收货", value: 3, tagType: "info" },
  { label: "已评价", value: 4, tagType: "primary" },
  { label: "配送异常", value: 5, tagType: "error" }
]);

// 表格配置项
const columns = reactive<ColumnProps<OrderDelivery.ResOrderDelivery>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "序号", width: 50 },
  { prop: "orderNo", label: "订单号", width: 150, search: { el: "input" } },
  {
    prop: "code",
    label: "配送站点",
    width: 150,
    enum: deliveryStationOptions,
    tag: true,
    search: { el: "select" },
    render(scope) {
      return (
        <el-tag type={deliveryStationOptions.value.find(item => item.value === scope.row.code.toUpperCase())?.tagType}>
          {deliveryStationOptions.value.find(item => item.value === scope.row.code.toUpperCase())?.label}
        </el-tag>
      );
    }
  },
  { prop: "deliveryName", label: "收货人姓名", width: 120 },
  { prop: "deliveryTel", label: "收货人电话", width: 120 },
  { prop: "deliveryAddress", label: "配送地址", width: 260 },
  { prop: "orderTime", label: "下单时间", width: 120 },
  { prop: "sourceNo", label: "订单来源编号", width: 150, search: { el: "input" } },
  { prop: "deliveryStatus", label: "订单状态", width: 150, enum: orderStatusOptions, tag: true, search: { el: "select" } },
  { prop: "errorMsg", label: "异常信息", width: 100 },
  { prop: "remark", label: "备注", width: 100 },
  { prop: "operation", label: "操作", width: 130, fixed: "right" }
]);

// 删除
const openDeleteHandle = async (row: Partial<OrderDelivery.ResOrderDelivery> = {}) => {
  await useHandleData(deleteOrder, row.id, `删除【${row.orderNo}】订单`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async () => {
  await useHandleData(deleteOrder, proTable.value?.selectedList, `删除【${proTable.value?.selectedList.length}】订单`);
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof DeliveryOrderDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<OrderDelivery.ResOrderDelivery> = {}) => {
  let data: OrderDelivery.ResOrderDeliveryDetail = {};
  if (row.id) {
    const res = await getOrderById(row.id);
    data = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: data,
    api: title === "新增" ? addOrder : title === "编辑" ? editOrder : undefined,
    getTableList: proTable.value?.getTableList,
    orderStatusOptions: orderStatusOptions.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
