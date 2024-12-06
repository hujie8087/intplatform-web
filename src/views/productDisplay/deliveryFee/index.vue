<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getDeliveryFeeList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" v-auth="['food:fee:add']" :icon="CirclePlus" @click="openDrawer('新增')"
            >新增配送费</el-button
          >
          <el-button
            type="danger"
            :disabled="!scope.isSelected"
            v-auth="['food:fee:remove']"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除配送费
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button
            type="warning"
            link
            v-if="scope.row.userId !== 1"
            v-auth="['food:fee:edit']"
            :icon="EditPen"
            @click="openDrawer('编辑', scope.row)"
          >
            编辑
          </el-button>
          <el-button type="danger" link :icon="Delete" v-auth="['food:fee:remove']" @click="deleteDeliveryFeeHandle(scope.row)"
            >删除</el-button
          >
        </template>
      </ProTable>
      <DeliveryFeeDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="DeliveryFee">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import DeliveryFeeDrawer from "./components/DeliveryFeeDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, View } from "@element-plus/icons-vue";
import {
  deleteDeliveryFee,
  editDeliveryFee,
  addDeliveryFee,
  getDeliveryFeeById,
  getDeliveryFeeList
} from "@/api/modules/productDisplay/deliveryFee";
import { DeliveryFee } from "@/api/interface/productDisplay/deliveryFee";
import { useI18n } from "vue-i18n";
import { useDict } from "@/hooks/useDict";
import { DictOptions } from "@/api/interface";

const { t } = useI18n(); // 解构出t方法

// 字典数据
const sys_normal_disable = ref<DictOptions[]>([]);
useDict("sys_normal_disable").then(res => {
  sys_normal_disable.value = res.sys_normal_disable;
});

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
const columns = reactive<ColumnProps<DeliveryFee.ResDeliveryFee>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "id", label: "序号", width: 80 },
  { prop: "name", label: "配送费名称" },
  { prop: "price", label: "配送费价格" },
  { prop: "billingConditions", label: "计费条件" },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除配送费
const deleteDeliveryFeeHandle = async (params: DeliveryFee.ResDeliveryFee) => {
  await useHandleData(deleteDeliveryFee, params.id, `删除【${params.name}】配送费`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteDeliveryFee, ids, t("main.deleteBatchMsg", { title: "配送费" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof DeliveryFeeDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<DeliveryFee.ResDeliveryFee> = {}) => {
  if (row.id) {
    const res = await getDeliveryFeeById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addDeliveryFee : title === "编辑" ? editDeliveryFee : undefined,
    getTableList: proTable.value?.getTableList,
    noticeStatusOptions: sys_normal_disable.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
