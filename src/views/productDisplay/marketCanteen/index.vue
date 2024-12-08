<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getCanteenList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" v-auth="['food:canteen:add']" :icon="CirclePlus" @click="openDrawer('新增')">
            新增商店
          </el-button>
          <el-button
            type="danger"
            :disabled="!scope.isSelected"
            v-auth="['food:canteen:remove']"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除商店
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button
            type="warning"
            link
            v-if="scope.row.userId !== 1"
            v-auth="['food:canteen:edit']"
            :icon="EditPen"
            @click="openDrawer('编辑', scope.row)"
          >
            编辑
          </el-button>
          <el-button type="danger" link v-auth="['food:canteen:remove']" :icon="Delete" @click="deleteCanteenHandle(scope.row)">
            删除
          </el-button>
        </template>
      </ProTable>
      <CanteenDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="MarketCanteen">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import CanteenDrawer from "./components/CanteenDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, View } from "@element-plus/icons-vue";
import {
  getCanteenList,
  deleteCanteen,
  editCanteen,
  addCanteen,
  getCanteenById,
  changeCanteenStatus,
  getPickupType,
  getDeliveryFee,
  getDeliveryAddress,
  getDeliveryTime,
  getNewAreaMenu
} from "@/api/modules/productDisplay/marketCanteen";
import { MarketCanteen } from "@/api/interface/productDisplay/marketCanteen";
import { useI18n } from "vue-i18n";
import { DictOptionsType } from "@/api/interface";

const { t } = useI18n(); // 解构出t方法

// 图片地址
const imageUrl = import.meta.env.VITE_APP_BASE_FILE;
const foodUrl = import.meta.env.VITE_APP_FOOD_URL;
// 获取取餐类型
const pickupTypeOptions = ref<DictOptionsType[]>([]);

const getPickupTypeList = async () => {
  const res = await getPickupType();
  pickupTypeOptions.value = res.rows;
};
getPickupTypeList();

// 获取配送费选项
const deliveryFeeOptions = ref<DictOptionsType[]>([]);
const getDeliveryFeeList = async () => {
  const res = await getDeliveryFee();
  deliveryFeeOptions.value = res.rows;
};
getDeliveryFeeList();

// 获取配送区域
const addressOptions = ref<DictOptionsType[]>([]);
const getDeliveryAddressList = async () => {
  const res = await getDeliveryAddress();
  addressOptions.value = res.rows;
};
getDeliveryAddressList();

// 获取配送时间
const deliveryTimeOptions = ref<DictOptionsType[]>([]);
const getDeliveryTimeList = async () => {
  const res = await getDeliveryTime();
  deliveryTimeOptions.value = res.rows;
};
getDeliveryTimeList();

// 获取新配送区域
const newAddressOptions = ref<DictOptionsType[]>([]);
const getNewAddressList = async () => {
  const res = await getNewAreaMenu();
  newAddressOptions.value = res.data.map(item => {
    return {
      name: item.title as string,
      id: item.id
    };
  });
};
getNewAddressList();

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
const columns = reactive<ColumnProps<MarketCanteen.ResMarketCanteen>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "id", label: "序号", width: 80 },
  { prop: "name", label: "商店名称", search: { el: "input" } },
  // 图片
  {
    prop: "image",
    label: "图片",
    width: 100,
    render: scope => {
      return (
        <el-image
          style="width: 30px; height: 30px"
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
  { prop: "startTime", label: "营业开始时间" },
  { prop: "endTime", label: "营业结束时间" },
  {
    prop: "pickupTypeIds",
    label: "取餐类型",
    render: scope => {
      return (
        <>
          {scope.row.pickupTypeIds.map(item => {
            return (
              <el-tag style="margin-right: 5px" type={item === 1 ? "success" : item === 2 ? "danger" : ""}>
                {pickupTypeOptions.value.find(i => i.id === item)?.name}
              </el-tag>
            );
          })}
        </>
      );
    }
  },
  // { prop: "addressId", label: "配送区域" },
  {
    prop: "status",
    label: "状态",
    enum: [
      { label: "启用", value: 1 },
      { label: "禁用", value: 0 }
    ],
    search: { el: "select" },
    render: scope => {
      return (
        <>
          <el-switch
            model-value={scope.row.status}
            active-text={scope.row.status ? "启用" : "禁用"}
            active-value={1}
            inactive-value={0}
            onClick={() => changeStatus(scope.row)}
          />
        </>
      );
    },
    width: 100
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 切换用户状态
const changeStatus = async (row: MarketCanteen.ResMarketCanteen) => {
  await useHandleData(changeCanteenStatus, { id: row.id, status: row.status == 1 ? 0 : 1 }, `切换【${row.name}】商店状态`);
  proTable.value?.getTableList();
};
// 删除商店
const deleteCanteenHandle = async (params: MarketCanteen.ResMarketCanteen) => {
  await useHandleData(deleteCanteen, params.id, `删除【${params.name}】商店`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteCanteen, ids, t("main.deleteBatchMsg", { title: "商店" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof CanteenDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<MarketCanteen.ResMarketCanteen> = {}) => {
  if (row.id) {
    const res = await getCanteenById(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addCanteen : title === "编辑" ? editCanteen : undefined,
    getTableList: proTable.value?.getTableList,
    pickupTypeOptions: pickupTypeOptions.value,
    deliveryFeeOptions: deliveryFeeOptions.value,
    addressOptions: addressOptions.value,
    deliveryTimeOptions: deliveryTimeOptions.value,
    newAddressOptions: newAddressOptions.value
  };
  drawerRef.value?.acceptParams(params);
};
</script>
