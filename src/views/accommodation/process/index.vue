<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getProcessList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" v-auth="['other:accommodationProcess:add']" :icon="CirclePlus" @click="openDrawer('新增')">
            新增
          </el-button>
          <el-button
            type="danger"
            v-auth="['other:accommodationProcess:delete']"
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
          <el-button
            type="warning"
            link
            :icon="Edit"
            v-auth="['other:accommodationProcess:edit']"
            @click="openDrawer('编辑', scope.row)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            link
            :icon="Delete"
            v-auth="['other:accommodationProcess:delete']"
            @click="deleteProcessHandle(scope.row)"
          >
            删除
          </el-button>
          <!-- 审核 -->
          <el-button
            type="success"
            v-if="scope.row.status === '0'"
            link
            :icon="View"
            v-auth="['other:accommodationProcess:audit']"
            @click="auditProcessHandle(scope.row)"
          >
            审核
          </el-button>
        </template>
      </ProTable>
    </div>
    <ProcessDrawer ref="drawerRef" />
  </div>
</template>
<script setup lang="tsx" name="AccommodationProcess">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, Edit, View } from "@element-plus/icons-vue";
import { getProcessList, deleteProcess, getProcessById, addProcess, editProcess } from "@/api/modules/service/accommodation";
import { useI18n } from "vue-i18n";
import ProcessDrawer from "./components/ProcessDrawer.vue";
import { Accommodation } from "@/api/interface/service/accommodation";

const imageUrl = import.meta.env.VITE_IMAGE_URL;
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

const statusOptions = [
  { label: "待审核", value: "0", tagType: "warning" },
  { label: "停用", value: "1", tagType: "danger" },
  { label: "已发布", value: "2", tagType: "success" }
];

// 表格配置项
const columns = reactive<ColumnProps<Accommodation.ResProcess>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "序号", width: 50 },
  { prop: "title", label: "标题", search: { el: "input", tooltip: "请输入标题" } },
  { prop: "content", label: "内容" },
  { prop: "requirements", label: "要求" },
  {
    prop: "img",
    label: "图片",
    render: scope => {
      return (
        <el-image
          style="width: 35px; height: 35px"
          src={imageUrl + scope.row.img}
          zoom-rate={1.2}
          max-scale={7}
          min-scale={0.2}
          preview-src-list={[imageUrl + scope.row.img]}
          initial-index={4}
          fit="cover"
          preview-teleported
        />
      );
    }
  },
  {
    prop: "isLogin",
    label: "是否登录",
    tag: true,
    enum: [
      { label: "是", value: "1", tagType: "success" },
      { label: "否", value: "0", tagType: "danger" }
    ],
    search: {
      el: "select"
    }
  },
  { prop: "sort", label: "排序" },
  {
    prop: "status",
    label: "状态",
    tag: true,
    enum: statusOptions,
    search: { el: "select" }
  },
  { prop: "views", label: "浏览量" },
  {
    prop: "remark",
    label: "备注"
  },
  { prop: "operation", label: "操作", width: 250, fixed: "right" }
]);

// 删除报修记录
const deleteProcessHandle = async (params: Accommodation.ResProcess) => {
  await useHandleData(deleteProcess, params.id, `删除内容`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteProcess, ids, t("main.deleteBatchMsg", { title: "内容" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof ProcessDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Accommodation.ResProcess> = {}) => {
  if (row.id) {
    const res = await getProcessById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addProcess : title === "编辑" ? editProcess : undefined,
    getTableList: proTable.value?.getTableList
  };
  drawerRef.value?.acceptParams(params);
};

// 审核
const auditProcessHandle = async (params: Accommodation.ResProcess) => {
  await useHandleData(editProcess, { id: params.id, status: "2" }, `发布【${params.title}】内容`);
  proTable.value?.getTableList();
};
</script>
