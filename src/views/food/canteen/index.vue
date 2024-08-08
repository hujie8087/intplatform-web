<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getCanteenList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="noticeId"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增餐厅</el-button>
          <el-button type="danger" :disabled="!scope.isSelected" :icon="Delete" @click="batchDelete(scope.selectedListIds)">
            批量删除通知
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="primary" link v-if="scope.row.userId !== 1" :icon="EditPen" @click="openDrawer('编辑', scope.row)">
            编辑
          </el-button>
          <el-button type="primary" link :icon="Delete" @click="deleteCanteenHandle(scope.row)">删除</el-button>
        </template>
      </ProTable>
      <CanteenDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="ts" name="Canteen">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import CanteenDrawer from "./components/CanteenDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, View } from "@element-plus/icons-vue";
import { getCanteenList, deleteCanteen, editCanteen, addCanteen, getCanteenById } from "@/api/modules/food/canteen";
import { Canteen } from "@/api/interface/food/canteen";
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
const columns = reactive<ColumnProps<Canteen.ResCanteen>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "id", label: "序号", width: 80 },
  { prop: "name", label: "餐厅名称", search: { el: "input", tooltip: "请输入餐厅名称" } },
  { prop: "code", label: "餐厅编码", search: { el: "input", tooltip: "请输入餐厅编码" } },
  { prop: "startTime", label: "营业开始时间" },
  { prop: "endTime", label: "营业结束时间" },
  { prop: "bookTable", label: "是否支持订桌" },
  { prop: "pickup", label: "是否支持外卖" },
  { prop: "addressId", label: "配送区域" },
  {
    prop: "status",
    label: "状态",
    enum: sys_normal_disable,
    sortable: true,
    tag: true,
    width: 100
  },
  {
    prop: "createTime",
    label: "创建时间",
    width: 180,
    sortable: true
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除餐厅
const deleteCanteenHandle = async (params: Canteen.ResCanteen) => {
  await useHandleData(deleteCanteen, params.id, `删除【${params.id}】餐厅`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteCanteen, ids, t("main.deleteBatchMsg", { title: "餐厅" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof CanteenDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Canteen.ResCanteen> = {}) => {
  if (row.id) {
    const res = await getCanteenById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addCanteen : title === "编辑" ? editCanteen : undefined,
    getTableList: proTable.value?.getTableList,
    noticeStatusOptions: sys_normal_disable.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
