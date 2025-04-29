<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getProTableData"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="operId"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="danger" :disabled="!scope.isSelected" :icon="Delete" @click="batchDelete(scope.selectedListIds)">
            批量删除操作日志
          </el-button>
          <el-button type="warning" :icon="Delete" @click="cleanOperaLogHandle">清空系统日志</el-button>
          <el-button type="success" :icon="Download" plain @click="downloadFile">导出系统日志数据</el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="danger" link :icon="Delete" @click="deleteOperaLogHandle(scope.row)">删除</el-button>
        </template>
      </ProTable>
      <OperaLogDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="OperaLog">
import { ref, reactive } from "vue";
import { useDict } from "@/hooks/useDict";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import OperaLogDrawer from "./components/OperLogDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Delete, Download, View } from "@element-plus/icons-vue";
import { getOperaLogList, deleteOperaLog, cleanOperaLog } from "@/api/modules/system/log";
import { OperaLog } from "@/api/interface/system";
import { useI18n } from "vue-i18n";
import { ElMessageBox } from "element-plus";
import { useDownload } from "@/hooks/useDownload";
import { DictOptions } from "@/api/interface";
const { t } = useI18n(); // 解构出t方法
const baseUrl = import.meta.env.VITE_API_URL;
// ProTable 实例
const proTable = ref<ProTableInstance>();
const dataCallback = (data: any) => {
  return {
    list: data.rows.map((item: OperaLog.ResOperaLog) => {
      return {
        ...item,
        status: item.status.toString(),
        businessType: item.businessType.toString()
      };
    }),
    total: data.total
  };
};

const getProTableData = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  return getOperaLogList(newParams);
};

// 字典数据
const sys_oper_type = ref<DictOptions[]>([]);
const sys_common_status = ref<DictOptions[]>([]);
useDict("sys_common_status", "sys_oper_type").then(res => {
  sys_oper_type.value = res.sys_oper_type;
  sys_common_status.value = res.sys_common_status;
});

// 表格配置项
const columns = reactive<ColumnProps<OperaLog.ResOperaLog>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "operId", label: "日志编号", width: 80 },
  { prop: "title", label: "系统模块", search: { el: "input", tooltip: "请输入系统模块" } },
  { prop: "businessType", label: "操作类型", enum: sys_oper_type, tag: true, search: { el: "select" } },
  { prop: "operName", label: "操作人员", search: { el: "input", tooltip: "请输入操作人员" } },
  { prop: "operIp", label: "操作地址" },
  { prop: "operLocation", label: "操作地点" },
  { prop: "status", label: "操作状态", enum: sys_common_status, tag: true, search: { el: "select" } },
  {
    prop: "operTime",
    label: "操作时间",
    width: 180,
    sortable: true,
    search: { el: "date-picker", span: 2, props: { type: "datetimerange", valueFormat: "YYYY-MM-DD HH:mm:ss" } }
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除系统日志
const deleteOperaLogHandle = async (params: OperaLog.ResOperaLog) => {
  await useHandleData(deleteOperaLog, params.operId, `删除【${params.operName}】系统日志`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteOperaLog, ids.join(","), t("main.deleteBatchMsg", { title: t("system.config.configName") }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 清空系统日志
const cleanOperaLogHandle = async () => {
  await useHandleData(cleanOperaLog, null, "清空系统日志");
  proTable.value?.getTableList();
};

// 导出系统日志
const downloadFile = async () => {
  ElMessageBox.confirm("确认导出系统日志数据?", "温馨提示", { type: "warning" }).then(() =>
    useDownload(`${baseUrl}/system/operlog/export`, "系统日志列表", true, ".xlsx", "post", proTable.value?.searchParam)
  );
};
// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof OperaLogDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<OperaLog.ResOperaLog> = {}) => {
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row }
  };
  drawerRef.value?.acceptParams(params);
};
</script>
