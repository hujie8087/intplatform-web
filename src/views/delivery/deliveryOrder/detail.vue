<template>
  <div class="main-box">
    <div class="table-box">
      <div class="card" style="padding-top: 0px; height: 100%">
        <h3>新增配送订单</h3>
        <el-row>
          <el-col :span="12" style="margin-bottom: 20px">
            <el-descriptions title="配送员信息" :column="3" border :label-width="120">
              <template #title>
                <el-button type="primary" @click="handleSelectStaffDialog" style="margin-bottom: 10px">选择配送员</el-button>
              </template>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <el-icon :style="iconStyle">
                      <user />
                    </el-icon>
                    姓名
                  </div>
                </template>
                {{ selectedStaff?.nickName }}</el-descriptions-item
              >
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <el-icon :style="iconStyle">
                      <!-- 工号图标 -->
                      <UserFilled />
                    </el-icon>
                    工号
                  </div>
                </template>
                {{ selectedStaff?.userName }}</el-descriptions-item
              >
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <el-icon :style="iconStyle">
                      <phone />
                    </el-icon>
                    联系电话
                  </div>
                </template>
                {{ selectedStaff?.tel }}</el-descriptions-item
              >
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <el-icon :style="iconStyle">
                      <!-- 配送类型图标 -->
                      <Van />
                    </el-icon>
                    配送类型
                  </div>
                </template>
                <el-tag
                  v-if="selectedStaff?.type"
                  :type="delivery_staff_type.find(item => item.value === selectedStaff!.type)?.tagType || 'info'"
                  >{{ delivery_staff_type.find(item => item.value === selectedStaff!.type)?.label }}</el-tag
                >
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <el-icon :style="iconStyle">
                      <Warning />
                    </el-icon>
                    状态
                  </div>
                </template>
                <el-tag
                  v-if="selectedStaff?.status"
                  :type="staffStatusOptions.find(item => item.value === selectedStaff!.status)?.tagType || 'info'"
                  >{{ staffStatusOptions.find(item => item.value === selectedStaff!.status)?.label }}</el-tag
                >
              </el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="24" style="margin-bottom: 20px">
            <ProTable ref="orderSelectTableRef" :columns="orderSelectColumns" :data="selectedOrder" :tool-button="false">
              <template #tableHeader>
                <el-button type="primary" @click="handleSelectOrderDialog">选择订单</el-button>
                <el-button type="danger" :disabled="!selectedOrder.length" @click="handleDeleteOrder">删除订单</el-button>
              </template>
            </ProTable>
          </el-col>
          <el-col :span="24">
            <el-button type="primary" @click="handleSubmit">提交</el-button>
            <el-button type="danger" @click="handleCancel">关闭</el-button>
          </el-col>
        </el-row>
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
            :init-param="{ pageNum: 1, pageSize: 10000, orderType: +selectedStaff?.type! }"
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="DeliveryOrderDetail">
import { computed, ref } from "vue";
import { ComponentSize, ElMessage } from "element-plus";
import { DeliveryOrder } from "@/api/interface/delivery/deliveryOrder";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import { addDeliveryOrder, getFPOrderList } from "@/api/modules/delivery/deliveryOrder";
import { getDeliveryStaffList } from "@/api/modules/delivery/staff";
import { DeliveryStaff } from "@/api/interface/delivery/staff";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { useDict } from "@/hooks/useDict";
const { t } = useI18n(); // 解构出t方法
import { useRoute } from "vue-router";
import { useTabsStore } from "@/stores/modules/tabs";
const route = useRoute();
const tabStore = useTabsStore();
const size = ref<ComponentSize>("default");
const iconStyle = computed(() => {
  const marginMap = {
    large: "8px",
    default: "6px",
    small: "4px"
  };
  return {
    marginRight: marginMap[size.value] || marginMap.default,
    fontSize: "16px"
  };
});

const staffStatusOptions = ref<DictOptions[]>([
  { label: "空闲", value: "0", tagType: "success" },
  { label: "禁用", value: "1", tagType: "danger" },
  { label: "忙碌", value: "3", tagType: "warning" }
]);
const staffDialogVisible = ref(false);
const orderDialogVisible = ref(false);
const selectedStaff = ref<DeliveryStaff.ResDeliveryStaff>();
const dataCallback = (data: any) => {
  return {
    list: data.rows,
    total: data.total,
    current: data.current,
    size: data.size
  };
};
const delivery_staff_type = ref<DictOptions[]>([]);
const deliveryOrderStatusOptions = computed(() => {
  return delivery_staff_type.value.map(item => ({ ...item, value: +item.value }));
});
useDict("delivery_staff_type").then(res => {
  delivery_staff_type.value = res.delivery_staff_type;
});
const staffColumns: ColumnProps[] = [
  { prop: "nickName", label: "姓名", search: { el: "input" } },
  { prop: "userName", label: "工号", search: { el: "input" } },
  { prop: "tel", label: "联系电话" },
  { prop: "type", label: "配送类型", enum: delivery_staff_type, tag: true, search: { el: "select" } },
  { prop: "status", label: "状态", enum: staffStatusOptions, tag: true },
  { prop: "operation", label: "操作" }
];
const staffTableRef = ref<ProTableInstance>();
const handleSelectStaffDialog = () => {
  staffDialogVisible.value = true;
};
const handleSelectStaff = (row: DeliveryStaff.ResDeliveryStaff) => {
  selectedStaff.value = row;
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
    enum: deliveryOrderStatusOptions,
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
  if (!selectedStaff.value) {
    ElMessage.warning("请先选择配送员");
    return;
  }
  orderDialogVisible.value = true;
  setTimeout(() => {
    if (selectedOrder.value.length > 0) {
      orderTableRef.value!.toggleSelection(selectedOrder.value);
    }
    orderTableRef.value!.searchParam = { orderType: +selectedStaff.value!.type! };
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
const handleSubmit = async () => {
  if (!selectedStaff.value) {
    ElMessage.warning("请选择配送员");
    return;
  }
  if (selectedOrder.value.length === 0) {
    ElMessage.warning("请选择订单");
    return;
  }
  let params = {
    orderId: selectedOrder.value.map(item => item.id),
    staffId: selectedStaff.value.userId
  };
  try {
    await addDeliveryOrder(params);
    ElMessage.success({
      message: t("main.successMsg", { title: "配送订单", method: "新增" })
    });
    // 关闭当前页
    handleCancel();
  } catch (error) {
    console.log(error);
  }
};
const handleCancel = () => {
  // 关闭当前页
  if (route.meta.isAffix) return;
  tabStore.removeTabs(route.fullPath);
};
</script>
<style scoped>
.my-label {
  width: 120px;
}
</style>
