<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getCleanList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" v-auth="['clean:project:add']" :icon="CirclePlus" @click="openDrawer('新增')">
            新增
          </el-button>
          <el-button
            type="danger"
            v-auth="['clean:project:remove']"
            :disabled="!scope.isSelected"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="warning" link :icon="Edit" v-auth="['clean:project:edit']" @click="openDrawer('编辑', scope.row)">
            编辑
          </el-button>
          <el-button type="danger" link :icon="Delete" v-auth="['clean:project:remove']" @click="deleteCleanHandle(scope.row)">
            删除
          </el-button>
        </template>
      </ProTable>
    </div>
    <CleanDrawer ref="drawerRef" />
  </div>
</template>
<script setup lang="tsx" name="AccommodationClean">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, Edit, View } from "@element-plus/icons-vue";
import { getCleanList, deleteClean, getCleanById, addClean, editClean } from "@/api/modules/service/accommodation";
import { useI18n } from "vue-i18n";
import CleanDrawer from "./components/CleanDrawer.vue";
import { Accommodation } from "@/api/interface/service/accommodation";
import { commonStatus } from "@/utils/serviceDict";
import { DictOptions } from "@/api/interface";
import { getBuildingFirstList } from "@/api/modules/system/role";
import { Building } from "@/api/interface/productDisplay/building";

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
const buildingOptions = ref<Building.ResBuilding[]>([]);
const getBuildingList = async () => {
  const res = await getBuildingFirstList();
  buildingOptions.value = res.data;
};

getBuildingList();
// 收费类别
const chargeTypeOptions = ref<DictOptions[]>([
  {
    label: "深度保洁",
    value: 0,
    tagType: "success"
  },
  {
    label: "专项保洁",
    value: 1,
    tagType: "warning"
  }
]);
// 表格配置项
const columns = reactive<ColumnProps<Accommodation.ResClean>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "序号", width: 50 },
  { prop: "chargeType", label: "收费类别", enum: chargeTypeOptions, tag: true, search: { el: "select" } },
  { prop: "projectDetails", label: "项目详情" },
  { prop: "chargePrice", label: "收费价格" },
  { prop: "chargeMethod", label: "收费方式" },
  { prop: "belongingCompany", label: "所属公司" },
  {
    prop: "ancestors",
    label: "所属区域",
    render: scope => {
      return scope.row.ancestors
        .split(",")
        .map(areaId => buildingOptions.value.find(item => item.id === Number(areaId))?.title)
        .join(",");
    }
  },
  {
    prop: "status",
    label: "状态",
    tag: true,
    enum: commonStatus,
    search: { el: "select" }
  },
  {
    prop: "remark",
    label: "备注"
  },
  { prop: "operation", label: "操作", width: 250, fixed: "right" }
]);

// 删除报修记录
const deleteCleanHandle = async (params: Accommodation.ResClean) => {
  await useHandleData(deleteClean, params.id, `删除项目`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteClean, ids, t("main.deleteBatchMsg", { title: "项目" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof CleanDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Accommodation.ResClean> = {}) => {
  if (row.id) {
    const res = await getCleanById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addClean : title === "编辑" ? editClean : undefined,
    getTableList: proTable.value?.getTableList,
    chargeTypeOptions: chargeTypeOptions.value,
    buildingOptions: buildingOptions.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
