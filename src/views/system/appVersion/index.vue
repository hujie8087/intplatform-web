<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        :columns="columns"
        :request-api="getAppVersionList"
        :data-callback="dataCallback"
        :init-param="{}"
        row-key="postId"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增app版本</el-button>
          <el-button type="danger" :disabled="!scope.isSelected" :icon="Delete" @click="batchDelete(scope.selectedListIds)">
            批量删除app版本
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="success" link :icon="EditPen" @click="openDrawer('编辑', scope.row)">编辑</el-button>
          <el-button type="danger" v-if="scope.row.postId !== 100" link :icon="Delete" @click="deleteAppVersionHandle(scope.row)">
            删除
          </el-button>
        </template>
      </ProTable>
    </div>
    <AppVersionDrawer ref="drawerRef" />
  </div>
</template>
<script setup lang="ts" name="appVersion">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import AppVersionDrawer from "./components/AppVersionDrawer.vue";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen } from "@element-plus/icons-vue";
import {
  getAppVersionList,
  deleteAppVersion,
  editAppVersion,
  addAppVersion,
  getAppVersionById
} from "@/api/modules/system/appVersion";
import { AppVersion } from "@/api/interface/system";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import { useDict } from "@/hooks/useDict";
const { t } = useI18n(); // 解构出t方法

// 字典数据
const app_version_status = ref<DictOptions[]>([]);
const app_system_status = ref<DictOptions[]>([]);
useDict("app_version_status", "app_system_status").then(res => {
  app_version_status.value = res.app_version_status;
  app_system_status.value = res.app_system_status;
});

// ProTable 实例
const proTable = ref<ProTableInstance>();

const dataCallback = (data: any) => {
  return {
    list: data.rows,
    total: data.total
  };
};
// 表格配置项
const columns = reactive<ColumnProps<AppVersion.ResAppVersion>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", width: 50 },
  {
    prop: "system",
    label: t("system.app.system"),
    align: "center",
    tag: true,
    enum: app_system_status,
    search: { el: "select" }
  },
  { prop: "versionName", label: t("system.app.name") },
  { prop: "versionCode", label: t("system.app.version"), search: { el: "input" }, align: "center" },
  {
    prop: "updateType",
    label: t("system.app.updateType"),
    align: "center",
    tag: true,
    enum: app_version_status,
    search: { el: "select" }
  },
  { prop: "apkUrl", label: t("system.app.path") },
  { prop: "apkSize", label: t("system.app.apkSize") + "(Kb)" },
  { prop: "updateLog", label: t("system.app.content") },
  { prop: "createTime", label: t("main.createTime"), width: 180 },
  { prop: "operation", label: t("main.operation"), width: 330, fixed: "right" }
]);
// 删除用户信息
const deleteAppVersionHandle = async (params: AppVersion.ResAppVersion) => {
  await useHandleData(deleteAppVersion, params.id, `删除【${params.versionName}】app版本`);
  proTable.value?.getTableList();
};

// 批量删除app版本信息
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteAppVersion, ids, t("main.deleteBatchMsg", { title: t("system.app.name") }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};
// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof AppVersionDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<AppVersion.ResAppVersion> = {}) => {
  if (row.id) {
    const res = await getAppVersionById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addAppVersion : title === "编辑" ? editAppVersion : undefined,
    getTableList: proTable.value?.getTableList,
    updateTypeOptions: app_version_status.value,
    systemOptions: app_system_status.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
