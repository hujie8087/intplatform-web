<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getHiddenDangerList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader>
          <el-button type="primary" :icon="Download" v-auth="['commonality:repair:remove']" @click="exportHiddenDanger">
            导出
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" v-auth="['commonality:repair:view']" @click="openDrawer(scope.row)">
            查看
          </el-button>
          <el-button
            type="warning"
            v-if="scope.row.progress !== 2"
            link
            v-auth="['commonality:repair:edit']"
            @click="openHandleDrawer('办理', scope.row)"
          >
            处理
          </el-button>
        </template>
      </ProTable>
      <HiddenDangerDrawer ref="hiddenDangerDrawerRef" />
      <HiddenDangerHandleDrawer ref="hiddenDangerHandleDrawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="HiddenDanger">
import { ref, reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import HiddenDangerDrawer from "./components/HiddenDangerDrawer.vue";
import HiddenDangerHandleDrawer from "./components/HiddenDangerHandleDrawer.vue";
import { ProTableInstance, ColumnProps, RenderScope } from "@/components/ProTable/interface";
import { Download, View } from "@element-plus/icons-vue";
import { getHiddenDangerList, editHiddenDanger, getHiddenDangerDetail } from "@/api/modules/hiddenDanger";
import { HiddenDanger } from "@/api/interface/hiddenDanger";
import { DictOptions } from "@/api/interface";
import { useDownload } from "@/hooks/useDownload";
import { ElMessageBox } from "element-plus";
const fileUrl = import.meta.env.VITE_APP_BASE_FILE;
// 字典数据
const hiddenDangerStateOptions = ref<DictOptions[]>([
  { label: "待处理", value: 0, tagType: "danger" },
  { label: "处理中", value: 1, tagType: "primary" },
  { label: "已完成", value: 2, tagType: "warning" }
]);

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
const columns = reactive<ColumnProps<HiddenDanger.ResHiddenDanger>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "序号", width: 50 },
  { prop: "name", label: "隐患名称", width: 140 },
  { prop: "location", label: "隐患地点" },
  { prop: "describes", label: "隐患描述" },
  { prop: "reportPerson", label: "发现人", search: { el: "input", tooltip: "请输入发现人" }, width: 100 },
  { prop: "findTime", label: "发现时间", search: { el: "input", tooltip: "请输入发现时间" }, width: 150 },
  { prop: "tel", label: "联系电话", search: { el: "input", tooltip: "请输入联系电话" }, width: 100 },
  { prop: "handleBy", label: "处理人", search: { el: "input", tooltip: "请输入处理人" }, width: 100 },
  {
    prop: "url",
    label: "隐患图片",
    width: 100,
    render: (scope: RenderScope<HiddenDanger.ResHiddenDanger>) => {
      return (
        <el-image
          src={`${fileUrl}${scope.row.url.split(",")[0]}`}
          preview-src-list={scope.row.url.split(",").map(item => `${fileUrl}${item}`)}
          style={{ width: "50px", height: "50px" }}
          preview-teleported={true}
        />
      );
    }
  },
  { prop: "handleTime", label: "处理时间", width: 150 },
  {
    prop: "progress",
    label: "处理进度",
    enum: hiddenDangerStateOptions,
    tag: true,
    width: 100,
    search: { el: "select", props: { filterable: true } }
  },
  {
    prop: "handleResult",
    label: "处理结果",
    width: 120
  },
  { prop: "operation", label: "操作", width: 130, fixed: "right" }
]);

// 导出
const exportHiddenDanger = async () => {
  const baseUrl = import.meta.env.VITE_API_URL;
  ElMessageBox.confirm("确认导出隐患数据?", "温馨提示", { type: "warning" }).then(() =>
    useDownload(`${baseUrl}maintenance/hidden/danger/export`, "隐患列表", true, ".xlsx", "post", proTable.value?.searchParam)
  );
};

const hiddenDangerDrawerRef = ref<InstanceType<typeof HiddenDangerDrawer> | null>(null);
const openDrawer = async (row: Partial<HiddenDanger.ResHiddenDanger> = {}) => {
  const params = {
    title: "查看",
    rowData: { ...row },
    hiddenDangerStateOptions: hiddenDangerStateOptions.value
  };
  hiddenDangerDrawerRef.value?.acceptParams(params);
};

// 打开 drawer(新增、查看、编辑)
const hiddenDangerHandleDrawerRef = ref<InstanceType<typeof HiddenDangerHandleDrawer> | null>(null);
const openHandleDrawer = async (title: string, row: Partial<HiddenDanger.ResHiddenDanger> = {}) => {
  if (row.id) {
    const res = await getHiddenDangerDetail(row.id);
    row = res.data;
  }
  const params = {
    title,
    rowData: { ...row },
    api: editHiddenDanger,
    getTableList: proTable.value?.getTableList,
    hiddenDangerStatusOptions: hiddenDangerStateOptions.value
  };
  hiddenDangerHandleDrawerRef.value?.acceptParams(params);
};
</script>
