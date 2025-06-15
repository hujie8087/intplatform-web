<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable ref="proTable" :columns="columns" :request-api="getTableList" :data-callback="dataCallback">
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" v-auth="['car:line:add']" :icon="CirclePlus" @click="openDrawer(1)">新增</el-button>
          <el-button
            type="danger"
            v-auth="['car:line:remove']"
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
            v-auth="['car:line:edit']"
            link
            v-if="scope.row.roleId !== 1"
            @click="openDrawer(3, scope.row)"
            >{{ $t("main.edit") }}</el-button
          >
          <el-button
            type="danger"
            v-auth="['car:line:remove']"
            link
            v-if="scope.row.roleId !== 1"
            @click="deleteAccount(scope.row)"
            >{{ $t("main.delete") }}</el-button
          >
        </template>
      </ProTable>
      <LineDrawer ref="drawerRef" />
    </div>
  </div>
</template>

<script setup lang="tsx" name="busLine">
import { ref, computed } from "vue";
import { ColumnProps } from "@/components/ProTable/interface";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import LineDrawer from "./components/LineDrawer.vue";
import { CirclePlus, Delete } from "@element-plus/icons-vue";
import {
  getBusLineList,
  addBusLine,
  editBusLine,
  deleteBusLine,
  getBusLineById,
  getBusStationList,
  getBusDepartureList,
  updateBusLineStatus
} from "@/api/modules/service/other";
import { useI18n } from "vue-i18n";
import { BusDeparture, BusLine, BusStation } from "@/api/interface/bus";
import { commonStatus } from "@/utils/serviceDict";
import { DictOptions } from "@/api/interface";

const { t } = useI18n(); // 解构出t方法
// 获取 ProTable 元素，调用其获取刷新数据方法（还能获取到当前查询参数，方便导出携带参数）
const proTable = ref();
const fileUrl = import.meta.env.VITE_APP_BASE_FILE;
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

const lineTypeOptions = ref<DictOptions[]>([
  {
    label: "单程",
    value: 1,
    tagType: "success"
  },
  {
    label: "往返",
    value: 2,
    tagType: "warning"
  },
  {
    label: "环线",
    value: 3,
    tagType: "danger"
  }
]);
const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  newParams.typeName && (newParams.typeName = "custom-" + newParams.typeName);
  return getBusLineList(newParams);
};

// 获取所有时刻表
const departureTimeList = ref<BusDeparture.ResBusDeparture[]>([]);
const getDepartureTime = async () => {
  const { rows } = await getBusDepartureList({ pageNum: 1, pageSize: 10000 });
  departureTimeList.value = rows;
};
getDepartureTime();

const columns = computed((): ColumnProps[] => [
  { type: "selection", fixed: "left", width: 50 },
  {
    prop: "lineName",
    label: "名称",
    search: { el: "input" },
    width: 120
  },
  {
    prop: "carSiteList",
    label: "站点",
    render(scope) {
      const stationList = getStationList(scope.row.lineType, scope.row.carSiteList);
      if (!stationList.length) return <span>-</span>;

      return (
        <div class="station-list">
          <el-steps align-center active={stationList.length} space={100}>
            {stationList.map((item: BusStation.ResBusStation, index: number) => (
              <el-step key={`${scope.row.clId}-${item.id}-${index}`} title={item.name} />
            ))}
          </el-steps>
        </div>
      );
    }
  },
  {
    prop: "lineType",
    label: "线路类型",
    enum: lineTypeOptions,
    search: { el: "select" },
    width: 100,
    tag: true
  },
  {
    prop: "lineDetails",
    label: "线路详情",
    width: 120
  },
  {
    prop: "linePath",
    label: "线路图片",
    width: 120,
    render(scope) {
      return (
        <el-image
          preview-teleported
          src={fileUrl + scope.row.linePath}
          preview-src-list={[fileUrl + scope.row.linePath]}
          style={{ width: "80px", height: "80px" }}
        />
      );
    }
  },
  {
    prop: "remark",
    label: "备注",
    width: 120
  },
  {
    prop: "status",
    label: "状态",
    enum: commonStatus,
    tag: true,
    width: 80,
    search: { el: "select" },
    render(scope) {
      return (
        <el-switch
          v-model={scope.row.status}
          active-value={0}
          inactive-value={1}
          active-text="启用"
          inactive-text="禁用"
          inline-prompt
          beforeChange={() => handleStatusChange(scope.row)}
        />
      );
    }
  },
  { prop: "createTime", label: "创建时间", width: 160 },
  { prop: "operation", label: "操作", fixed: "right", width: 230 }
]);

// 获取线路站点
const lineStationList = ref<BusStation.ResBusStation[]>([]);
const getLineStation = async () => {
  const { rows } = await getBusStationList({ pageNum: 1, pageSize: 10000 });
  lineStationList.value = rows;
};
getLineStation();
// 删除线路信息
const deleteAccount = async (params: BusLine.ResBusLine) => {
  await useHandleData(deleteBusLine, params.clId, t("main.deleteMsg", { msg: params.lineName }));
  proTable.value.getTableList();
};

// 批量删除线路信息
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteBusLine, ids, t("main.deleteBatchMsg"));
  proTable.value.clearSelection();
  proTable.value.getTableList();
};

const getStationList = (lineType: number, carSiteList: BusStation.ResBusStation[]) => {
  if (!carSiteList || !carSiteList.length) return [];

  let stationList: BusStation.ResBusStation[] = [];
  switch (lineType) {
    case 1: // 单程
      stationList = [...carSiteList];
      break;
    case 2: // 往返
      stationList = [...carSiteList, ...carSiteList.slice(0, -1).reverse()];
      break;
    case 3: // 环线
      stationList = [...carSiteList, carSiteList[0]];
      break;
    default:
      stationList = [...carSiteList];
  }
  return stationList;
};

// 修改线路状态
const handleStatusChange = async (rowData: Partial<BusLine.ResBusLine>) => {
  await useHandleData(updateBusLineStatus, rowData.clId, "修改线路状态");
  proTable.value.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref();
const openDrawer = async (num: number, rowData: Partial<BusLine.ResBusLine> = {}) => {
  let busLineInfo = {};
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
    const { data } = await getBusLineById(rowData.clId as number);
    busLineInfo = data;
  }
  let params = {
    title,
    rowData: { ...busLineInfo },
    isView: num === 2,
    api: num === 1 ? addBusLine : num === 3 ? editBusLine : "",
    getTableList: proTable.value.getTableList,
    station: lineStationList.value,
    departureTime: departureTimeList.value,
    lineTypeOptions: lineTypeOptions.value
  };
  drawerRef.value.acceptParams(params);
};
</script>

<style lang="scss" scoped>
.station-list {
  :deep(.el-steps) {
    padding: 0 20px;
    .el-step__title {
      max-width: 100px;
      overflow: hidden;
      font-size: 12px;
      line-height: 1.2;
      text-overflow: ellipsis;
      white-space: nowrap;
      &.is-success {
        color: #67c23a;
      }
    }
    .el-step__head {
      &.is-success {
        color: #67c23a;
        border-color: #67c23a;
      }
    }
  }
}
</style>
