<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="1200" :title="`${drawerProps.title}配送员`">
    <el-form ref="ruleFormRef" label-width="120px" label-suffix=" :" :rules="rules" :model="drawerProps.rowData">
      <!-- 配送员信息 -->
      <h3>配送员信息</h3>
      <el-row>
        <el-col :span="12">
          <el-form-item label="姓名" prop="nickName">
            <el-input
              v-model="drawerProps.rowData.nickName"
              :placeholder="`${$t('main.inputError', '姓名')}`"
              clearable
              disabled
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="工号" prop="userName">
            <el-input
              v-model="drawerProps.rowData.userName"
              :placeholder="`${$t('main.inputError', '工号')}`"
              clearable
              disabled
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" prop="tel">
            <el-input
              v-model="drawerProps.rowData.tel"
              :placeholder="`${$t('main.inputError', '联系电话')}`"
              clearable
              disabled
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="配送类型" prop="type">
            <el-select
              v-model="drawerProps.rowData.type"
              :placeholder="`${$t('main.inputError', '配送类型')}`"
              clearable
              disabled
            >
              <el-option
                v-for="item in drawerProps.deliveryStaffOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 订单信息 -->
      <h3>订单信息</h3>
      <!-- 表格 header 按钮 -->
      <el-button type="primary" :icon="CirclePlus" @click="showOrderList" style="margin-bottom: 10px">选择订单</el-button>
      <ProTable
        ref="selectOrderTable"
        highlight-current-row
        :data="checkOrderList"
        :columns="selectOrderColumns"
        :tool-button="false"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
      ></ProTable>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" @click="handleSubmit">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
  <el-dialog v-model="drawerOrderVisible" :destroy-on-close="true" width="1200" title="选择配送订单">
    <ProTable
      ref="proTable"
      highlight-current-row
      :request-api="getFPOrderList"
      :data-callback="dataCallback"
      :columns="columns"
      :init-param="{ pageNum: 1, pageSize: 10000, orderType: +drawerProps.rowData.type! }"
      row-key="id"
      :tool-button="false"
    >
    </ProTable>
    <template #footer>
      <el-button @click="drawerOrderVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" @click="checkOrderHandle">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="DeliveryOrderDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { DeliveryStaff } from "@/api/interface/delivery/staff";
import { useI18n } from "vue-i18n";
import ProTable from "@/components/ProTable/index.vue";
import { DictOptions } from "@/api/interface";
import { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import { OrderDelivery } from "@/api/interface/delivery/order";
import { CirclePlus } from "@element-plus/icons-vue";
import { getFPOrderList } from "@/api/modules/delivery/deliveryOrder";
import { computed } from "vue";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({});
const proTable = ref<ProTableInstance>();
interface DrawerProps {
  title: string;
  rowData: Partial<DeliveryStaff.ResDeliveryStaff>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  deliveryStaffOptions?: DictOptions[];
}
const drawerOrderVisible = ref(false);
// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: "",
  rowData: {}
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    let params = {
      orderId: checkOrderList.value.map(item => item.id),
      staffId: drawerProps.value.rowData.userId
    };
    try {
      await drawerProps.value.api!(params);
      ElMessage.success({
        message: t("main.successMsg", { title: "派单成功" })
      });
      drawerProps.value.getTableList!();
      drawerVisible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};

const checkOrderList = ref<OrderDelivery.ResOrderDelivery[]>([]);
const dataCallback = (data: any) => {
  return {
    list: data.rows,
    total: data.total,
    current: data.current,
    size: data.size
  };
};
const deliveryOrderStatusOptions = computed(() => {
  return drawerProps.value.deliveryStaffOptions?.map(item => ({ ...item, value: +item.value }));
});

// 字典数据 配送状态(0  待接单 1  已接单  2 已送达  3  已收货  4  已评价 )
const orderStatusOptions = ref<DictOptions[]>([
  { label: "待接单", value: 0, tagType: "warning" },
  { label: "已接单", value: 1, tagType: "success" },
  { label: "已送达", value: 2, tagType: "danger" },
  { label: "已收货", value: 3, tagType: "info" },
  { label: "已评价", value: 4, tagType: "primary" }
]);
// 表格配置项
const columns = reactive<ColumnProps<OrderDelivery.ResOrderDelivery>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "orderNo", label: "订单号", search: { el: "input" } },
  {
    prop: "orderType",
    label: "订单类型",
    enum: deliveryOrderStatusOptions.value,
    tag: true,
    search: { el: "select", props: { disabled: true } }
  },
  { prop: "deliveryName", label: "收货人姓名" },
  { prop: "deliveryTel", label: "收货人电话" },
  { prop: "deliveryAddress", label: "收货地址" },
  { prop: "orderTime", label: "下单时间" },
  { prop: "deliveryStatus", label: "订单状态", enum: orderStatusOptions, tag: true, search: { el: "select" } },
  { prop: "sourceNo", label: "订单来源编号", search: { el: "input" } },
  { prop: "remark", label: "备注" }
]);

const selectOrderColumns = reactive<ColumnProps<OrderDelivery.ResOrderDelivery>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { prop: "orderNo", label: "订单号" },
  { prop: "deliveryName", label: "收货人姓名" },
  { prop: "deliveryTel", label: "收货人电话" },
  { prop: "deliveryAddress", label: "收货地址" },
  { prop: "orderTime", label: "下单时间" },
  { prop: "deliveryStatus", label: "订单状态", enum: orderStatusOptions, tag: true },
  { prop: "sourceNo", label: "订单来源编号" },
  { prop: "remark", label: "备注" }
]);
const checkOrderHandle = () => {
  checkOrderList.value = proTable.value?.selectedList as OrderDelivery.ResOrderDelivery[];
  drawerOrderVisible.value = false;
};
const showOrderList = () => {
  drawerOrderVisible.value = true;
  setTimeout(() => {
    proTable.value!.searchParam = { orderType: +drawerProps.value.rowData.type! };
  }, 100);
  // proTable.value!.clearSelection();
  // proTable.value!.getTableList();
};

defineExpose({
  acceptParams
});
</script>
