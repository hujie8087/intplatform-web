<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getCategoryList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="CirclePlus" v-auth="['food:category:add']" @click="openDrawer('新增')"
            >新增菜品分类</el-button
          >
          <el-button
            type="danger"
            :disabled="!scope.isSelected"
            v-auth="['food:category:remove']"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除菜品分类
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button
            type="warning"
            link
            v-if="scope.row.userId !== 1"
            v-auth="['food:category:edit']"
            :icon="EditPen"
            @click="openDrawer('编辑', scope.row)"
          >
            编辑
          </el-button>
          <el-button type="danger" link :icon="Delete" v-auth="['food:category:remove']" @click="deleteCategoryHandle(scope.row)"
            >删除</el-button
          >
        </template>
      </ProTable>
      <CategoryDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="Category">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import CategoryDrawer from "./components/CategoryDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, View } from "@element-plus/icons-vue";
import {
  getCategoryList,
  deleteCategory,
  editCategory,
  addCategory,
  getCategoryById
} from "@/api/modules/productDisplay/catogory";
import { Category } from "@/api/interface/productDisplay/catogory";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import { getCanteenListOptions } from "@/api/modules/productDisplay/marketCanteen";

const { t } = useI18n(); // 解构出t方法

// 所属餐厅
const canteenOptions = ref<DictOptions[]>([]);
const getCanteenList = async () => {
  const res = await getCanteenListOptions();
  canteenOptions.value = res.data.map(item => ({ label: item.name, value: item.id }));
};
getCanteenList();
// 字典数据
const sys_normal_disable = ref<DictOptions[]>([
  { label: "启用", value: 1 },
  { label: "禁用", value: 0 }
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
const columns = reactive<ColumnProps<Category.ResCategory>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "id", label: "序号", width: 80 },
  { prop: "name", label: "菜品分类名称", search: { el: "input" } },
  { prop: "canteenId", label: "所属餐厅", search: { el: "select" }, enum: canteenOptions },
  { prop: "sort", label: "排序" },
  { prop: "remark", label: "备注" },
  {
    prop: "status",
    label: "状态",
    enum: sys_normal_disable,
    sortable: true,
    tag: true,
    width: 100,
    search: { el: "select" },
    render: scope => {
      return (
        <el-switch
          model-value={scope.row.status}
          active-text={scope.row.status ? "启用" : "禁用"}
          active-value={1}
          inactive-value={0}
          onClick={() => changeStatusHandle(scope.row)}
        />
      );
    }
  },
  {
    prop: "createTime",
    label: "创建时间",
    width: 180,
    sortable: true
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除菜品分类
const deleteCategoryHandle = async (params: Category.ResCategory) => {
  await useHandleData(deleteCategory, params.id, `删除【${params.name}】菜品分类`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteCategory, ids, t("main.deleteBatchMsg", { title: "菜品分类" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof CategoryDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Category.ResCategory> = {}) => {
  if (row.id) {
    const res = await getCategoryById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addCategory : title === "编辑" ? editCategory : undefined,
    getTableList: proTable.value?.getTableList,
    statusOptions: sys_normal_disable.value,
    canteenOptions: canteenOptions.value
  };
  drawerRef.value?.acceptParams(params);
};

// 修改状态
const changeStatusHandle = async (row: Category.ResCategory) => {
  await useHandleData(editCategory, { ...row, status: row.status === 1 ? 0 : 1 }, `修改【${row.name}】菜品分类状态`);
  proTable.value?.getTableList();
};
</script>
