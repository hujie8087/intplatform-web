<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getBusesList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="configId"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增车辆信息</el-button>
          <el-button type="danger" :disabled="!scope.isSelected" :icon="Delete" @click="batchDelete(scope.selectedListIds)">
            批量删除车辆信息
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="primary" link v-if="scope.row.userId !== 1" :icon="EditPen" @click="openDrawer('编辑', scope.row)">
            编辑
          </el-button>
          <el-button type="primary" link :icon="Delete" @click="deleteBusesHandle(scope.row)">删除</el-button>
        </template>
      </ProTable>
      <BusesDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="Buses">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import BusesDrawer from "./components/BusesDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, View } from "@element-plus/icons-vue";
import { getBusesList, deleteBuses, editBuses, addBuses, getBusesById } from "@/api/modules/transportation/buses";
import { Buses } from "@/api/interface/transportation";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import { getDictDataByType } from "@/api/modules/system/dict";
const { t } = useI18n(); // 解构出t方法
// 字典数据
const car_run_status = ref<DictOptions[]>([]);
const car_model_list = ref<DictOptions[]>([]);

const getDictData = async () => {
  const res = await getDictDataByType("car_run_status");
  car_run_status.value = res.data.map(item => {
    return {
      label: item.dictLabel,
      value: item.dictValue,
      tagType: item.listClass
    };
  });
  const res2 = await getDictDataByType("car_model_list");
  car_model_list.value = res2.data.map(item => {
    return {
      label: item.dictLabel,
      value: item.dictValue,
      tagType: item.listClass
    };
  });
};
getDictData();

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
const columns = reactive<ColumnProps<Buses.ResBuses>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "cmId", label: "序号", width: 80 },
  { prop: "parkNo", label: "车辆编号", search: { el: "input", tooltip: "请输入车辆编号" } },
  {
    prop: "lineNo",
    label: "车辆线路"
  },
  {
    prop: "path",
    label: "车辆图片",
    render: scope => {
      return (
        <el-image
          style="width: 100px; height: 100px"
          src={scope.row.path}
          zoom-rate="1.2"
          max-scale="7"
          min-scale="0.2"
          preview-src-list={[scope.row.path]}
          initial-index="4"
          fit="cover"
          preview-teleported
        />
      );
    }
  },
  {
    prop: "carType",
    label: "车型",
    enum: car_model_list,
    tag: true,
    search: { el: "select" }
  },
  {
    prop: "loadNumber",
    label: "荷载人数"
  },

  {
    prop: "carState",
    label: "车辆状态",
    enum: car_run_status,
    tag: true,
    search: { el: "select" }
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

// 删除车辆信息
const deleteBusesHandle = async (params: Buses.ResBuses) => {
  await useHandleData(deleteBuses, params.cmId, `删除【${params.parkNo}】车辆信息`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteBuses, ids, t("main.deleteBatchMsg", { title: t("system.config.configName") }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof BusesDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Buses.ResBuses> = {}) => {
  if (row.cmId) {
    const res = await getBusesById(row.cmId);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addBuses : title === "编辑" ? editBuses : undefined,
    getTableList: proTable.value?.getTableList,
    carRunStatus: car_run_status.value,
    carModelList: car_model_list.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
