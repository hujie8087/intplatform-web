<template>
  <div class="main-box">
    <TreeFilter
      ref="treeFilterRef"
      title="区域列表(多选)"
      multiple
      label="title"
      :request-api="getAllBuildingTree"
      :default-value="treeFilterValues.ancestors"
      :check-strictly="true"
      @change="changeTreeFilter"
    />
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getRepairList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        :init-param="initParam"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增报修记录</el-button>
          <el-button type="danger" :disabled="!scope.isSelected" :icon="Delete" @click="batchDelete(scope.selectedListIds)">
            批量删除报修记录
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="success" link :icon="View" @click="openViewDrawer('查看', scope.row)">查看</el-button>
          <el-button type="danger" link :icon="Delete" @click="deleteRepairHandle(scope.row)">删除</el-button>
          <el-button
            type="warning"
            v-if="scope.row.repairState === 0 || scope.row.repairState === 2"
            link
            @click="openHandleDrawer('办理', scope.row)"
          >
            办理
          </el-button>
        </template>
      </ProTable>
      <RepairDrawer ref="drawerRef" />
      <RepairHandleDrawer ref="repairHandleDrawerRef" />
      <RepairViewDrawer ref="drawerViewRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="Repair">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import RepairDrawer from "./components/RepairDrawer.vue";
import RepairHandleDrawer from "./components/RepairHandleDrawer.vue";
import RepairViewDrawer from "./components/RepairViewDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, View } from "@element-plus/icons-vue";
import {
  getRepairList,
  deleteRepair,
  editRepair,
  addRepair,
  getRepairById,
  getRepairTypeList
} from "@/api/modules/service/repair";
import { Repair } from "@/api/interface/service/repair";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import TreeFilter from "@/components/TreeFilter/index.vue";
import { getAllBuildingTree } from "@/api/modules/food/building";

const { t } = useI18n(); // 解构出t方法
// 默认 treeFilter 参数
const treeFilterValues = reactive({ ancestors: [] as number[] });
const changeTreeFilter = (val: number[]) => {
  proTable.value!.pageable.pageNum = 1;
  treeFilterValues.ancestors = val;
  initParam.ancestors = treeFilterValues.ancestors.join(",");
};
const initParam = reactive({ ancestors: "" });
// 字典数据
const repairStateOptions = ref<DictOptions[]>([
  { label: "待维修", value: 0, tagType: "danger" },
  { label: "已维修", value: 1, tagType: "primary" },
  { label: "待返修", value: 2, tagType: "warning" },
  { label: "已完结", value: 3, tagType: "success" }
]);

const repairTypeOptions = ref<DictOptions[]>([]);

// 获取维修类型
const getRepairTypeData = async () => {
  const res = await getRepairTypeList({ status: "0", pageNum: 1, pageSize: 1000 });
  repairTypeOptions.value = res.rows.map(item => {
    return {
      label: item.name,
      value: item.id
    };
  });
};
getRepairTypeData();
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
const columns = reactive<ColumnProps<Repair.ResRepair>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "序号", width: 50 },
  { prop: "repairNo", label: "报修单编号", width: 140 },
  { prop: "repairArea", label: "报修区域", width: 100 },
  { prop: "roomNo", label: "房间号" },
  { prop: "repairMessage", label: "报修信息", search: { el: "input", tooltip: "请输入报修信息" } },
  { prop: "repairPerson", label: "报修人", search: { el: "input", tooltip: "请输入报修人" } },
  { prop: "tel", label: "联系电话" },
  { prop: "repairMan", label: "派单人", search: { el: "input", tooltip: "请输入派单人" } },
  {
    prop: "repairType",
    label: "维修类型",
    enum: repairTypeOptions,
    search: { el: "tree-select", props: { filterable: true } }
  },
  {
    prop: "repairState",
    label: "处理状态",
    enum: repairStateOptions,
    tag: true,
    width: 100,
    search: { el: "select", props: { filterable: true } }
  },
  {
    prop: "repairTime",
    label: "维修时间"
  },
  {
    prop: "repairNote",
    label: "维修备注",
    width: 120
  },
  {
    prop: "rating",
    label: "评分",
    width: 80
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除报修记录
const deleteRepairHandle = async (params: Repair.ResRepair) => {
  await useHandleData(deleteRepair, params.id, `删除报修记录`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteRepair, ids, t("main.deleteBatchMsg", { title: "报修记录" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const repairHandleDrawerRef = ref<InstanceType<typeof RepairHandleDrawer> | null>(null);
const openHandleDrawer = async (title: string, row: Partial<Repair.ResRepair> = {}) => {
  if (row.id) {
    const res = await getRepairById(row.id);
    row = res.data;
  }
  const params = {
    title,
    rowData: { ...row },
    api: editRepair,
    getTableList: proTable.value?.getTableList,
    repairTypeOptions: repairTypeOptions.value,
    repairStatusOptions: repairStateOptions.value
  };
  repairHandleDrawerRef.value?.acceptParams(params);
};

const treeFilterRef = ref<InstanceType<typeof TreeFilter>>();
// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof RepairDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Repair.ResRepair> = {}) => {
  if (row.id) {
    const res = await getRepairById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addRepair : title === "编辑" ? editRepair : undefined,
    getTableList: proTable.value?.getTableList,
    treeData: treeFilterRef.value?.treeData
  };
  drawerRef.value?.acceptParams(params);
}; // 打开 drawer(新增、查看、编辑)
const drawerViewRef = ref<InstanceType<typeof RepairViewDrawer> | null>(null);
const openViewDrawer = async (title: string, row: Partial<Repair.ResRepair> = {}) => {
  if (row.id) {
    const res = await getRepairById(row.id);
    row = res.data;
  }
  const params = {
    title,
    rowData: { ...row },
    repairTypeOptions: repairTypeOptions.value
  };
  drawerViewRef.value?.acceptParams(params);
};
</script>
