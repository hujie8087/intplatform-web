<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getOtherList"
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
          <el-button type="success" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="primary" link :icon="Edit" v-auth="['other:show:edit']" @click="openDrawer('编辑', scope.row)">
            编辑
          </el-button>
          <el-button type="danger" link :icon="Delete" v-auth="['other:show:delete']" @click="deleteOtherHandle(scope.row)">
            删除
          </el-button>
        </template>
      </ProTable>
    </div>
    <PublicDrawer ref="drawerRef" />
  </div>
</template>
<script setup lang="tsx" name="Other">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, Edit, View } from "@element-plus/icons-vue";
import { getOtherList, deleteOther, getOtherById, addOther, editOther } from "@/api/modules/service/other";
import { Other } from "@/api/interface/service/other";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import { useDict } from "@/hooks/useDict";
import PublicDrawer from "./components/PublicDrawer.vue";
import { getAllBuildingTree } from "@/api/modules/food/building";
import { omit } from "lodash";

const { t } = useI18n(); // 解构出t方法
// 字典数据
const otherTypeOptions = ref<DictOptions[]>([]);
useDict("public_common_type").then(res => {
  otherTypeOptions.value = res.public_common_type;
});
const treeData = ref<DictOptions[]>([]);
const getBuildingTree = async () => {
  const res = await getAllBuildingTree();
  treeData.value = res.data.map(node => {
    const rest = omit(node, ["children"]);
    return {
      label: rest.title ?? "",
      value: rest.id
    };
  });
};

getBuildingTree();
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
const columns = reactive<ColumnProps<Other.ResOther>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "序号", width: 50 },
  {
    prop: "souceType",
    label: "类型",
    enum: otherTypeOptions,
    search: { el: "tree-select", props: { filterable: true } }
  },
  { prop: "businessHours", label: "营业时间" },
  { prop: "head", label: "负责人", search: { el: "input" } },
  { prop: "regionId", label: "区域地点", enum: treeData, search: { el: "tree-select", props: { filterable: true } } },
  { prop: "address", label: "详细地址" },
  {
    prop: "remark",
    label: "备注"
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除报修记录
const deleteOtherHandle = async (params: Other.ResOther) => {
  await useHandleData(deleteOther, params.id, `删除内容`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteOther, ids, t("main.deleteBatchMsg", { title: "内容" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof PublicDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Other.ResOther> = {}) => {
  if (row.id) {
    const res = await getOtherById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addOther : title === "编辑" ? editOther : undefined,
    getTableList: proTable.value?.getTableList,
    otherTypeOptions: otherTypeOptions.value,
    treeData: treeData.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
