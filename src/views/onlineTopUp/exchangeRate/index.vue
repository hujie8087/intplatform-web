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
          <el-button type="primary" :icon="CirclePlus" v-auth="['food:ExchangeRate:add']" @click="openDrawer('新增')"
            >新增汇率</el-button
          >
          <el-button
            type="danger"
            :disabled="!scope.isSelected"
            v-auth="['food:ExchangeRate:remove']"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除汇率
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button
            type="warning"
            link
            v-if="scope.row.userId !== 1"
            v-auth="['food:ExchangeRate:edit']"
            :icon="EditPen"
            @click="openDrawer('编辑', scope.row)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            link
            :icon="Delete"
            v-auth="['food:ExchangeRate:remove']"
            @click="deleteExchangeRateHandle(scope.row)"
            >删除</el-button
          >
        </template>
      </ProTable>
      <ExchangeRateDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="ExchangeRate">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import ExchangeRateDrawer from "./components/ExchangeRateDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, View } from "@element-plus/icons-vue";
import {
  getExchangeRateList,
  deleteExchangeRate,
  editExchangeRate,
  addExchangeRate,
  getExchangeRateById
} from "@/api/modules/onlineTopUp";
import { ExchangeRate } from "@/api/interface/onlineTopUp";
import { useI18n } from "vue-i18n";

const { t } = useI18n(); // 解构出t方法

// ProTable 实例
const proTable = ref<ProTableInstance>();
const dataCallback = (data: any) => {
  return {
    list: data.data.list,
    total: data.data.total,
    current: data.data.current,
    size: data.data.size
  };
};
const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  newParams.pageNum && (newParams.size = newParams.pageSize);
  newParams.pageSize && (newParams.current = newParams.pageNum);
  delete newParams.pageNum;
  delete newParams.pageSize;
  return getExchangeRateList(newParams);
};
// 表格配置项
const columns = reactive<ColumnProps<ExchangeRate.ResExchangeRate>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "id", label: "序号", width: 80 },
  { prop: "yearMonth", label: "月份", search: { el: "input" } },
  { prop: "currency", label: "币种" },
  { prop: "exchangeRate", label: "汇率" },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除汇率
const deleteExchangeRateHandle = async (params: ExchangeRate.ResExchangeRate) => {
  await useHandleData(deleteExchangeRate, params.id, `删除汇率`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteExchangeRate, ids, t("main.deleteBatchMsg", { title: "汇率" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof ExchangeRateDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<ExchangeRate.ResExchangeRate> = {}) => {
  if (row.id) {
    const res = await getExchangeRateById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addExchangeRate : title === "编辑" ? editExchangeRate : undefined,
    getTableList: proTable.value?.getTableList
  };
  drawerRef.value?.acceptParams(params);
};
</script>
