<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        title="报修类型管理"
        highlight-current-row
        :columns="columns"
        :request-api="getRepairTypeList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增维修类型</el-button>
          <el-button type="danger" :disabled="!scope.isSelected" :icon="Delete" @click="batchDelete(scope.selectedListIds)">
            批量删除
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="success" link v-if="scope.row.userId !== 1" :icon="EditPen" @click="openDrawer('编辑', scope.row)">
            编辑
          </el-button>
          <el-button type="danger" link :icon="Delete" @click="deleteRepairTypeHandle(scope.row)">删除</el-button>
        </template>
      </ProTable>
      <RepairTypeDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="RepairType">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import RepairTypeDrawer from "./components/RepairTypeDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, View } from "@element-plus/icons-vue";
import {
  getRepairTypeList,
  deleteRepairType,
  editRepairType,
  addRepairType,
  getRepairTypeById
} from "@/api/modules/service/repair";
import { Repair } from "@/api/interface/service/repair";
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
const columns = reactive<ColumnProps<Repair.ResRepairType>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "id", label: "序号", width: 80 },
  { prop: "name", label: "维修类型名称", search: { el: "input", tooltip: "请输入维修类型名称" } },
  {
    prop: "status",
    label: "状态",
    enum: sys_normal_disable,
    sortable: true,
    tag: true,
    search: { el: "select", props: { filterable: true } },
    width: 100
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除维修类型
const deleteRepairTypeHandle = async (params: Repair.ResRepairType) => {
  await useHandleData(deleteRepairType, params.id, `删除【${params.name}】维修类型`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteRepairType, ids, t("main.deleteBatchMsg", { title: "维修类型" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof RepairTypeDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Repair.ResRepairType> = {}) => {
  if (row.id) {
    const res = await getRepairTypeById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addRepairType : title === "编辑" ? editRepairType : undefined,
    getTableList: proTable.value?.getTableList,
    repairTypeStatusOptions: sys_normal_disable.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
