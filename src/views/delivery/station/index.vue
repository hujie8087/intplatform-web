<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getDeliveryStationList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增</el-button>
          <el-button
            type="danger"
            :disabled="!scope.isSelected"
            v-auth="['delivery:staff:remove']"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="default" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="primary" link :icon="Edit" @click="openDrawer('编辑', scope.row)">编辑</el-button>
          <el-button
            type="danger"
            link
            v-auth="['delivery:staff:remove']"
            :icon="Delete"
            @click="deleteDeliveryStationHandle(scope.row)"
          >
            删除
          </el-button>
        </template>
      </ProTable>
    </div>
    <DeliveryStationDrawer ref="drawerRef" />
  </div>
</template>
<script setup lang="tsx" name="DeliveryStation">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import DeliveryStationDrawer from "./components/DeliveryStationDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Delete, Edit, View, CirclePlus } from "@element-plus/icons-vue";
import {
  getDeliveryStationList,
  deleteDeliveryStation,
  getDeliveryStationById,
  addDeliveryStation,
  editDeliveryStation
} from "@/api/modules/delivery/station";
import { useI18n } from "vue-i18n";
import { useDict } from "@/hooks/useDict";
import { DictOptions } from "@/api/interface";
import { DeliveryStation } from "@/api/interface/delivery/station";

const { t } = useI18n(); // 解构出t方法

// 字典数据
const statusOptions = ref<DictOptions[]>([]);
const sourceTypeOptions = ref<DictOptions[]>([]);
useDict("sys_normal_disable", "source_type").then(res => {
  statusOptions.value = res.sys_normal_disable;
  sourceTypeOptions.value = res.source_type;
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
const columns = reactive<ColumnProps<DeliveryStation.ResDeliveryStation>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "序号", width: 80 },
  {
    prop: "sourceType",
    label: "来源类型",
    enum: sourceTypeOptions,
    width: 150,
    tag: true,
    search: { el: "select", props: { filterable: true } }
  },
  { prop: "code", label: "站点编码", width: 100 },
  { prop: "sourceStation", label: "站点名称", width: 250, search: { el: "input" } },
  { prop: "contacts", label: "联系人", width: 150, search: { el: "input" } },
  { prop: "tel", label: "联系电话", width: 200, search: { el: "input" } },
  { prop: "address", label: "地址" },
  {
    prop: "status",
    label: "状态",
    width: 100,
    enum: statusOptions,
    search: {
      el: "select"
    },
    tag: true
  },
  { prop: "remark", label: "备注" },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除反馈
const deleteDeliveryStationHandle = async (params: DeliveryStation.ResDeliveryStation) => {
  await useHandleData(deleteDeliveryStation, params.id, `删除【${params.sourceStation}】配送站点`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteDeliveryStation, ids, t("main.deleteBatchMsg", { title: "配送站点" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof DeliveryStationDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<DeliveryStation.ResDeliveryStation> = {}) => {
  if (row.id) {
    const res = await getDeliveryStationById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addDeliveryStation : title === "编辑" ? editDeliveryStation : undefined,
    getTableList: proTable.value?.getTableList,
    sourceTypeOptions: sourceTypeOptions.value,
    statusOptions: statusOptions.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
