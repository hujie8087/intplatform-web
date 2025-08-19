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
          <el-button type="primary" v-mealAuth="['system:time:add']" :icon="CirclePlus" @click="openDrawer('新增')"
            >新增</el-button
          >
          <el-button
            type="danger"
            :disabled="!scope.isSelected"
            v-mealAuth="['system:time:remove']"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="default" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="primary" link :icon="Edit" v-mealAuth="['system:time:edit']" @click="openDrawer('编辑', scope.row)"
            >编辑</el-button
          >
          <el-button type="danger" link v-mealAuth="['system:time:remove']" :icon="Delete" @click="deleteSiteHandle(scope.row)"
            >删除</el-button
          >
        </template>
      </ProTable>
    </div>
    <BasicTimeDrawer ref="drawerRef" />
  </div>
</template>
<script setup lang="tsx" name="BasicTime">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import BasicTimeDrawer from "./components/BasicTimeDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Delete, Edit, View, CirclePlus } from "@element-plus/icons-vue";
import { listTime, delTime, getTimeById, addTime, updateTime } from "@/api/modules/mdc/system/order/time";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import { BasicTime } from "@/api/interface/mealDelivery/basic/time";
import { useDict } from "@/hooks/useDict";

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
  return listTime(newParams);
};

// 获取餐饮名称数据字典
const foodTypeOptions = ref<DictOptions[]>([]);
useDict("food_type").then(res => {
  foodTypeOptions.value = res.food_type;
});

// 表格配置项
const columns = reactive<ColumnProps<BasicTime.ResBasicTime>[]>([
  { type: "selection", fixed: "left", width: 50 },
  {
    prop: "tType",
    label: "餐饮名称",
    enum: foodTypeOptions,
    tag: true
  },
  {
    prop: "beginTime",
    label: "班组报餐时间",
    render(scope) {
      return (
        <span>
          {scope.row.beginTime}~{scope.row.endTime}
        </span>
      );
    }
  },
  {
    prop: "deptBeginTime",
    label: "部门开始时间",
    render(scope) {
      return (
        <span>
          {scope.row.deptBeginTime}~{scope.row.deptEndTime}
        </span>
      );
    }
  },
  { prop: "createBy", label: "创建人" },
  { prop: "createTime", label: "创建时间" },
  { prop: "updateBy", label: "修改人" },
  { prop: "updateTime", label: "修改时间" },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除站点
const deleteSiteHandle = async (params: BasicTime.ResBasicTime) => {
  await useHandleData(delTime, params.tId.toString(), `删除【${params.beginTime}】站点`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(delTime, ids, t("main.deleteBatchMsg", { title: "站点" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof BasicTimeDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<BasicTime.ResBasicTime> = {}) => {
  if (row.tId) {
    const res = await getTimeById(row.tId.toString());
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addTime : title === "编辑" ? updateTime : undefined,
    getTableList: proTable.value?.getTableList,
    foodTypeOptions: foodTypeOptions.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
