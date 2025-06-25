<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getTableList"
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
    <BasicCarInfoDrawer ref="drawerRef" />
  </div>
</template>
<script setup lang="tsx" name="BasicCarInfo">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import BasicCarInfoDrawer from "./components/BasicCarInfoDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Delete, Edit, View, CirclePlus } from "@element-plus/icons-vue";
import {
  listCarInfo,
  delCarInfo,
  getCarInfo,
  addCarInfo,
  updateCarInfo,
  changeCarInfoStatus
} from "@/api/modules/mdc/system/order/carInfo";
import { useI18n } from "vue-i18n";
import { BasicCarInfo } from "@/api/interface/mealDelivery/basic/carInfo";
import { userStatus } from "@/utils/serviceDict";

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

const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  return listCarInfo(newParams);
};

// 表格配置项
const columns = reactive<ColumnProps<BasicCarInfo.ResBasicCarInfo>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "序号", width: 80 },
  {
    prop: "fcName",
    label: "车号",
    search: { el: "input" }
  },
  {
    prop: "status",
    label: "状态",
    enum: userStatus,
    search: {
      el: "select"
    },
    render(scope) {
      return (
        <el-switch
          v-model={scope.row.status}
          active-value="0"
          inactive-value="1"
          before-change={() => {
            return useHandleData(changeCarInfoStatus, scope.row.fcId.toString(), `修改【${scope.row.fcName}】车辆状态`);
          }}
        />
      );
    }
  },
  { prop: "createBy", label: "创建人" },
  { prop: "createTime", label: "创建时间" },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除反馈
const deleteDeliveryStationHandle = async (params: BasicCarInfo.ResBasicCarInfo) => {
  await useHandleData(delCarInfo, params.fcId.toString(), `删除【${params.fcName}】车辆`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(delCarInfo, ids, t("main.deleteBatchMsg", { title: "车辆" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof BasicCarInfoDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<BasicCarInfo.ResBasicCarInfo> = {}) => {
  if (row.fcId) {
    const res = await getCarInfo(row.fcId.toString());
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addCarInfo : title === "编辑" ? updateCarInfo : undefined,
    getTableList: proTable.value?.getTableList
  };
  drawerRef.value?.acceptParams(params);
};
</script>
