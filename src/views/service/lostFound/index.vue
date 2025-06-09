<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getFoundList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" v-auth="['other:show:add']" :icon="CirclePlus" @click="openDrawer('新增')"> 新增 </el-button>
          <el-button
            type="danger"
            v-auth="['other:show:delete']"
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
          <el-button type="warning" link :icon="Edit" v-auth="['other:show:edit']" @click="openDrawer('编辑', scope.row)">
            编辑
          </el-button>
          <el-button type="danger" link :icon="Delete" v-auth="['other:show:delete']" @click="deleteFoundHandle(scope.row)">
            删除
          </el-button>
          <!-- 审核 -->
          <el-button
            type="success"
            v-if="scope.row.reviewStatus === 0"
            link
            v-auth="['other:show:audit']"
            :icon="Check"
            @click="openReviewDrawer('审核', scope.row)"
            >审核</el-button
          >
          <!-- 领取 -->
          <el-button
            type="primary"
            link
            :icon="Check"
            v-if="scope.row.reviewStatus === 1 && scope.row.isFound === '0'"
            @click="openDrawer('领取', scope.row)"
            >领取</el-button
          >
        </template>
      </ProTable>
    </div>
    <FoundDrawer ref="drawerRef" />
    <ReviewDrawer ref="reviewDrawerRef" />
  </div>
</template>
<script setup lang="tsx" name="OtherFound">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, Edit, View, Check } from "@element-plus/icons-vue";
import { getFoundList, deleteFound, getFoundById, addFound, editFound } from "@/api/modules/service/found";
import { Found } from "@/api/interface/service/found";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import FoundDrawer from "./components/FoundDrawer.vue";
import ReviewDrawer from "./components/ReviewDrawer.vue";
const { t } = useI18n(); // 解构出t方法

const fileUrl = import.meta.env.VITE_APP_BASE_FILE;
// 字典数据
const otherTypeOptions = ref<DictOptions[]>([
  { label: "未领取", value: "0", tagType: "danger" },
  { label: "已领取", value: "1", tagType: "success" }
]);
const auditStatusOptions = ref<DictOptions[]>([
  { label: "未审核", value: 0, tagType: "danger" },
  { label: "已审核", value: 1, tagType: "success" },
  { label: "已驳回", value: 2, tagType: "warning" }
]);
const foundTypeOptions = ref<DictOptions[]>([
  { label: "失物", value: "0", tagType: "danger" },
  { label: "招领", value: "1", tagType: "success" }
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
const columns = reactive<ColumnProps<Found.ResFound>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "序号", width: 50 },
  { prop: "def2", label: "类型", enum: foundTypeOptions, search: { el: "select" }, tag: true, width: 80 },
  { prop: "lostName", label: "失物名称" },
  { prop: "foundName", label: "失物联系人" },
  { prop: "foundPlace", label: "失物地点" },
  { prop: "tel", label: "联系电话" },
  { prop: "foundTime", label: "丢失时间" },
  {
    prop: "photo",
    label: "失物图片",
    width: 100,
    render: row => {
      return (
        <el-image
          src={fileUrl + row.row.photo.split(",")[0]}
          preview-src-list={row.row.photo.split(",").map(item => fileUrl + item)}
          fit="cover"
          preview-teleported
          style={{ height: "80px" }}
        />
      );
    }
  },
  { prop: "receiveName", label: "拾取人" },
  { prop: "receiveTime", label: "拾取时间" },
  { prop: "receivePlace", label: "拾取地点" },
  { prop: "isFound", label: "是否领取", enum: otherTypeOptions, search: { el: "select" }, tag: true },
  { prop: "reviewStatus", label: "审核状态", enum: auditStatusOptions, search: { el: "select" }, tag: true },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除报修记录
const deleteFoundHandle = async (params: Found.ResFound) => {
  await useHandleData(deleteFound, params.id, `删除失物招领`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteFound, ids, t("main.deleteBatchMsg", { title: "失物招领" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof FoundDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Found.ResFound> = {}) => {
  if (row.id) {
    const res = await getFoundById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看" || title === "领取",
    rowData: { ...row },
    api: title === "新增" ? addFound : title === "编辑" ? editFound : title === "领取" ? editFound : undefined,
    getTableList: proTable.value?.getTableList,
    otherTypeOptions: otherTypeOptions.value,
    foundTypeOptions: foundTypeOptions.value
  };
  drawerRef.value?.acceptParams(params);
};

// 审核
const reviewDrawerRef = ref<InstanceType<typeof ReviewDrawer> | null>(null);
const openReviewDrawer = async (title: string, row: Partial<Found.ResFound> = {}) => {
  const params = {
    title,
    isView: true,
    rowData: { ...row },
    api: editFound,
    getTableList: proTable.value?.getTableList,
    otherTypeOptions: otherTypeOptions.value,
    foundTypeOptions: foundTypeOptions.value,
    auditStatusOptions: auditStatusOptions.value
  };
  reviewDrawerRef.value?.acceptParams(params);
};
</script>
