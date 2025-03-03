<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="1200" :title="`${drawerProps.title}配送订单`">
    <el-form
      ref="ruleFormRef"
      label-width="120px"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="drawerProps.rowData"
      :hide-required-asterisk="drawerProps.isView"
    >
      <el-row>
        <el-col :span="24" style="margin-bottom: 20px">
          <ProTable
            ref="staffSelectTableRef"
            :columns="staffSelectColumns"
            :request-auto="false"
            :data="selectedStaff"
            :tool-button="false"
            :pagination="false"
            row-key="userId"
          >
            <template #tableHeader>
              <el-button type="primary" @click="handleSelectStaffDialog" style="margin-bottom: 10px">选择配送员</el-button>
            </template>
          </ProTable>
        </el-col>
        <el-col :span="24" style="margin-bottom: 20px">
          <ProTable ref="orderSelectTableRef" :columns="orderSelectColumns" :data="selectedOrder" :tool-button="false">
            <template #tableHeader>
              <el-button type="primary" @click="handleSelectOrderDialog" style="margin-right: 10px">选择订单</el-button>
              <el-button type="warning" :disabled="!selectedOrder.length" @click="handleDeleteOrder">删除订单</el-button>
            </template>
          </ProTable>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" v-show="!drawerProps.isView" @click="handleSubmit">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
  <el-dialog v-model="staffDialogVisible" title="选择配送员" width="1200" :destroy-on-close="true">
    <ProTable
      ref="staffTableRef"
      :columns="staffColumns"
      :request-api="getDeliveryStaffList"
      :data-callback="dataCallback"
      :tool-button="false"
      :init-param="{ pageNum: 1, pageSize: 1000, status: '0' }"
      :search-col="4"
    >
      <!-- 表格操作 -->
      <template #operation="scope">
        <el-button type="primary" @click="handleSelectStaff(scope.row)">选择</el-button>
      </template>
    </ProTable>
  </el-dialog>

  <el-dialog v-model="orderDialogVisible" title="选择订单" width="1200" :destroy-on-close="true">
    <ProTable
      ref="orderTableRef"
      :columns="orderColumns"
      :request-api="getFPOrderList"
      :data-callback="dataCallback"
      :tool-button="false"
      :init-param="{ pageNum: 1, pageSize: 10, orderType: +selectedStaff[0].type }"
      :search-col="4"
      :max-height="400"
      row-key="id"
    >
    </ProTable>
    <template #footer>
      <el-button @click="orderDialogVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" @click="handleSelectOrder">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="DeliveryOrderDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { DeliveryOrder } from "@/api/interface/delivery/deliveryOrder";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import { getFPOrderList } from "@/api/modules/delivery/deliveryOrder";
import { getDeliveryStaffList } from "@/api/modules/delivery/staff";
import { DeliveryStaff } from "@/api/interface/delivery/staff";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { useDict } from "@/hooks/useDict";
const { t } = useI18n(); // 解构出t方法

