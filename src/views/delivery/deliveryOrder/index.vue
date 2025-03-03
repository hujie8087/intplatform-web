<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getDeliveryOrderList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <!-- <el-button type="primary" :icon="CirclePlus" @click="openDetailPage">新增</el-button> -->
          <el-button type="danger" :icon="Delete" :disabled="!scope.isSelected" @click="batchDelete">批量删除</el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="info" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <!-- <el-button type="warning" link :icon="Edit" @click="openDrawer('编辑', scope.row)">编辑</el-button> -->
          <el-button
            type="danger"
            link
            v-if="scope.row.status === '0'"
            v-auth="['delivery:staff:remove']"
            @click="cancelDeliveryStaffHandle(scope.row)"
          >
            取消行程
          </el-button>
        </template>
      </ProTable>
      <DeliveryOrderDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="DeliveryOrder">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import DeliveryOrderDrawer from "./components/DeliveryOrderDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { View, Delete } from "@element-plus/icons-vue";
import {
  getDeliveryOrderList,
  addDeliveryOrder,
  editDeliveryOrder,
  getDeliveryOrderById,
  cancelDeliveryOrder,
  deleteDeliveryOrder
} from "@/api/modules/delivery/deliveryOrder";
import { DictOptions } from "@/api/interface";
import { DeliveryOrder } from "@/api/interface/delivery/deliveryOrder";

// 字典数据
const statusOptions = ref<DictOptions[]>([
  { label: "进行中", value: "0", tagType: "success" },
  { label: "已完成", value: "1", tagType: "danger" }
]);

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
// 表格配置项
const columns = reactive<ColumnProps<DeliveryOrder.ResDeliveryOrder>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "序号", width: 80 },
  { prop: "deliveryNo", label: "行程单号", search: { el: "input" } },
  { prop: "name", label: "配送员姓名", search: { el: "input" } },
  { prop: "tel", label: "联系电话", search: { el: "input" } },
  { prop: "createTime", label: "创建时间", search: { el: "date-picker" } },
  {
    prop: "status",
    label: "状态",
    width: 150,
    enum: statusOptions,
    tag: true,
    search: { el: "select" }
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

const cancelDeliveryStaffHandle = async (params: DeliveryOrder.ResDeliveryOrder) => {
  await useHandleData(
    cancelDeliveryOrder,
    { id: params.id, deliveryNo: params.deliveryNo },
    `取消【${params.deliveryNo}】行程订单`
  );
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async () => {
  await useHandleData(
    deleteDeliveryOrder,
    proTable.value?.selectedList,
    `删除【${proTable.value?.selectedList.length}】行程订单`
  );
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof DeliveryOrderDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<DeliveryOrder.ResDeliveryOrder> = {}) => {
  let deliveryDetail = ref<DeliveryOrder.ResDeliveryOrderById>();
  if (row.id) {
    const res = await getDeliveryOrderById(row.id);
    deliveryDetail.value = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addDeliveryOrder : title === "编辑" ? editDeliveryOrder : undefined,
    getTableList: proTable.value?.getTableList,
    deliveryDetail: deliveryDetail.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
