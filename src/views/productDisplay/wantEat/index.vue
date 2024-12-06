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
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
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
      <WantEatDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="WantEat">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import WantEatDrawer from "./components/WantEatDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Delete, View } from "@element-plus/icons-vue";
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

const { t } = useI18n(); // 解构出t方法

// 字典数据
const sys_normal_disable = ref<DictOptions[]>([]);
useDict("sys_normal_disable").then(res => {
  sys_normal_disable.value = res.sys_normal_disable;
});

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
  { prop: "id", label: "序号", width: 80 },
  { prop: "contacts", label: "联系人", width: 150 },
  { prop: "phone", label: "联系电话", width: 150 },
  { prop: "def2", label: "工号", width: 150 },
  { prop: "def1", label: "菜名", width: 150 },
  { prop: "content", label: "做法" },
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
const drawerRef = ref<InstanceType<typeof WantEatDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Complaint.ResComplaintMessage> = {}) => {
  if (row.id) {
    const res = await getComplaintMessageById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addComplaintMessage : title === "编辑" ? editComplaintMessage : undefined,
    getTableList: proTable.value?.getTableList,
    noticeStatusOptions: sys_normal_disable.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
