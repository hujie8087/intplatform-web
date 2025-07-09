<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getCoupleRoomStaffList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
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
            @click="deleteCoupleRoomStaffHandle(scope.row)"
          >
            删除
          </el-button>
        </template>
      </ProTable>
      <CoupleRoomStaffDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="CoupleRoomStaff">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import ProTable from "@/components/ProTable/index.vue";
import CoupleRoomStaffDrawer from "./components/CoupleRoomStaffDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Delete, Edit, CirclePlus, View } from "@element-plus/icons-vue";
import {
  getCoupleRoomStaffList,
  addCoupleRoomStaff,
  editCoupleRoomStaff,
  deleteCoupleRoomStaff,
  getCoupleRoomStaffDetail
} from "@/api/modules/service/coupleRoom";
import { useI18n } from "vue-i18n";
import { CoupleRoom } from "@/api/interface/service/coupleRoom";
import { DictOptions } from "@/api/interface";
import { useDict } from "@/hooks/useDict";

const coupleRoomArea = ref<DictOptions[]>([]);
useDict("couple_room_area").then(res => {
  coupleRoomArea.value = res.couple_room_area.map(item => ({
    ...item,
    value: +item.value
  }));
});

const { t } = useI18n(); // 解构出t方法
const commonStatus = [
  { label: "启用", value: 1, tagType: "success" },
  { label: "禁用", value: 0, tagType: "danger" }
];
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
const columns = reactive<ColumnProps<CoupleRoom.ResStaff>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "username", label: "账号", search: { el: "input" } },
  { prop: "name", label: "姓名", search: { el: "input" } },
  { prop: "sex", label: "性别", width: 80 },
  { prop: "tel", label: "联系电话" },
  { prop: "dept", label: "部门" },
  { prop: "job", label: "职位" },
  {
    prop: "areaType",
    label: "区域",
    render(scope) {
      return scope.row.areaType
        .split(",")
        .map(item => coupleRoomArea.value.find(area => area.value === +item)?.label)
        .join(",");
    }
  },
  {
    prop: "status",
    label: "状态",
    width: 80,
    enum: commonStatus,
    search: {
      el: "select"
    },
    tag: true
  },
  { prop: "num", label: "可定次数", width: 80 },
  { prop: "createTime", label: "创建时间" },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

// 删除人员
const deleteCoupleRoomStaffHandle = async (params: CoupleRoom.ResStaff) => {
  await useHandleData(deleteCoupleRoomStaff, params.id, `删除【${params.name}】人员`);
  proTable.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteCoupleRoomStaff, ids, t("main.deleteBatchMsg", { title: "人员" }));
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof CoupleRoomStaffDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<CoupleRoom.ResStaff> = {}) => {
  if (row.id) {
    const res = await getCoupleRoomStaffDetail(row.id);
    row = res.data;
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...row },
    api: title === "新增" ? addCoupleRoomStaff : title === "编辑" ? editCoupleRoomStaff : undefined,
    getTableList: proTable.value?.getTableList,
    coupleRoomAreaOptions: coupleRoomArea.value
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
