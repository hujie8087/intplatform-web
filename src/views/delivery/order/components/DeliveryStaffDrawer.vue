<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="1200" title="选择配送员">
    <ProTable
      ref="selectStaffTable"
      highlight-current-row
      :request-api="getDeliveryStaffList"
      :columns="selectStaffColumns"
      :init-param="{ status: 0, type: +drawerProps.rowData.orderDelivery!.orderType }"
      :tool-button="false"
      :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
      :data-callback="dataCallback"
    >
      <template #operation="{ row }">
        <el-button type="primary" @click="selectStaff(row)">选择</el-button>
      </template>
    </ProTable>
  </el-dialog>
</template>

<script setup lang="ts" name="DeliveryStaffDrawer">
import { ref } from "vue";
import { OrderDelivery } from "@/api/interface/delivery/order";
import { DictOptions } from "@/api/interface";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { reactive } from "vue";
import { getDeliveryStaffList } from "@/api/modules/delivery/staff";
import { DeliveryStaff } from "@/api/interface/delivery/staff";

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<OrderDelivery.ResOrderDeliveryDetail>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
}
const staffStatusOptions = ref<DictOptions[]>([
  { label: "空闲", value: "0", tagType: "success" },
  { label: "禁用", value: "1", tagType: "danger" },
  { label: "忙碌", value: "3", tagType: "warning" }
]);

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  rowData: {}
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
};

const dataCallback = (data: any) => {
  return {
    list: data.rows,
    total: data.total,
    current: data.current,
    size: data.size
  };
};
const checkStaffList = ref<DeliveryStaff.ResDeliveryStaff>();
const selectStaffTable = ref<ProTableInstance>();
const selectStaffColumns = reactive<ColumnProps<DeliveryStaff.ResDeliveryStaff>[]>([
  { type: "index", label: "序号", width: 50 },
  { prop: "nickName", label: "姓名", search: { el: "input" } },
  { prop: "userName", label: "工号", search: { el: "input" } },
  { prop: "tel", label: "联系电话" },
  {
    prop: "status",
    label: "状态",
    enum: staffStatusOptions,
    tag: true
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

const selectStaff = (row: DeliveryStaff.ResDeliveryStaff) => {
  checkStaffList.value = row;
  drawerVisible.value = false;
};

defineExpose({
  acceptParams
});
</script>
