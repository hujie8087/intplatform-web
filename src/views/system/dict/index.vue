<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        :columns="columns"
        :request-api="getDictList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        :init-param="{}"
        row-key="dictId"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增字典</el-button>
          <el-button type="danger" :disabled="!scope.isSelected" :icon="Delete" @click="batchDelete(scope.selectedListIds)">
            批量删除字典
          </el-button>
          <el-button type="success" :icon="Download" @click="downloadHandle">导出</el-button>
          <el-button type="warning" :icon="Refresh" @click="refreshCacheHandle">刷新缓存</el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="success" link :icon="EditPen" @click="openDrawer('编辑', scope.row)">编辑</el-button>
          <el-button type="danger" v-if="scope.row.dictId !== 100" link :icon="Delete" @click="deleteDictHandle(scope.row)">
            删除
          </el-button>
        </template>
      </ProTable>
    </div>
    <DictDrawer ref="drawerRef" />
    <DictDataDrawer ref="dictDataDrawerRef" />
  </div>
</template>
<script setup lang="tsx" name="dictManage">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import DictDrawer from "./components/DictDrawer.vue";
import DictDataDrawer from "./components/DictDataDrawer.vue";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, Download, EditPen, Refresh } from "@element-plus/icons-vue";
import { getDictList, deleteDict, editDict, addDict, getDictById, refreshCache, exportDictInfo } from "@/api/modules/system/dict";
import { Dict } from "@/api/interface/system";
import { userStatus } from "@/utils/dict";
import { useI18n } from "vue-i18n";
import { ElMessageBox } from "element-plus";
import { useDownload } from "@/hooks/useDownload";
import { useRouter } from "vue-router";
const { t } = useI18n(); // 解构出t方法

const router = useRouter();
// ProTable 实例
const proTable = ref<ProTableInstance>();

const dataCallback = (data: any) => {
  return {
    list: data.rows,
    total: data.total
  };
};
// 表格配置项
const columns = reactive<ColumnProps<Dict.ResDict>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "dictId", label: "字典编号", width: 80 },
  { prop: "dictName", label: "字典名称", search: { el: "input" }, align: "center" },
  {
    prop: "dictType",
    label: "字典类型",
    search: { el: "input" },
    render: scope => {
      return (
        <el-button type="primary" link onClick={() => toDetail(scope.row)}>
          {scope.row.dictType}
        </el-button>
      );
    }
  },
  {
    prop: "status",
    label: "状态",
    width: 120,
    sortable: true,
    tag: true,
    enum: userStatus,
    search: { el: "select" }
  },
  { prop: "remark", label: "备注", width: 180 },
  {
    prop: "createTime",
    label: "创建时间",
    width: 180,
    search: { el: "date-picker", span: 2, props: { type: "datetimerange", valueFormat: "YYYY-MM-DD HH:mm:ss" } }
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);
const dictOptions = ref<Dict.ResDict[]>([]);
// 删除字段类型信息
const deleteDictHandle = async (params: Dict.ResDict) => {
  await useHandleData(deleteDict, params.dictId, `删除【${params.dictName}】字典`);
  proTable.value?.getTableList();
};

// 批量删除字典类型信息
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteDict, ids, t("main.deleteBatchMsg", { title: t("system.dict.dict") }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};
// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof DictDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Dict.ResDict> = {}) => {
  if (row.dictId) {
    const res = await getDictById(row.dictId);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addDict : title === "编辑" ? editDict : undefined,
    getTableList: proTable.value?.getTableList,
    dictOptions: dictOptions.value
  };
  drawerRef.value?.acceptParams(params);
};
// 刷新缓存
const refreshCacheHandle = async () => {
  await useHandleData(refreshCache, {}, "刷新字典缓存");
  proTable.value?.getTableList();
};
// 导出字典
const downloadHandle = async () => {
  ElMessageBox.confirm("确认导出字典数据?", "温馨提示", { type: "warning" }).then(() =>
    useDownload(exportDictInfo, "字典列表", proTable.value?.searchParam)
  );
};

const toDetail = (row: Dict.ResDict) => {
  router.push(`/system/dict/data?dictType=${row.dictType}`);
};
</script>
