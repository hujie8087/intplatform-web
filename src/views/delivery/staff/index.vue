<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getDeliveryStaffList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="userId"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增</el-button>
          <el-button
            type="danger"
            :disabled="!scope.isSelected"
            v-auth="['delivery:staff:remove']"
            :icon="Delete"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="info" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="primary" link :icon="Edit" @click="openDrawer('编辑', scope.row)">编辑</el-button>
          <el-button
            type="danger"
            link
            v-auth="['delivery:staff:remove']"
            :icon="Delete"
            @click="deleteDeliveryStaffHandle(scope.row)"
          >
            删除
          </el-button>
          <!-- <el-button type="warning" v-auth="['delivery:staff:addOrder']" link @click="openDeliveryOrderDrawer('派单', scope.row)">
            派单
          </el-button> -->
        </template>
      </ProTable>
      <DeliveryStaffDrawer ref="drawerRef" />
      <DeliveryOrderDrawer ref="deliveryOrderDrawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="DeliveryStaff">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import DeliveryStaffDrawer from "./components/DeliveryStaffDrawer.vue";
import DeliveryOrderDrawer from "./components/DeliveryOrderDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Delete, Edit, CirclePlus, View } from "@element-plus/icons-vue";
import {
  getDeliveryStaffList,
  addDeliveryStaff,
  editDeliveryStaff,
  getDeliveryStaffById,
  deleteDeliveryStaff
} from "@/api/modules/delivery/staff";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import { DeliveryStaff } from "@/api/interface/delivery/staff";
// import { addDeliveryOrder } from "@/api/modules/delivery/deliveryOrder";
import { getDeliveryStation } from "@/api/modules/delivery/station";
import { DeliveryStation } from "@/api/interface/delivery/station";
import { EpPropMergeType } from "element-plus/es/utils";

const { t } = useI18n(); // 解构出t方法

// 字典数据
const sourceTypeOptions = ref<DictOptions[]>([]);
const staffStatusOptions = ref<DictOptions[]>([
  { label: "空闲", value: "0", tagType: "success" },
  { label: "禁用", value: "1", tagType: "danger" },
  { label: "忙碌", value: "3", tagType: "warning" }
]);
const staffTypeOptions = ref<DictOptions[]>([
  { label: "配送员", value: "0", tagType: "success" },
  { label: "打包员", value: "1", tagType: "danger" }
]);

const tagTypeOptions = ref<EpPropMergeType<StringConstructor, "success" | "primary" | "danger" | "warning" | "info", unknown>[]>([
  "success",
  "danger",
  "warning",
  "info",
  "primary"
]);

const getSourceTypeOptions = async () => {
  const res = await getDeliveryStation();
  sourceTypeOptions.value = res.data.map((item: DeliveryStation.ResDeliveryStation) => ({
    label: item.sourceStation,
    value: item.id,
    tagType: tagTypeOptions.value[item.id % tagTypeOptions.value.length]
  }));
};
getSourceTypeOptions();

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
const columns = reactive<ColumnProps<DeliveryStaff.ResDeliveryStaff>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "序号", width: 80 },
  { prop: "nickName", label: "姓名", width: 250, search: { el: "input" } },
  { prop: "userName", label: "工号", width: 150, search: { el: "input" } },
  { prop: "tel", label: "联系电话", width: 200, search: { el: "input" } },
  {
    prop: "staffType",
    label: "类型",
    width: 200,
    enum: staffTypeOptions,
    search: { el: "select" },
    render: scope => {
      return (
        <el-tag type={staffTypeOptions.value.find(option => option.value === scope.row.staffType)?.tagType}>
          {staffTypeOptions.value.find(option => option.value === scope.row.staffType)?.label}
        </el-tag>
      );
    }
  },
  {
    prop: "sourceMsgIds",
    label: "配送站点",
    enum: sourceTypeOptions,
    width: 350,
    tag: true,
    search: { el: "select", props: { filterable: true } },
    render: scope => {
      return (
        <div>
          {scope.row.sourceMsgs.map((item: DeliveryStation.ResDeliveryStation) => (
            <span style={{ marginRight: "5px" }}>
              <el-tag type={sourceTypeOptions.value.find(option => option.value === item.id)?.tagType} key={item.id}>
                {item.sourceStation}
              </el-tag>
            </span>
          ))}
        </div>
      );
    }
  },
  {
    prop: "status",
    label: "状态",
    width: 150,
    enum: staffStatusOptions,
    search: {
      el: "select"
    },
    tag: true
  },
  { prop: "remark", label: "备注" },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除反馈
const deleteDeliveryStaffHandle = async (params: DeliveryStaff.ResDeliveryStaff) => {
  await useHandleData(deleteDeliveryStaff, params.userName, `删除【${params.nickName}】配送员`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteDeliveryStaff, ids, t("main.deleteBatchMsg", { title: "配送员" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof DeliveryStaffDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<DeliveryStaff.ResDeliveryStaff> = {}) => {
  if (row.userName) {
    const res = await getDeliveryStaffById(row.userName);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addDeliveryStaff : title === "编辑" ? editDeliveryStaff : undefined,
    getTableList: proTable.value?.getTableList,
    deliveryStaffTypeOptions: sourceTypeOptions.value
  };
  drawerRef.value?.acceptParams(params);
};

// const deliveryOrderDrawerRef = ref<InstanceType<typeof DeliveryOrderDrawer> | null>(null);
// const openDeliveryOrderDrawer = async (title: string, row: Partial<DeliveryStaff.ResDeliveryStaff> = {}) => {
//   const params = {
//     title,
//     rowData: { ...row },
//     api: addDeliveryOrder,
//     getTableList: proTable.value?.getTableList,
//     deliveryStaffOptions: sourceTypeOptions.value
//   };
//   deliveryOrderDrawerRef.value?.acceptParams(params);
// };
</script>
