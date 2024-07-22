<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getConfigList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="configId"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增系统参数</el-button>
          <el-button type="danger" :disabled="!scope.isSelected" :icon="Delete" @click="batchDelete(scope.selectedListIds)">
            批量删除字典
          </el-button>
          <el-button type="primary" :icon="Download" plain @click="downloadFile">导出系统参数数据</el-button>
          <el-button type="warning" :icon="Refresh" @click="refreshCacheHandle">刷新缓存</el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="primary" link v-if="scope.row.userId !== 1" :icon="EditPen" @click="openDrawer('编辑', scope.row)">
            编辑
          </el-button>
          <el-button type="primary" link :icon="Delete" @click="deleteConfigHandle(scope.row)">删除</el-button>
        </template>
      </ProTable>
      <ConfigDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="ts" name="Config">
import { ref, reactive } from "vue";
import { ElMessageBox } from "element-plus";
import { useHandleData } from "@/hooks/useHandleData";
import { useDownload } from "@/hooks/useDownload";
import ProTable from "@/components/ProTable/index.vue";
import ConfigDrawer from "./components/ConfigDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, Download, View, Refresh } from "@element-plus/icons-vue";
import { getConfigList, deleteConfig, editConfig, addConfig, refreshCache, getConfigById } from "@/api/modules/system/config";
import { Config } from "@/api/interface/system";
import { yesOrNoOptions } from "@/utils/serviceDict";
import { useI18n } from "vue-i18n";
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
// 表格配置项
const columns = reactive<ColumnProps<Config.ResConfig>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "configId", label: "参数主键", width: 80 },
  { prop: "configName", label: "参数名称", search: { el: "input", tooltip: "请输入参数名称" } },
  { prop: "configKey", label: "参数键名", search: { el: "input", tooltip: "请输入参数键名" } },
  { prop: "configValue", label: "参数键值" },
  { prop: "configType", label: "系统内置", search: { el: "select" }, sortable: true, tag: true, enum: yesOrNoOptions },
  { prop: "remark", label: "备注" },
  {
    prop: "createTime",
    label: "创建时间",
    width: 180,
    sortable: true,
    search: { el: "date-picker", span: 2, props: { type: "datetimerange", valueFormat: "YYYY-MM-DD HH:mm:ss" } }
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除系统参数
const deleteConfigHandle = async (params: Config.ResConfig) => {
  await useHandleData(deleteConfig, params.configId, `删除【${params.configName}】系统参数`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteConfig, ids, t("main.deleteBatchMsg", { title: t("system.config.configName") }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 导出系统参数列表
const downloadFile = async () => {
  ElMessageBox.confirm("确认导出系统参数数据?", "温馨提示", { type: "warning" }).then(() =>
    useDownload("/system/config/export", "系统参数列表", true, ".xlsx", "post", proTable.value?.searchParam)
  );
};

// 刷新缓存
const refreshCacheHandle = async () => {
  await useHandleData(refreshCache, {}, "刷新字典缓存");
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof ConfigDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Config.ResConfig> = {}) => {
  if (row.configId) {
    const res = await getConfigById(row.configId);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addConfig : title === "编辑" ? editConfig : undefined,
    getTableList: proTable.value?.getTableList
  };
  drawerRef.value?.acceptParams(params);
};
</script>
