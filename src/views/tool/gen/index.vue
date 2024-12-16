<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable ref="proTable" highlight-current-row :columns="columns" :request-api="listTable" :data-callback="dataCallback">
        <!-- 表格 header 按钮 -->
        <template #tableHeader>
          <!-- <el-button type="primary" :icon="Upload" plain @click="batchAdd">批量添加用户</el-button>
          <el-button type="primary" :icon="Download" plain @click="downloadFile">导出用户数据</el-button> -->
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button link type="primary" icon="View" @click="handlePreview(scope.row)">预览</el-button>
          <el-button type="warning" link icon="edit" @click="openDrawer(scope.row)"> 编辑 </el-button>
          <!-- <el-button type="primary" link :icon="Delete" @click="deleteBusesHandle(scope.row)">删除</el-button> -->
        </template>
      </ProTable>
      <PreviewDrawer ref="previewDrawer" />
      <EditGenDrawer ref="editGenDrawerRef" />
      <ImportExcel ref="dialogRef" />
    </div>
  </div>
</template>
<script setup lang="ts" name="gen">
import { ref, reactive, watch } from "vue";
import { ElMessage } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import ImportExcel from "@/components/ImportExcel/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { editGenTable, getGenTable, listTable, previewTable } from "@/api/modules/tool/gen";
import { Account } from "@/api/interface/system";
import { Gen } from "@/api/interface/tool";
import PreviewDrawer from "./components/previewDrawer.vue";
import EditGenDrawer from "./components/editGenDrawer.vue";
import { getDictSelect } from "@/api/modules/system/dict";

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
const columns = reactive<ColumnProps<Account.ResAccountList>[]>([
  { type: "selection", label: "", width: 80 },
  { type: "index", label: "序号", width: 80 },
  { prop: "tableName", label: "表名称", search: { el: "input", tooltip: "请输入表名称" } },
  { prop: "tableComment", label: "表描述", search: { el: "input", tooltip: "请输入表描述" } },
  { prop: "className", label: "实体" },
  { prop: "createTime", label: "创建时间", width: 180, sortable: true },
  { prop: "updateTime", label: "更新时间", width: 180, sortable: true },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

watch(
  () => proTable.value?.radio,
  () => proTable.value?.radio && ElMessage.success(`选中 id 为【${proTable.value?.radio}】的数据`)
);

// 预览
const previewDrawer = ref<InstanceType<typeof PreviewDrawer> | null>(null);
const handlePreview = async (row: Partial<Gen.ResGenList> = {}) => {
  if (!row.tableId) return;
  const res = await previewTable(row.tableId!);
  const params = {
    title: "代码预览",
    rowData: { ...res.data }
  };
  previewDrawer.value?.acceptParams(params);
};

// 编辑
const editGenDrawerRef = ref<InstanceType<typeof EditGenDrawer> | null>(null);
const openDrawer = async (row: Partial<Gen.ResGenList> = {}) => {
  if (!row.tableId) return;
  const res = await getGenTable(row.tableId!);
  const dictOptions = await getDictSelect();
  const params = {
    rowData: { ...row },
    info: res.data.info,
    rows: res.data.rows,
    tables: res.data.tables,
    dictOptions: dictOptions.data,
    api: editGenTable,
    getTableList: proTable.value?.getTableList
  };
  editGenDrawerRef.value?.acceptParams(params);
};
</script>
