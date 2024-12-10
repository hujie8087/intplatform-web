<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getBusRoutesList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="configId"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增公交线路</el-button>
          <el-button type="danger" :disabled="!scope.isSelected" :icon="Delete" @click="batchDelete(scope.selectedListIds)">
            批量删除公交线路
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="warning" link v-if="scope.row.userId !== 1" :icon="EditPen" @click="openDrawer('编辑', scope.row)">
            编辑
          </el-button>
          <el-button type="danger" link :icon="Delete" @click="deleteBusRoutesHandle(scope.row)">删除</el-button>
        </template>
      </ProTable>
      <BusRoutesDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="BusRoutes">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import BusRoutesDrawer from "./components/BusRoutesDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, View } from "@element-plus/icons-vue";
import {
  getBusRoutesList,
  deleteBusRoutes,
  editBusRoutes,
  addBusRoutes,
  getBusRoutesById
} from "@/api/modules/transportation/busRoutes";
import { BusRoutes } from "@/api/interface/transportation";
import { useI18n } from "vue-i18n";

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

// 表格配置项
const columns = reactive<ColumnProps<BusRoutes.ResBusRoutes>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "clId", label: "序号", width: 80 },
  { prop: "lineName", label: "线路名称", search: { el: "input", tooltip: "请输入线路名称" } },
  {
    prop: "lineTime",
    label: "运营时间"
  },
  {
    prop: "linePath",
    label: "详细线路图",
    render: scope => {
      return (
        <el-image
          style="width: 100px; height: 100px"
          src={scope.row.linePath}
          zoom-rate="1.2"
          max-scale="7"
          min-scale="0.2"
          preview-src-list={[scope.row.linePath]}
          initial-index="4"
          fit="cover"
          preview-teleported
        />
      );
    }
  },
  {
    prop: "allPath",
    label: "总线路图",
    render: scope => {
      return (
        <el-image
          style="width: 100px; height: 100px"
          src={scope.row.allPath}
          zoom-rate="1.2"
          max-scale="7"
          min-scale="0.2"
          preview-src-list={[scope.row.allPath]}
          initial-index="4"
          fit="cover"
          preview-teleported
        />
      );
    }
  },
  {
    prop: "remark",
    label: "备注"
  },
  { prop: "createBy", label: "创建者", width: 180 },
  {
    prop: "createTime",
    label: "创建时间",
    width: 180,
    sortable: true
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除公交线路
const deleteBusRoutesHandle = async (params: BusRoutes.ResBusRoutes) => {
  await useHandleData(deleteBusRoutes, params.clId, `删除【${params.lineName}】公交线路`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteBusRoutes, ids, t("main.deleteBatchMsg", { title: t("system.config.configName") }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof BusRoutesDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<BusRoutes.ResBusRoutes> = {}) => {
  if (row.clId) {
    const res = await getBusRoutesById(row.clId);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addBusRoutes : title === "编辑" ? editBusRoutes : undefined,
    getTableList: proTable.value?.getTableList
  };
  drawerRef.value?.acceptParams(params);
};
</script>
