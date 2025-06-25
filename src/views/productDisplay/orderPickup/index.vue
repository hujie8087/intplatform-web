<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getOrderPickupList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" v-auth="['food:canteen:add']" :icon="CirclePlus" @click="openDrawer('新增')">
            新增商店
          </el-button>
          <el-button
            type="danger"
            :disabled="!scope.isSelected"
            v-auth="['food:canteen:remove']"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除商店
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button
            type="warning"
            link
            v-if="scope.row.userId !== 1"
            v-auth="['food:canteen:edit']"
            :icon="EditPen"
            @click="openDrawer('编辑', scope.row)"
          >
            编辑
          </el-button>
          <el-button type="danger" link v-auth="['food:canteen:remove']" :icon="Delete" @click="deleteCanteenHandle(scope.row)">
            删除
          </el-button>
        </template>
      </ProTable>
      <OrderPickupDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="OrderPickup">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import OrderPickupDrawer from "./components/OrderPickupDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, View } from "@element-plus/icons-vue";
import {
  getOrderPickupList,
  deleteOrderPickup,
  editOrderPickup,
  addOrderPickup,
  getOrderPickupById
} from "@/api/modules/productDisplay/orderPickup";
import { OrderPickup } from "@/api/interface/productDisplay/orderPickup";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import { getCanteenListOptions } from "@/api/modules/productDisplay/marketCanteen";

const { t } = useI18n(); // 解构出t方法

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

const fullStatusList = ref<DictOptions[]>([
  { label: "可用", value: 1, tagType: "success" },
  { label: "禁用", value: 0, tagType: "danger" }
]);

const canteenList = ref<DictOptions[]>([]);
const getCanteenList = async () => {
  const res = await getCanteenListOptions();
  canteenList.value = res.data.map(item => ({ label: item.name, value: item.id }));
  console.log(canteenList.value);
};
getCanteenList();

// 表格配置项
const columns = reactive<ColumnProps<OrderPickup.ResOrderPickup>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "id", label: "序号", width: 80 },
  { prop: "name", label: "订桌/货架名称", search: { el: "input" } },
  { prop: "canteenId", label: "商店", enum: canteenList, search: { el: "select" } },
  { prop: "sort", label: "排序" },
  {
    prop: "status",
    label: "状态",
    enum: [
      { label: "启用", value: 1 },
      { label: "禁用", value: 0 }
    ],
    search: { el: "select" },
    render: scope => {
      return (
        <span>
          <el-switch
            model-value={scope.row.status}
            active-text={scope.row.status ? "启用" : "禁用"}
            active-value={1}
            inactive-value={0}
            onClick={() => changeStatus(scope.row)}
          />
        </span>
      );
    },
    width: 100
  },
  { prop: "fullStatus", label: "状态", tag: true, enum: fullStatusList, search: { el: "select" } },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 切换用户状态
const changeStatus = async (row: OrderPickup.ResOrderPickup) => {
  await useHandleData(editOrderPickup, { id: row.id, status: row.status == 1 ? 0 : 1 }, `切换【${row.name}】订桌/货架状态`);
  proTable.value?.getTableList();
};
// 删除订桌/货架
const deleteCanteenHandle = async (params: OrderPickup.ResOrderPickup) => {
  await useHandleData(deleteOrderPickup, params.id, `删除【${params.name}】订桌/货架`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteOrderPickup, ids, t("main.deleteBatchMsg", { title: "订桌/货架" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof OrderPickupDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<OrderPickup.ResOrderPickup> = {}) => {
  if (row.id) {
    const res = await getOrderPickupById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addOrderPickup : title === "编辑" ? editOrderPickup : undefined,
    getTableList: proTable.value?.getTableList,
    canteenList: canteenList.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
