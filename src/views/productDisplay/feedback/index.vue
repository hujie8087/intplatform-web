<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getComplaintMessageList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        :init-param="{ typeId: 2 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button
            type="danger"
            :disabled="!scope.isSelected"
            v-auth="['productdisplay:wantEat:remove']"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除
          </el-button>
          <!-- 导出 -->
          <el-button type="primary" :icon="Download" @click="exportExcel">导出</el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button
            type="warning"
            link
            v-auth="['productdisplay:wantEat:edit']"
            v-if="scope.row.processingStatus === 0"
            @click="openDrawer('回复', scope.row)"
            >回复</el-button
          >
          <el-button
            type="danger"
            link
            v-auth="['productdisplay:wantEat:remove']"
            :icon="Delete"
            @click="deleteComplaintHandle(scope.row)"
          >
            删除
          </el-button>
        </template>
      </ProTable>
      <FeedbackDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="Feedback">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import FeedbackDrawer from "./components/FeedbackDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Delete, Download, View } from "@element-plus/icons-vue";
import {
  getComplaintMessageList,
  addComplaintMessage,
  editComplaintMessage,
  getComplaintMessageById,
  deleteComplaintMessage
} from "@/api/modules/service/complaint";
import { useI18n } from "vue-i18n";
import { useDict } from "@/hooks/useDict";
import { DictOptions } from "@/api/interface";
import { Complaint } from "@/api/interface/service/complaint";
import { ElMessageBox } from "element-plus";
import { useDownload } from "@/hooks/useDownload";
import dayjs from "dayjs";

const { t } = useI18n(); // 解构出t方法
const baseUrl = import.meta.env.VITE_API_URL;
// 字典数据
const sys_normal_disable = ref<DictOptions[]>([]);
useDict("sys_normal_disable").then(res => {
  sys_normal_disable.value = res.sys_normal_disable;
});

const processingStatusOptions = ref<DictOptions[]>([
  { label: "待回复", value: 0, tagType: "warning" },
  { label: "已回复", value: 1, tagType: "success" }
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
const columns = reactive<ColumnProps<Complaint.ResComplaintMessage>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "contacts", label: "联系人", width: 150, search: { el: "input" } },
  { prop: "phone", label: "联系电话", width: 150 },
  { prop: "def2", label: "工号", width: 150, search: { el: "input" } },
  { prop: "def1", label: "标题", width: 150 },
  { prop: "content", label: "内容" },
  {
    prop: "createTime",
    label: "提交时间",
    width: 150,
    render(scope) {
      return <>{dayjs(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss")}</>;
    }
  },
  { prop: "processingResults", label: "回复结果" },
  { prop: "handleBy", label: "回复人", search: { el: "input" } },
  { prop: "handleTime", label: "回复时间", width: 150 },
  {
    prop: "processingStatus",
    label: "回复状态",
    width: 100,
    enum: processingStatusOptions,
    tag: true,
    search: { el: "select", props: { filterable: true } }
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除反馈
const deleteComplaintHandle = async (params: Complaint.ResComplaintMessage) => {
  await useHandleData(deleteComplaintMessage, params.id, `删除【${params.contacts}】内容`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteComplaintMessage, ids, t("main.deleteBatchMsg", { title: "反馈" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof FeedbackDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Complaint.ResComplaintMessage> = {}) => {
  if (row.id) {
    const res = await getComplaintMessageById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    isReply: title === "回复",
    rowData: { ...row },
    api: title === "新增" ? addComplaintMessage : title === "回复" ? editComplaintMessage : undefined,
    getTableList: proTable.value?.getTableList,
    noticeStatusOptions: sys_normal_disable.value,
    processingStatusOptions: processingStatusOptions.value
  };
  drawerRef.value?.acceptParams(params);
};

// 导出

// 导出
const exportExcel = async () => {
  ElMessageBox.confirm("确认导出我想说数据?", "温馨提示", { type: "warning" }).then(() =>
    useDownload(`${baseUrl}/other/ComplaintMessage/export`, "我想说数据", true, ".xlsx", "post", { typeId: 2 })
  );
};
</script>
