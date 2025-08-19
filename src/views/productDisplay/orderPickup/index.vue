<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getPickupCodeList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        :page-size="[15, 20, 50, 100]"
        :init-param="{ pageSize: 15 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" v-auth="['food:pickupCode:add']" :icon="CirclePlus" @click="openAddDrawer">新增</el-button>
          <el-button
            type="danger"
            :disabled="!scope.isSelected"
            v-auth="['food:pickupCode:remove']"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除
          </el-button>
          <el-button type="warning" v-auth="['food:pickupCode:enabled']" :icon="Refresh" @click="openBatchUpdateStatusDialog"
            >批量修改状态</el-button
          >
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button
            type="warning"
            link
            v-if="scope.row.userId !== 1"
            v-auth="['food:pickupCode:edit']"
            :icon="EditPen"
            @click="openDrawer('编辑', scope.row)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            link
            v-auth="['food:pickupCode:remove']"
            :icon="Delete"
            @click="deleteCanteenHandle(scope.row)"
          >
            删除
          </el-button>
        </template>
      </ProTable>
      <el-dialog v-model="batchUpdateStatusDialogVisible" title="批量修改状态" width="500px">
        <el-form :model="batchUpdateStatusForm" label-width="80px" :rules="rules">
          <!-- 选择货架 -->
          <el-form-item label="货架编码" prop="code">
            <el-input v-model="batchUpdateStatusForm.code" placeholder="请输入货架编码" />
          </el-form-item>
          <!-- 选择状态 -->
          <el-form-item label="状态" prop="enabled">
            <el-select v-model="batchUpdateStatusForm.enabled" placeholder="请选择状态">
              <el-option v-for="item in statusList" :key="item.label" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="batchUpdateStatusDialogVisible = false">{{ $t("main.cancel") }}</el-button>
          <el-button type="primary" @click="batchUpdateStatus">确定</el-button>
        </template>
      </el-dialog>
      <PickupCodeDrawer ref="drawerRef" />
      <AddPickupCodeDrawer ref="addDrawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="PickupCode">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import PickupCodeDrawer from "./components/PickupCodeDrawer.vue";
import AddPickupCodeDrawer from "./components/AddPickupCodeDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, Refresh, View } from "@element-plus/icons-vue";
import {
  getPickupCodeList,
  deletePickupCode,
  editPickupCode,
  addPickupCode,
  getPickupCodeById,
  batchUpdatePickupCodeStatus
} from "@/api/modules/productDisplay/orderPickup";
import { PickupCode } from "@/api/interface/productDisplay/orderPickup";
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

const statusList = ref<DictOptions[]>([
  { label: "未使用", value: 0, tagType: "warning" },
  { label: "已使用", value: 1, tagType: "success" },
  { label: "已禁用", value: 2, tagType: "danger" }
]);

const canteenList = ref<DictOptions[]>([]);
const getCanteenList = async () => {
  const res = await getCanteenListOptions();
  canteenList.value = res.data.map(item => ({ label: item.name, value: item.id }));
};
getCanteenList();

// 批量修改状态
const batchUpdateStatusDialogVisible = ref(false);
const rules = reactive({
  code: [{ required: true, message: "请输入货架编码" }],
  enabled: [{ required: true, message: "请选择状态" }]
});
const batchUpdateStatusForm = reactive({
  code: "",
  enabled: ""
});
const openBatchUpdateStatusDialog = () => {
  batchUpdateStatusDialogVisible.value = true;
  batchUpdateStatusForm.code = "";
  batchUpdateStatusForm.enabled = "";
};

const batchUpdateStatus = async () => {
  await useHandleData(batchUpdatePickupCodeStatus, batchUpdateStatusForm, `批量修改状态`);
  batchUpdateStatusDialogVisible.value = false;
  proTable.value?.getTableList();
};

// 表格配置项
const columns = reactive<ColumnProps<PickupCode.ResPickupCode>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "id", label: "序号", width: 80 },
  { prop: "code", label: "货架名称", search: { el: "input" } },
  { prop: "canteenId", label: "商店名称", enum: canteenList, search: { el: "select" } },
  { prop: "enabled", label: "状态", tag: true, enum: statusList, search: { el: "select" } },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除订桌/货架
const deleteCanteenHandle = async (params: PickupCode.ResPickupCode) => {
  await useHandleData(deletePickupCode, params.id, `删除【${params.code}】货架`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deletePickupCode, ids, t("main.deleteBatchMsg", { title: "货架" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof PickupCodeDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<PickupCode.ResPickupCode> = {}) => {
  if (row.id) {
    const res = await getPickupCodeById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "编辑" ? editPickupCode : undefined,
    getTableList: proTable.value?.getTableList,
    canteenList: canteenList.value,
    statusList: statusList.value
  };
  drawerRef.value?.acceptParams(params);
};

// 新增 drawer
const addDrawerRef = ref<InstanceType<typeof AddPickupCodeDrawer> | null>(null);
const openAddDrawer = async () => {
  const params = {
    title: "新增",
    isView: false,
    api: addPickupCode,
    getTableList: proTable.value?.getTableList,
    canteenList: canteenList.value
  };
  addDrawerRef.value?.acceptParams(params);
};
</script>
