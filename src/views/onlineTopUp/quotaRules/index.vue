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
          <el-button type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增额度规则</el-button>
          <el-button type="danger" :disabled="!scope.isSelected" :icon="Delete" @click="batchDelete(scope.selectedListIds)">
            批量删除额度规则
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="warning" link :icon="EditPen" @click="openDrawer('编辑', scope.row)"> 编辑 </el-button>
          <el-button type="danger" link :icon="Delete" @click="deleteQuotaRulesHandle(scope.row)">删除</el-button>
        </template>
      </ProTable>
      <QuotaRulesDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="QuotaRules">
import { ref, reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import QuotaRulesDrawer from "./components/QuotaRulesDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, View } from "@element-plus/icons-vue";
import { getQuotaRulesList, deleteQuotaRules, editQuotaRules, addQuotaRules, getQuotaRulesById } from "@/api/modules/onlineTopUp";
import { QuotaRules } from "@/api/interface/onlineTopUp";
import { getOrganizeTree } from "@/api/modules/organize";
import { handleTree } from "@/utils/index";
import { ElMessage, ElMessageBox } from "element-plus";

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
  ElMessageBox.confirm(`是否删除${params.formatOrganizeName}的额度规则?`, "温馨提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
    draggable: true
  })
    .then(async () => {
      const res = await deleteQuotaRules([params.id]);
      proTable.value?.getTableList();
      if (!res) return;
      ElMessage({
        type: "success",
        message: `删除${params.formatOrganizeName}的额度规则成功!`
      });
    })
    .catch(() => {
      // cancel operation
    });
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  ElMessageBox.confirm(`是否删除选中的${ids.length}条数据?`, "温馨提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
    draggable: true
  })
    .then(async () => {
      const res = await deleteQuotaRules(ids);
      proTable.value?.clearSelection();
      proTable.value?.getTableList();
      if (!res) return;
      ElMessage({
        type: "success",
        message: `删除选中的${ids.length}条数据成功!`
      });
    })
    .catch(() => {
      // cancel operation
    });
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
