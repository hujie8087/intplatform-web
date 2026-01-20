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
          <el-button type="primary" :icon="CirclePlus" v-auth="['food:QuotaRules:add']" @click="openDrawer('新增')"
            >新增额度规则</el-button
          >
          <el-button
            type="danger"
            :disabled="!scope.isSelected"
            v-auth="['food:QuotaRules:remove']"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除额度规则
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button
            type="warning"
            link
            v-if="scope.row.userId !== 1"
            v-auth="['food:QuotaRules:edit']"
            :icon="EditPen"
            @click="openDrawer('编辑', scope.row)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            link
            :icon="Delete"
            v-auth="['food:QuotaRules:remove']"
            @click="deleteQuotaRulesHandle(scope.row)"
            >删除</el-button
          >
        </template>
      </ProTable>
      <QuotaRulesDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="QuotaRules">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import QuotaRulesDrawer from "./components/QuotaRulesDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, View } from "@element-plus/icons-vue";
import { getQuotaRulesList, deleteQuotaRules, editQuotaRules, addQuotaRules, getQuotaRulesById } from "@/api/modules/onlineTopUp";
import { QuotaRules } from "@/api/interface/onlineTopUp";
import { useI18n } from "vue-i18n";
import { getOrganizeTree } from "@/api/modules/organize";
import { handleTree } from "@/utils/index";

const { t } = useI18n(); // 解构出t方法

// 获取组织主节点
const organizeTreeList = ref<{ label: string; value: number; pid: number; isLeaf: boolean; children?: any[] }[]>([]);
const getOrganizeTreeList = async () => {
  const res = await getOrganizeTree({
    dimensionCode: "iwip"
  });
  const flatList = res.data.map(item => {
    return {
      label: item.name,
      value: item.id,
      formatName: item.formatName,
      pid: item.pid,
      isLeaf: item.formatName.indexOf("/") === -1
    };
  });
  organizeTreeList.value = handleTree(flatList, "value", "pid");
};

getOrganizeTreeList();

const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  newParams.pageNum && (newParams.size = newParams.pageSize);
  newParams.pageSize && (newParams.current = newParams.pageNum);
  delete newParams.pageNum;
  delete newParams.pageSize;
  return getQuotaRulesList(newParams);
};
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

// 表格配置项
const columns = reactive<ColumnProps<QuotaRules.ResQuotaRules>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "id", label: "序号", width: 80 },
  { prop: "formatOrganizeName", label: "组织", search: { el: "input" } },
  { prop: "dayQuota", label: "天额度" },
  { prop: "monthQuota", label: "月额度" },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除额度规则
const deleteQuotaRulesHandle = async (params: QuotaRules.ResQuotaRules) => {
  await useHandleData(deleteQuotaRules, params.id, `删除额度规则`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteQuotaRules, ids, t("main.deleteBatchMsg", { title: "额度规则" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof QuotaRulesDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<QuotaRules.ResQuotaRules> = {}) => {
  if (row.id) {
    const res = await getQuotaRulesById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addQuotaRules : title === "编辑" ? editQuotaRules : undefined,
    getTableList: proTable.value?.getTableList,
    organizeTreeList: organizeTreeList.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
