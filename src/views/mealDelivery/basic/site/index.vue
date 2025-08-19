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
          <el-button type="primary" v-mealAuth="['system:site:add']" :icon="CirclePlus" @click="openDrawer('新增')"
            >新增</el-button
          >
          <el-button
            type="danger"
            :disabled="!scope.isSelected"
            v-mealAuth="['system:site:remove']"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="default" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="primary" link :icon="Edit" v-mealAuth="['system:site:edit']" @click="openDrawer('编辑', scope.row)"
            >编辑</el-button
          >
          <el-button type="danger" link v-mealAuth="['system:site:remove']" :icon="Delete" @click="deleteSiteHandle(scope.row)">
            删除
          </el-button>
        </template>
      </ProTable>
    </div>
    <BasicSiteDrawer ref="drawerRef" />
  </div>
</template>
<script setup lang="tsx" name="BasicSite">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import BasicSiteDrawer from "./components/BasicSiteDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Delete, Edit, View, CirclePlus } from "@element-plus/icons-vue";
import { listSite, delSite, getSite, addSite, updateSite, changeSiteStatus } from "@/api/modules/mdc/system/order/site";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import { DeliveryStation } from "@/api/interface/delivery/station";
import { getAllCarNameList, getAllMessHallNameList } from "@/api/modules/mdc/system";
import { BasicSite } from "@/api/interface/mealDelivery/basic/site";
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
  return listSite(newParams);
};

// 获取食堂列表
const messHallListOptions = ref<DictOptions[]>([]);
const getMessHallList = async () => {
  const res = await getAllMessHallNameList();
  messHallListOptions.value = res.data.map(item => ({
    label: item.fdName,
    value: item.fdId
  }));
};
getMessHallList();

// 获取车辆列表
const carList = ref<DictOptions[]>([]);
const getCarList = async () => {
  const res = await getAllCarNameList();
  carList.value = res.data.map(item => ({
    label: item.fcName,
    value: item.fcId
  }));
};
getCarList();

// 出餐方式
const foodTypeOptions = ref<DictOptions[]>([
  { label: "中国餐", value: "0" },
  { label: "印尼餐", value: "1" },
  { label: "桶装水", value: "2" }
]);

// 表格配置项
const columns = reactive<ColumnProps<BasicSite.ResBasicSite>[]>([
  { type: "selection", fixed: "left", width: 50 },
  {
    prop: "fsAddressCn",
    label: "地址(中文)",
    width: 150,
    search: { el: "input" }
  },
  { prop: "fsAddressEn", label: "地址(英文)", width: 150 },
  { prop: "fsAddressId", label: "地址(印尼)", width: 150 },
  { prop: "fsMessHallId", label: "食堂", width: 250, enum: messHallListOptions, search: { el: "select" } },
  { prop: "fcName", label: "车号", width: 100 },
  { prop: "fcId", label: "车号", isShow: false, enum: carList, search: { el: "select" } },
  { prop: "nationType", label: "餐饮", enum: foodTypeOptions, tag: true },
  {
    prop: "status",
    label: "状态",
    width: 80,
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
            return useHandleData(changeSiteStatus, scope.row.fsId.toString(), `修改【${scope.row.fsAddressCn}】站点状态`);
          }}
        />
      );
    }
  },
  { prop: "remark", label: "备注" },
  { prop: "createBy", label: "创建人", width: 100 },
  { prop: "createTime", label: "创建时间", width: 150 },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除站点
const deleteSiteHandle = async (params: BasicSite.ResBasicSite) => {
  await useHandleData(delSite, params.fsId.toString(), `删除【${params.fsAddressCn}】站点`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(delSite, ids, t("main.deleteBatchMsg", { title: "站点" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof BasicSiteDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<DeliveryStation.ResDeliveryStation> = {}) => {
  if (row.id) {
    const res = await getSite(row.id.toString());
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addSite : title === "编辑" ? updateSite : undefined,
    getTableList: proTable.value?.getTableList,
    messHallListOptions: messHallListOptions.value,
    carListOptions: carList.value,
    foodTypeOptions: foodTypeOptions.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
