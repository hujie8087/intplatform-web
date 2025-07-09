<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        :columns="columns"
        :request-api="getTableList"
        :data-callback="dataCallback"
        :init-param="initParam"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" v-auth="['car:site:add']" :icon="CirclePlus" @click="openDrawer(1)">新增</el-button>
          <el-button
            type="danger"
            v-auth="['car:site:remove']"
            :icon="Delete"
            plain
            @click="batchDelete(scope.selectedListIds)"
            :disabled="!scope.isSelected"
          >
            批量删除
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link @click="openDrawer(2, scope.row)">{{ $t("main.view") }}</el-button>
          <el-button
            type="warning"
            v-auth="['car:site:edit']"
            link
            v-if="scope.row.roleId !== 1"
            @click="openDrawer(3, scope.row)"
            >{{ $t("main.edit") }}</el-button
          >
          <el-button
            type="danger"
            v-auth="['car:site:remove']"
            link
            v-if="scope.row.roleId !== 1"
            @click="deleteAccount(scope.row)"
            >{{ $t("main.delete") }}</el-button
          >
        </template>
      </ProTable>
      <StationDrawer ref="drawerRef" />
    </div>
  </div>
</template>

<script setup lang="tsx" name="busStation">
import { ref, reactive, computed } from "vue";
import { ColumnProps } from "@/components/ProTable/interface";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import StationDrawer from "./components/StationDrawer.vue";
import { CirclePlus, Delete } from "@element-plus/icons-vue";
import {
  getBusStationList,
  addBusStation,
  editBusStation,
  deleteBusStation,
  getBusStationById
} from "@/api/modules/service/other";
import { useI18n } from "vue-i18n";
import { BusStation } from "@/api/interface/bus";
import { commonStatus } from "@/utils/serviceDict";
const { t } = useI18n(); // 解构出t方法
// 获取 ProTable 元素，调用其获取刷新数据方法（还能获取到当前查询参数，方便导出携带参数）
const proTable = ref();
// 如果表格需要初始化请求参数，直接定义传给 ProTable(之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({ type: "0" });
// dataCallback 是对于返回的表格数据做处理，如果你后台返回的数据不是 list && total && pageNum && pageSize 这些字段，那么你可以在这里进行处理成这些字段
// 或者直接去 hooks/useTable.ts 文件中把字段改为你后端对应的就行

const dataCallback = (data: any) => {
  return {
    list: data.rows,
    total: data.total,
    current: data.current,
    size: data.size
  };
};

// 如果你想在请求之前对当前请求参数做一些操作，可以自定义如下函数：params 为当前所有的请求参数（包括分页），最后返回请求列表接口
// 默认不做操作就直接在 ProTable 组件上绑定	:requestApi="getRoleList"
const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  newParams.typeName && (newParams.typeName = "custom-" + newParams.typeName);
  return getBusStationList(newParams);
};

// 页面按钮权限（按钮权限既可以使用 hooks，也可以直接使用 v-auth 指令，指令适合直接绑定在按钮上，hooks 适合根据按钮权限显示不同的内容）
// const { BUTTONS } = useAuthButtons();
const columns = computed((): ColumnProps[] => [
  { type: "selection", fixed: "left", width: 50 },
  {
    prop: "name",
    label: "名称",
    search: { el: "input" }
  },
  {
    prop: "indonesianName",
    label: "印尼名称"
  },
  {
    prop: "longitude",
    label: "经度",
    width: 150
  },
  {
    prop: "latitude",
    label: "纬度",
    width: 150
  },
  {
    prop: "sort",
    label: "排序",
    width: 120,
    render(scope) {
      return (
        <el-input-number
          style="width: 100px"
          controls-position="right"
          v-model={scope.row.sort}
          min={1}
          onChange={val => changeSort(val, scope.row)}
        />
      );
    }
  },
  {
    prop: "status",
    label: "状态",
    enum: commonStatus,
    tag: true,
    width: 80,
    search: { el: "select" }
  },
  { prop: "createTime", label: "创建时间", width: 160 },
  { prop: "operation", label: "操作", fixed: "right", width: 230 }
]);

// 删除角色信息
const deleteAccount = async (params: BusStation.ResBusStation) => {
  await useHandleData(deleteBusStation, params.id, t("main.deleteMsg", { msg: params.name }));
  proTable.value.getTableList();
};

// 批量删除角色信息
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteBusStation, ids, t("main.deleteBatchMsg"));
  proTable.value.clearSelection();
  proTable.value.getTableList();
};

const changeSort = async (val: number, row: BusStation.ResBusStation) => {
  await useHandleData(editBusStation, { ...row, sort: val }, `调整${row.name}排序`);
  proTable.value.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref();
const openDrawer = async (num: number, rowData: Partial<BusStation.ResBusStation> = {}) => {
  let busStationInfo = {};
  let title;
  switch (num) {
    case 1:
      title = t("main.add");
      break;
    case 2:
      title = t("main.view");
      break;
    case 3:
      title = t("main.edit");
      break;
    default:
      break;
  }
  if (num !== 1) {
    const { data } = await getBusStationById(rowData.id as number);
    busStationInfo = data;
  }
  let params = {
    title,
    rowData: { ...busStationInfo },
    isView: num === 2,
    api: num === 1 ? addBusStation : num === 3 ? editBusStation : "",
    getTableList: proTable.value.getTableList
  };
  drawerRef.value.acceptParams(params);
};
</script>
