<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getNoticeList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="noticeId"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" v-auth="['system:notice:add']" :icon="CirclePlus" @click="openDrawer('新增')"
            >新增系统通知</el-button
          >
          <el-button
            type="danger"
            v-auth="['system:notice:remove']"
            :disabled="!scope.isSelected"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除通知
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" v-auth="['system:notice:query']" link :icon="View" @click="openDrawer('查看', scope.row)"
            >查看</el-button
          >
          <el-button
            type="primary"
            v-auth="['system:notice:edit']"
            link
            v-if="scope.row.userId !== 1"
            :icon="EditPen"
            @click="openDrawer('编辑', scope.row)"
          >
            编辑
          </el-button>
          <el-button type="primary" v-auth="['system:notice:remove']" link :icon="Delete" @click="deleteNoticeHandle(scope.row)"
            >删除</el-button
          >
        </template>
      </ProTable>
      <NoticeDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="Notice">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import NoticeDrawer from "./components/NoticeDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, View } from "@element-plus/icons-vue";
import { getNoticeList, deleteNotice, editNotice, addNotice, getNoticeById } from "@/api/modules/system/notice";
import { Notice } from "@/api/interface/system";
import { useI18n } from "vue-i18n";
import { useDict } from "@/hooks/useDict";
import { DictOptions } from "@/api/interface";

const { t } = useI18n(); // 解构出t方法

// 字典数据
const sys_notice_status = ref<DictOptions[]>([]);
const sys_notice_type = ref<DictOptions[]>([]);
useDict("sys_notice_status", "sys_notice_type").then(res => {
  sys_notice_status.value = res.sys_notice_status;
  sys_notice_type.value = res.sys_notice_type;
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
const columns = reactive<ColumnProps<Notice.ResNotice>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "noticeId", label: "序号", width: 80 },
  { prop: "noticeTitle", label: "公告标题", search: { el: "input", tooltip: "请输入公告标题" } },
  { prop: "createDept", label: "发布部门", width: 180, search: { el: "input", tooltip: "请输入发布部门" } },
  {
    prop: "noticeType",
    label: "公告类型",
    width: 180,
    enum: sys_notice_type,
    tag: true,
    search: { el: "select", tooltip: "请输入公告类型" }
  },
  {
    prop: "status",
    label: "状态",
    enum: sys_notice_status,
    sortable: true,
    tag: true,
    width: 100
  },
  { prop: "createBy", label: "创建者", width: 180, search: { el: "input", tooltip: "请输入创建者" } },
  {
    prop: "createTime",
    label: "创建时间",
    width: 180,
    sortable: true
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除系统通知
const deleteNoticeHandle = async (params: Notice.ResNotice) => {
  await useHandleData(deleteNotice, params.noticeId, `删除【${params.noticeTitle}】系统通知`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteNotice, ids, t("main.deleteBatchMsg", { title: "通知新闻" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof NoticeDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Notice.ResNotice> = {}) => {
  if (row.noticeId) {
    const res = await getNoticeById(row.noticeId);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addNotice : title === "编辑" ? editNotice : undefined,
    getTableList: proTable.value?.getTableList,
    noticeTypeOptions: sys_notice_type.value,
    noticeStatusOptions: sys_notice_status.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
