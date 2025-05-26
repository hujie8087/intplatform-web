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
        </template>
      </ProTable>
    </div>
    <PublicDrawer ref="drawerRef" />
  </div>
</template>
<script setup lang="tsx" name="OtherFound">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, Edit, View } from "@element-plus/icons-vue";
import { getFoundList, deleteFound, getFoundById, addFound, editFound } from "@/api/modules/service/found";
import { Found } from "@/api/interface/service/found";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import PublicDrawer from "./components/FoundDrawer.vue";
const { t } = useI18n(); // 解构出t方法
// 字典数据
const otherTypeOptions = ref<DictOptions[]>([
  { label: "未领取", value: "0" },
  { label: "已领取", value: "1" }
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
  { prop: "lostName", label: "失物名称" },
  { prop: "foundPlace", label: "失物地点" },
  { prop: "foundName", label: "失物联系人" },
  { prop: "foundPhone", label: "联系电话" },
  { prop: "photo", label: "图片" },
  { prop: "remark", label: "失物描述" },
  { prop: "receiveName", label: "领取人" },
  { prop: "receiveTime", label: "领取时间" },
  { prop: "receivePlace", label: "领取地点" },
  { prop: "isFound", label: "是否领取", enum: otherTypeOptions, search: { el: "select" }, tag: true },
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
const drawerRef = ref<InstanceType<typeof PublicDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Found.ResFound> = {}) => {
  if (row.id) {
    const res = await getFoundById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addFound : title === "编辑" ? editFound : undefined,
    getTableList: proTable.value?.getTableList,
    otherTypeOptions: otherTypeOptions.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
