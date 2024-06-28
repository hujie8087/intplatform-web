<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getVideoTypeList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增影视分类</el-button>
          <el-button type="danger" :disabled="!scope.isSelected" :icon="Delete" @click="batchDelete(scope.selectedListIds)">
            批量删除影视分类
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="primary" link v-if="scope.row.userId !== 1" :icon="EditPen" @click="openDrawer('编辑', scope.row)">
            编辑
          </el-button>
          <el-button type="primary" link :icon="Delete" @click="deleteVideoTypeHandle(scope.row)">删除</el-button>
        </template>
      </ProTable>
    </div>
    <VideoTypeDrawer ref="drawerRef" />
  </div>
</template>

<script setup lang="tsx" name="VideoType">
import { reactive, ref } from "vue";
import { VideoType } from "@/api/interface/video";
import { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import ProTable from "@/components/ProTable/index.vue";
import { addVideoType, deleteVideoType, editVideoType, getVideoTypeList } from "@/api/modules/video";
import { CirclePlus, Delete, EditPen, View } from "@element-plus/icons-vue";
import { useHandleData } from "@/hooks/useHandleData";
import VideoTypeDrawer from "./components/VideoTypeDrawer.vue";

// const baseUrl = import.meta.env.VITE_API_URL;

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
const columns = reactive<ColumnProps<VideoType.ResVideoType>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "序号", width: 80 },
  { prop: "typeName", label: "影视分类", search: { el: "input", tooltip: "请输入影视分类" } },
  {
    prop: "remark",
    label: "备注",
    width: 180
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除影视分类信息
const deleteVideoTypeHandle = async (params: VideoType.ResVideoType) => {
  await useHandleData(deleteVideoType, [params.id], `删除【${params.typeName}】影视分类`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  console.log(ids);

  await useHandleData(deleteVideoType, ids, "批量删除影视分类");
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof VideoTypeDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<VideoType.ResVideoType> = {}) => {
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addVideoType : title === "编辑" ? editVideoType : undefined,
    getTableList: proTable.value?.getTableList
  };
  drawerRef.value?.acceptParams(params);
};
</script>

<style scoped></style>
