<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getTableList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="CirclePlus" v-auth="['daily:dish:add']" @click="openDrawer('新增')">
            新增菜品
          </el-button>
          <el-button
            type="danger"
            :disabled="!scope.isSelected"
            v-auth="['daily:dish:remove']"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除菜品
          </el-button>
          <!-- 导出 -->
          <el-button type="warning" plain :icon="Download" @click="exportDishExcel"> 导出菜品 </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)"> 查看 </el-button>
          <el-button
            type="warning"
            link
            v-if="scope.row.userId !== 1"
            v-auth="['daily:dish:edit']"
            :icon="EditPen"
            @click="openDrawer('编辑', scope.row)"
          >
            编辑
          </el-button>
          <el-button type="danger" link v-auth="['daily:dish:remove']" :icon="Delete" @click="deleteCommodityHandle(scope.row)">
            删除
          </el-button>
        </template>
      </ProTable>
      <DishDrawer ref="drawerRef" />
      <ImportExcel ref="importExcelRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="Dish">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import DishDrawer from "./components/DishDrawer.vue";
import ImportExcel from "@/components/ImportExcel/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, Download, EditPen, View } from "@element-plus/icons-vue";
import { deleteDish, editDish, addDish, getDishById, getDishList } from "@/api/modules/productDisplay/dailyRecipe";
import { Dish } from "@/api/interface/productDisplay/dailyRecipe";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import { ElMessageBox } from "element-plus";
import { useDownload } from "@/hooks/useDownload";

const { t } = useI18n(); // 解构出t方法

// 图片地址
const imageUrl = import.meta.env.VITE_APP_BASE_FILE;
const foodUrl = import.meta.env.VITE_APP_FOOD_URL;

const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  return getDishList(newParams);
};
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
const columns = reactive<ColumnProps<Dish.ResDish>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "name", label: "名称", search: { el: "input" } },
  { prop: "description", label: "描述" },
  // 图片
  {
    prop: "imageUrl",
    label: "图片",
    width: 160,
    render: scope => {
      return (
        <el-image
          style="width: 35px; height: 35px"
          src={scope.row.imageUrl.includes("food") ? foodUrl + scope.row.imageUrl : imageUrl + scope.row.imageUrl}
          zoom-rate={1.2}
          max-scale={7}
          min-scale={0.2}
          preview-src-list={[scope.row.imageUrl.includes("food") ? foodUrl + scope.row.imageUrl : imageUrl + scope.row.imageUrl]}
          initial-index={4}
          fit="cover"
          preview-teleported
        />
      );
    }
  },
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

// 删除商品
const deleteCommodityHandle = async (params: Dish.ResDish) => {
  await useHandleData(deleteDish, params.id, `删除【${params.name}】商品`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteDish, ids, t("main.deleteBatchMsg", { title: "商品" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 修改状态
const changeStatusHandle = async (row: Dish.ResDish) => {
  await useHandleData(editDish, { id: row.id, status: row.status == 1 ? 0 : 1 }, `切换【${row.name}】商品状态`);
  proTable.value?.getTableList();
};

const baseUrl = import.meta.env.VITE_API_URL;
// 导出商品
const exportDishExcel = () => {
  ElMessageBox.confirm("确认导出菜品数据?", "温馨提示", { type: "warning" }).then(() =>
    useDownload(`${baseUrl}productdisplay/dish/export`, "菜品列表", true, ".xlsx", "post", proTable.value?.searchParam)
  );
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof DishDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Dish.ResDish> = {}) => {
  if (row.id) {
    const res = await getDishById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addDish : title === "编辑" ? editDish : undefined,
    getTableList: proTable.value?.getTableList,
    statusOptions: sys_normal_disable.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
