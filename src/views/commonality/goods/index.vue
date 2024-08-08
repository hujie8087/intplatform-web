<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getGoodsList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增商品</el-button>
          <el-button type="danger" :disabled="!scope.isSelected" :icon="Delete" @click="batchDelete(scope.selectedListIds)">
            批量删除商品
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="primary" link v-if="scope.row.userId !== 1" :icon="EditPen" @click="openDrawer('编辑', scope.row)">
            编辑
          </el-button>
          <el-button type="primary" link :icon="Delete" @click="deleteGoodsHandle(scope.row)">删除</el-button>
        </template>
      </ProTable>
    </div>
    <GoodsDrawer ref="drawerRef" />
  </div>
</template>

<script setup lang="tsx" name="Goods">
import { reactive, ref } from "vue";
import { Goods } from "@/api/interface/commonality";
import { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import ProTable from "@/components/ProTable/index.vue";
import { addGoods, deleteGoods, editGoods, getGoodsList } from "@/api/modules/commonality";
import { CirclePlus, Delete, EditPen, View } from "@element-plus/icons-vue";
import { useHandleData } from "@/hooks/useHandleData";
import GoodsDrawer from "./components/GoodsDrawer.vue";

// const baseUrl = import.meta.env.VITE_API_URL;

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
const columns = reactive<ColumnProps<Goods.ResGoods>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "序号", width: 80 },
  { prop: "name", label: "商品名称", search: { el: "input", tooltip: "请输入商品名称" } },
  {
    prop: "code",
    label: "商品编码"
  },
  {
    prop: "price",
    label: "商品价格"
  },
  {
    prop: "spec",
    label: "规格"
  },
  {
    prop: "listImage",
    label: "列表图片",
    render: scope => {
      return (
        <el-image
          style="width: 100px; height: 100px"
          src={scope.row.listImage}
          zoom-rate={1.2}
          max-scale={7}
          min-scale={0.2}
          preview-src-list={[scope.row.listImage]}
          initial-index={4}
          fit="cover"
          preview-teleported
        />
      );
    }
  },
  {
    prop: "remark",
    label: "备注",
    width: 180
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除商品信息
const deleteGoodsHandle = async (params: Goods.ResGoods) => {
  await useHandleData(deleteGoods, [params.id], `删除【${params.name}】商品`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  console.log(ids);

  await useHandleData(deleteGoods, ids, "批量删除商品");
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof GoodsDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Goods.ResGoods> = {}) => {
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addGoods : title === "编辑" ? editGoods : undefined,
    getTableList: proTable.value?.getTableList
  };
  drawerRef.value?.acceptParams(params);
};
</script>

<style scoped></style>
