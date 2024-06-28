<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getVideoLabelList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增影视标签</el-button>
          <el-button type="danger" :disabled="!scope.isSelected" :icon="Delete" @click="batchDelete(scope.selectedListIds)">
            批量删除影视标签
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="primary" link v-if="scope.row.userId !== 1" :icon="EditPen" @click="openDrawer('编辑', scope.row)">
            编辑
          </el-button>
          <el-button type="primary" link :icon="Delete" @click="deleteVideoLabelHandle(scope.row)">删除</el-button>
        </template>
      </ProTable>
    </div>
    <VideoLabelDrawer ref="drawerRef" />
  </div>
</template>

<script setup lang="tsx" name="VideoLabel">
import { reactive, ref } from "vue";
import { VideoLabel } from "@/api/interface/video";
import { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import ProTable from "@/components/ProTable/index.vue";
import { addVideoLabel, deleteVideoLabel, editVideoLabel, getVideoLabelList } from "@/api/modules/video";
import { CirclePlus, Delete, EditPen, View } from "@element-plus/icons-vue";
import { useHandleData } from "@/hooks/useHandleData";
import VideoLabelDrawer from "./components/VideoLabelDrawer.vue";
import { DictOptions } from "@/api/interface";
import { useDict } from "@/hooks/useDict";

// 字典数据
const video_label_type = ref<DictOptions[]>([]);
useDict("video_label_type").then(res => {
  video_label_type.value = res.video_label_type;
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
const columns = reactive<ColumnProps<VideoLabel.ResVideoLabel>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "序号", width: 80 },
  { prop: "labelType", label: "标签类型", tag: true, enum: video_label_type, search: { el: "select" } },
  { prop: "labelName", label: "影视标签", search: { el: "input", tooltip: "请输入影视标签" } },
  { prop: "def1", label: "是否多选" },
  {
    prop: "remark",
    label: "备注",
    width: 180
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除影视标签信息
const deleteVideoLabelHandle = async (params: VideoLabel.ResVideoLabel) => {
  await useHandleData(deleteVideoLabel, [params.id], `删除【${params.labelName}】影视标签`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteVideoLabel, ids, "批量删除影视标签");
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof VideoLabelDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<VideoLabel.ResVideoLabel> = {}) => {
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addVideoLabel : title === "编辑" ? editVideoLabel : undefined,
    getTableList: proTable.value?.getTableList,
    videoLabelType: video_label_type.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>

<style scoped></style>
