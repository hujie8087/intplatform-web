<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        :columns="columns"
        :request-api="listCompany"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 6, lg: 6, xl: 6 }"
        :init-param="{}"
        row-key="companyId"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" v-mealAuth="['system:company:add']" :icon="CirclePlus" @click="openDrawer('新增')"
            >新增公司</el-button
          >
          <el-button
            type="danger"
            v-mealAuth="['system:company:remove']"
            :disabled="!scope.isSelected"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除公司
          </el-button>
          <!-- 导出 -->
          <el-button type="warning" v-mealAuth="['system:company:export']" :icon="Download" @click="exportExcel">导出</el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button
            type="warning"
            v-mealAuth="['system:company:edit']"
            link
            :icon="EditPen"
            @click="openDrawer('编辑', scope.row)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            v-mealAuth="['system:company:remove']"
            v-if="scope.row.companyId !== 100"
            link
            :icon="Delete"
            @click="deleteCompanyHandle(scope.row)"
          >
            删除
          </el-button>
        </template>
      </ProTable>
    </div>
    <CompanyDrawer ref="drawerRef" />
  </div>
</template>
<script setup lang="ts" name="companyManage">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import CompanyDrawer from "./components/CompanyDrawer.vue";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, Download, EditPen } from "@element-plus/icons-vue";
import { listCompany, delCompany, updateCompany, getCompany, addCompany } from "@/api/modules/mdc/system/company";
import { Company } from "@/api/interface/mealDelivery/system/company";
import { useI18n } from "vue-i18n";
import { commonStatus } from "@/utils/serviceDict";
import { useDownload } from "@/hooks/useDownload";
import { ElMessageBox } from "element-plus";
const { t } = useI18n(); // 解构出t方法

// ProTable 实例
const proTable = ref<ProTableInstance>();

const dataCallback = (data: any) => {
  return {
    list: data.rows,
    total: data.total
  };
};
// 表格配置项
const columns = reactive<ColumnProps<Company.ResCompany>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "companyCode", label: "company.companyCode", search: { el: "input" }, align: "center" },
  { prop: "companyName", label: "company.companyName", search: { el: "input" }, align: "center" },
  {
    prop: "status",
    label: "company.status",
    width: 120,
    sortable: true,
    tag: true,
    enum: commonStatus,
    search: { el: "select" }
  },
  { prop: "createTime", label: "main.createTime", width: 180 },
  { prop: "operation", label: "main.operation", width: 330, fixed: "right" }
]);
// 删除用户信息
const deleteCompanyHandle = async (params: Company.ResCompany) => {
  await useHandleData(delCompany, params.companyId, `删除【${params.companyName}】公司`);
  proTable.value?.getTableList();
};

// 批量删除岗位信息
const batchDelete = async (ids: number[]) => {
  await useHandleData(delCompany, ids, t("main.deleteBatchMsg", { title: t("system.company.company") }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};
// 导出
const baseUrl = import.meta.env.VITE_API_URL;
const exportExcel = () => {
  ElMessageBox.confirm("确认导出公司数据?", "温馨提示", { type: "warning" }).then(() =>
    useDownload(`${baseUrl}/system/mdc/company/export`, "公司列表", true, ".xlsx", "post", proTable.value?.searchParam)
  );
};
// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof CompanyDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Company.ResCompany> = {}) => {
  if (row.companyId) {
    const res = await getCompany(row.companyId);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addCompany : title === "编辑" ? updateCompany : undefined,
    getTableList: proTable.value?.getTableList
  };
  drawerRef.value?.acceptParams(params);
};
</script>
