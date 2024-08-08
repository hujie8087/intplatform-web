<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getSupermarketList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增超市</el-button>
          <el-button type="danger" :disabled="!scope.isSelected" :icon="Delete" @click="batchDelete(scope.selectedListIds)">
            批量删除超市
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="primary" link v-if="scope.row.userId !== 1" :icon="EditPen" @click="openDrawer('编辑', scope.row)">
            编辑
          </el-button>
          <el-button type="primary" link :icon="Delete" @click="deleteSupermarketHandle(scope.row)">删除</el-button>
        </template>
      </ProTable>
    </div>
    <SupermarketDrawer ref="drawerRef" />
  </div>
</template>

<script setup lang="tsx" name="Supermarket">
import { reactive, ref } from "vue";
import { Supermarket } from "@/api/interface/commonality";
import { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import ProTable from "@/components/ProTable/index.vue";
import { addSupermarket, deleteSupermarket, editSupermarket, getSupermarketList } from "@/api/modules/commonality";
import { CirclePlus, Delete, EditPen, View } from "@element-plus/icons-vue";
import { useHandleData } from "@/hooks/useHandleData";
import SupermarketDrawer from "./components/SupermarketDrawer.vue";

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
const columns = reactive<ColumnProps<Supermarket.ResSupermarket>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "序号", width: 80 },
  { prop: "name", label: "超市名称", search: { el: "input", tooltip: "请输入超市名称" } },
  {
    prop: "address",
    label: "超市地址"
  },
  {
    prop: "businessHours",
    label: "营业时间"
  },
  {
    prop: "principal",
    label: "联系人"
  },
  {
    prop: "tel",
    label: "联系电话"
  },
  {
    prop: "remark",
    label: "备注",
    width: 180
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除超市信息
const deleteSupermarketHandle = async (params: Supermarket.ResSupermarket) => {
  await useHandleData(deleteSupermarket, [params.id], `删除【${params.name}】超市`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  console.log(ids);

  await useHandleData(deleteSupermarket, ids, "批量删除超市");
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof SupermarketDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Supermarket.ResSupermarket> = {}) => {
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addSupermarket : title === "编辑" ? editSupermarket : undefined,
    getTableList: proTable.value?.getTableList
  };
  drawerRef.value?.acceptParams(params);
};
</script>

<style scoped></style>
