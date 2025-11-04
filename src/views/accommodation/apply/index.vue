<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getApplyList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" v-auth="['other:oaUrl:add']" :icon="CirclePlus" @click="openDrawer('新增')"> 新增 </el-button>
          <el-button
            type="danger"
            v-auth="['other:oaUrl:remove']"
            :disabled="!scope.isSelected"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="warning" link :icon="Edit" v-auth="['other:oaUrl:edit']" @click="openDrawer('编辑', scope.row)">
            编辑
          </el-button>
          <el-button type="danger" link :icon="Delete" v-auth="['other:oaUrl:remove']" @click="deleteApplyHandle(scope.row)">
            删除
          </el-button>
          <!-- 审核 -->
          <el-button
            type="success"
            v-if="scope.row.status === '0'"
            link
            :icon="View"
            v-auth="['other:oaUrl:audit']"
            @click="auditApplyHandle(scope.row)"
          >
            审核
          </el-button>
        </template>
      </ProTable>
    </div>
    <ApplyDrawer ref="drawerRef" />
  </div>
</template>
<script setup lang="tsx" name="AccommodationApply">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, Edit, View } from "@element-plus/icons-vue";
import { getApplyList, deleteApply, getApplyById, addApply, editApply } from "@/api/modules/service/accommodation";
import { useI18n } from "vue-i18n";
import ApplyDrawer from "./components/ApplyDrawer.vue";
import { Accommodation } from "@/api/interface/service/accommodation";
import { DictOptions } from "@/api/interface";
import { useDict } from "@/hooks/useDict";

// const imageUrl = import.meta.env.VITE_IMAGE_URL;
const { t } = useI18n(); // 解构出t方法

// 字典数据
const applyTypeOptions = ref<DictOptions[]>([]);
useDict("apply_online_type").then(res => {
  applyTypeOptions.value = res.apply_online_type;
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

const statusOptions = [
  { label: "待审核", value: "0", tagType: "warning" },
  { label: "停用", value: "1", tagType: "danger" },
  { label: "已发布", value: "2", tagType: "success" }
];

// 表格配置项
const columns = reactive<ColumnProps<Accommodation.ResApply>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "序号", width: 50 },
  { prop: "title", label: "标题", search: { el: "input", tooltip: "请输入标题" } },
  // {
  //   prop: "img",
  //   label: "图片",
  //   width: 100,
  //   render: scope => {
  //     return (
  //       <el-image
  //         style="width: 35px; height: 35px"
  //         src={imageUrl + scope.row.img}
  //         zoom-rate={1.2}
  //         max-scale={7}
  //         min-scale={0.2}
  //         preview-src-list={[imageUrl + scope.row.img]}
  //         initial-index={4}
  //         fit="cover"
  //         preview-teleported
  //       />
  //     );
  //   }
  // },
  {
    prop: "formId",
    label: "表单id",
    width: 100
  },
  {
    prop: "icon",
    label: "图标",
    width: 100,
    render(scope) {
      return <span class="material-icons">{scope.row.icon}</span>;
    }
  },
  {
    prop: "isLogin",
    label: "是否登录",
    tag: true,
    width: 100,
    enum: [
      { label: "是", value: "1", tagType: "success" },
      { label: "否", value: "0", tagType: "danger" }
    ],
    search: {
      el: "select"
    }
  },
  { prop: "type", label: "流程类型", width: 100, enum: applyTypeOptions, tag: true, search: { el: "select" } },
  { prop: "sort", label: "排序", width: 100 },
  {
    prop: "status",
    label: "状态",
    tag: true,
    width: 100,
    enum: statusOptions,
    search: { el: "select" }
  },
  {
    prop: "remark",
    label: "备注",
    width: 200
  },
  { prop: "operation", label: "操作", width: 250, fixed: "right" }
]);

// 删除报修记录
const deleteApplyHandle = async (params: Accommodation.ResApply) => {
  await useHandleData(deleteApply, params.id, `删除内容`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteApply, ids, t("main.deleteBatchMsg", { title: "内容" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof ApplyDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Accommodation.ResApply> = {}) => {
  if (row.id) {
    const res = await getApplyById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addApply : title === "编辑" ? editApply : undefined,
    getTableList: proTable.value?.getTableList,
    applyTypeOptions: applyTypeOptions.value
  };
  drawerRef.value?.acceptParams(params);
};

// 审核
const auditApplyHandle = async (params: Accommodation.ResApply) => {
  await useHandleData(editApply, { id: params.id, status: "2" }, `发布【${params.title}】内容`);
  proTable.value?.getTableList();
};
</script>