const staffDialogVisible = ref(false);
const orderDialogVisible = ref(false);
const rules = reactive({});
const selectedStaff = ref<DeliveryStaff.ResDeliveryStaff[]>([]);
const orderList = ref<DeliveryOrder.ResDeliveryOrder[]>([]);
const dataCallback = (data: any) => {
  return {
    list: data.rows,
    total: data.total,
    current: data.current,
    size: data.size
  };
};
const getOrderList = async () => {
  const res = await getFPOrderList({ pageNum: 1, pageSize: 1000 });
  orderList.value = res.rows;
};
const sys_normal_disable = ref<DictOptions[]>([]);
const delivery_staff_type = ref<DictOptions[]>([]);
useDict("delivery_staff_type", "sys_normal_disable").then(res => {
  sys_normal_disable.value = res.sys_normal_disable;
  delivery_staff_type.value = res.delivery_staff_type.map(item => ({ ...item, value: +item.value }));
});
const staffColumns: ColumnProps[] = [
  { prop: "nickName", label: "姓名", search: { el: "input" } },
  { prop: "userName", label: "工号", search: { el: "input" } },
  { prop: "tel", label: "联系电话" },
  { prop: "type", label: "配送类型", enum: delivery_staff_type, tag: true, search: { el: "select" } },
  { prop: "status", label: "状态", enum: sys_normal_disable, tag: true },
  { prop: "operation", label: "操作" }
];
const staffTableRef = ref<ProTableInstance>();
const staffSelectTableRef = ref<ProTableInstance>();
const staffSelectColumns: ColumnProps[] = [
  { prop: "nickName", label: "姓名" },
  { prop: "userName", label: "工号" },
  { prop: "tel", label: "联系电话" },
  { prop: "type", label: "配送类型", enum: delivery_staff_type, tag: true },
  { prop: "status", label: "状态", enum: sys_normal_disable, tag: true },
  { prop: "operation", label: "操作" }
];
interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<DeliveryOrder.ResDeliveryOrder>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  deliveryStaffTypeOptions?: DictOptions[];
}
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
  getOrderList();
};
const handleSelectStaffDialog = () => {
  staffDialogVisible.value = true;
};
const handleSelectStaff = (row: DeliveryStaff.ResDeliveryStaff) => {
  selectedStaff.value = [row];
  staffSelectTableRef.value!.tableData = selectedStaff.value;
  staffDialogVisible.value = false;
};
const orderStatusOptions = ref<DictOptions[]>([
  { label: "待接单", value: 0, tagType: "warning" },
  { label: "已接单", value: 1, tagType: "success" },
  { label: "已送达", value: 2, tagType: "danger" },
  { label: "已收货", value: 3, tagType: "info" },
  { label: "已评价", value: 4, tagType: "primary" }
]);
const orderColumns: ColumnProps[] = [
  { type: "selection", fixed: "left", width: 50 },
  { prop: "orderNo", label: "订单号", search: { el: "input" } },
  {
    prop: "orderType",
    label: "订单类型",
    enum: delivery_staff_type,
    tag: true,
    search: { el: "select", props: { disabled: true } }
  },
  { prop: "deliveryName", label: "收货人姓名", search: { el: "input" } },
  { prop: "deliveryTel", label: "收货人电话" },
  { prop: "deliveryTime", label: "送货时间" },
  { prop: "deliveryAddress", label: "收货地址", search: { el: "input" } },
  { prop: "orderTime", label: "下单时间" },
  { prop: "deliveryFee", label: "配送费用" },
  { prop: "deliveryStatus", label: "订单状态", enum: orderStatusOptions, tag: true },
  { prop: "sourceNo", label: "订单来源编号" },
  { prop: "remark", label: "备注" }
];

const handleSelectOrderDialog = () => {
  if (selectedStaff.value.length === 0) {
    ElMessage.warning("请先选择配送员");
    return;
  }
  orderDialogVisible.value = true;
  setTimeout(() => {
    if (selectedOrder.value.length > 0) {
      orderTableRef.value!.toggleSelection(selectedOrder.value);
    }
    orderTableRef.value!.searchParam = { orderType: +selectedStaff.value[0].type };
  }, 100);
};
const handleDeleteOrder = () => {
  selectedOrder.value = selectedOrder.value.filter(item => !orderSelectTableRef.value!.selectedList.includes(item));
  orderSelectTableRef.value!.tableData = selectedOrder.value;
  orderSelectTableRef.value!.selectedList = [];
};
const orderTableRef = ref<ProTableInstance>();
const selectedOrder = ref<DeliveryOrder.ResDeliveryOrder[]>([]);
const handleSelectOrder = () => {
  selectedOrder.value = orderTableRef.value!.selectedList as DeliveryOrder.ResDeliveryOrder[];
  // orderTableRef.value?.clearSelection();
  orderDialogVisible.value = false;
};

const orderSelectTableRef = ref<ProTableInstance>();
const orderSelectColumns: ColumnProps[] = [
  { type: "selection", fixed: "left", width: 50 },
  { prop: "orderNo", label: "订单号" },
  { prop: "orderType", label: "订单类型" },
  { prop: "deliveryName", label: "收货人姓名" },
  { prop: "deliveryTel", label: "收货人电话" },
  { prop: "deliveryTime", label: "送货时间" },
  { prop: "deliveryAddress", label: "收货地址" },
  { prop: "orderTime", label: "下单时间" },
  { prop: "deliveryStatus", label: "订单状态", enum: orderStatusOptions, tag: true }
];

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    if (selectedStaff.value.length === 0) {
      ElMessage.warning("请选择配送员");
      return;
    }
    if (selectedOrder.value.length === 0) {
      ElMessage.warning("请选择订单");
      return;
    }
    let params = {
      orderId: selectedOrder.value.map(item => item.id),
      staffId: selectedStaff.value[0].userId
    };
    console.log(params);
    try {
      await drawerProps.value.api!(params);
      ElMessage.success({
        message: t("main.successMsg", { title: "配送订单", method: `${drawerProps.value.title}` })
      });
      drawerProps.value.getTableList!();
      drawerVisible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};

defineExpose({
  acceptParams
});
</script>
