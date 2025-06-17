<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getCommodityList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="CirclePlus" v-auth="['food:commodity:add']" @click="openDrawer('新增')">
            新增菜品
          </el-button>
          <el-button
            type="danger"
            :disabled="!scope.isSelected"
            v-auth="['food:commodity:remove']"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除菜品
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)"> 查看 </el-button>
          <el-button
            type="warning"
            link
            v-if="scope.row.userId !== 1"
            v-auth="['food:commodity:edit']"
            :icon="EditPen"
            @click="openDrawer('编辑', scope.row)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            link
            v-auth="['food:commodity:remove']"
            :icon="Delete"
            @click="deleteCommodityHandle(scope.row)"
          >
            删除
          </el-button>
        </template>
      </ProTable>
      <CommodityDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="Commodity">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import CommodityDrawer from "./components/CommodityDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, View } from "@element-plus/icons-vue";
import {
  getCommodityList,
  deleteCommodity,
  editCommodity,
  addCommodity,
  getCommodityById
} from "@/api/modules/productDisplay/commodity";
import { Commodity } from "@/api/interface/productDisplay/commodity";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import { getCanteenListOptions, getCategoryListOptions } from "@/api/modules/productDisplay/marketCanteen";

const { t } = useI18n(); // 解构出t方法

// 图片地址
const imageUrl = import.meta.env.VITE_APP_BASE_FILE;
const foodUrl = import.meta.env.VITE_APP_FOOD_URL;

// 所属餐厅
const canteenOptions = ref<DictOptions[]>([]);
const getCanteenList = async () => {
  const res = await getCanteenListOptions();
  canteenOptions.value = res.data.map(item => ({ label: item.name, value: item.id }));
};
getCanteenList();

// 分类
const categoryOptions = ref<DictOptions[]>([]);
const getCategoryList = async (canteenId: number) => {
  const res = await getCategoryListOptions(canteenId);
  categoryOptions.value = res.data.map(item => ({ label: item.name, value: item.id }));
  console.log(categoryOptions.value);
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
const columns = reactive<ColumnProps<Commodity.ResCommodity>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "code", label: "编码", width: 80, search: { el: "input" } },
  { prop: "name", label: "菜品名称", search: { el: "input" } },
  // 图片
  {
    prop: "image",
    label: "图片",
    render: scope => {
      return (
        <el-image
          style="width: 35px; height: 35px"
          src={scope.row.image.includes("food") ? foodUrl + scope.row.image : imageUrl + scope.row.image}
          zoom-rate={1.2}
          max-scale={7}
          min-scale={0.2}
          preview-src-list={[scope.row.image.includes("food") ? foodUrl + scope.row.image : imageUrl + scope.row.image]}
          initial-index={4}
          fit="cover"
          preview-teleported
        />
      );
    }
  },
  {
    prop: "canteenId",
    label: "所属餐厅",
    search: { el: "select", props: { onChange: getCategoryList, clearable: false } },
    enum: canteenOptions
  },
  {
    prop: "categoryName",
    label: "分类"
  },
  {
    prop: "categoryId",
    label: "分类",
    isShow: false,
    search: {
      // 自定义 search 显示内容
      render: ({ searchParam }) => {
        return (
          <el-select
            disabled={categoryOptions.value.length === 0}
            vModel_trim={searchParam.categoryName}
            placeholder="请选择分类"
            clearable={true}
          >
            {categoryOptions.value.map(item => (
              <el-option label={item.label} value={item.value} />
            ))}
          </el-select>
        );
      }
    }
  },
  { prop: "price", label: "价格", width: 80 },
  { prop: "stock", label: "库存", width: 80 },
  {
    prop: "isHot",
    label: "是否热销",
    sortable: true,
    tag: true,
    width: 100,
    render: scope => {
      return (
        <span>
          <el-switch
            model-value={scope.row.isHot}
            active-text={scope.row.isHot ? "是" : "否"}
            active-value={1}
            inactive-value={0}
            onClick={() => changeIsHotHandle(scope.row)}
          />
        </span>
      );
    }
  },
  { prop: "sort", label: "排序", width: 80 },
  {
    prop: "identification",
    label: "是否单独配送",
    sortable: true,
    tag: true,
    width: 100,
    render: scope => {
      return (
        <span>
          <el-switch
            model-value={scope.row.identification}
            active-text={scope.row.identification ? "是" : "否"}
            active-value={1}
            inactive-value={0}
            onClick={() => changeIdentificationHandle(scope.row)}
          />
        </span>
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

// 删除菜品
const deleteCommodityHandle = async (params: Commodity.ResCommodity) => {
  await useHandleData(deleteCommodity, params.id, `删除【${params.name}】菜品`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteCommodity, ids, t("main.deleteBatchMsg", { title: "菜品" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 修改状态
const changeStatusHandle = async (row: Commodity.ResCommodity) => {
  await useHandleData(editCommodity, { id: row.id, status: row.status == 1 ? 0 : 1 }, `切换【${row.name}】菜品状态`);
  proTable.value?.getTableList();
};

// 修改是否热销
const changeIsHotHandle = async (row: Commodity.ResCommodity) => {
  await useHandleData(editCommodity, { id: row.id, isHot: row.isHot == 1 ? 0 : 1 }, `切换【${row.name}】菜品热销状态`);
  proTable.value?.getTableList();
};

// 修改是否单独配送
const changeIdentificationHandle = async (row: Commodity.ResCommodity) => {
  await useHandleData(
    editCommodity,
    { id: row.id, identification: row.identification == 1 ? 0 : 1 },
    `切换【${row.name}】菜品单独配送状态`
  );
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof CommodityDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Commodity.ResCommodity> = {}) => {
  if (row.id) {
    const res = await getCommodityById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addCommodity : title === "编辑" ? editCommodity : undefined,
    getTableList: proTable.value?.getTableList,
    statusOptions: sys_normal_disable.value,
    canteenOptions: canteenOptions.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
