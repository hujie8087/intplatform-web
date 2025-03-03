<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="1200" :title="`${drawerProps.title}订单详情`">
    <el-collapse v-model="activeNames">
      <el-collapse-item title="订单信息" name="1">
        <el-form>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="订单号" prop="orderNo">
                <el-input
                  v-model="drawerProps.rowData.orderDelivery!.orderNo"
                  :placeholder="`${$t('main.inputError', '订单号')}`"
                  disabled
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="收货人姓名" prop="deliveryName">
                <el-input
                  v-model="drawerProps.rowData.orderDelivery!.deliveryName"
                  :placeholder="`${$t('main.inputError', '收货人姓名')}`"
                  disabled
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="收货人电话" prop="deliveryTel">
                <el-input
                  v-model="drawerProps.rowData.orderDelivery!.deliveryTel"
                  :placeholder="`${$t('main.inputError', '收货人电话')}`"
                  disabled
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="配送地址" prop="deliveryAddress">
                <el-input
                  v-model="drawerProps.rowData.orderDelivery!.deliveryAddress"
                  :placeholder="`${$t('main.inputError', '配送地址')}`"
                  disabled
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="下单时间" prop="orderTime">
                <el-input v-model="drawerProps.rowData.orderDelivery!.orderTime" disabled></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="期望配送时间" prop="deliveryTime">
                <el-input v-model="drawerProps.rowData.orderDelivery!.deliveryTime" disabled></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="配送费用" prop="deliveryFee">
                <el-input v-model="drawerProps.rowData.orderDelivery!.deliveryFee" disabled></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="实际支付金额" prop="actualPayment">
                <el-input v-model="drawerProps.rowData.orderDelivery!.actualPayment" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="订单类型" prop="orderType">
                <el-select v-model="drawerProps.rowData.orderDelivery!.orderType" placeholder="请选择订单类型" disabled>
                  <el-option
                    v-for="item in drawerProps.deliveryOrderTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="订单状态" prop="deliveryStatus">
                <el-tag
                  :type="
                    drawerProps.orderStatusOptions?.find(item => item.value === drawerProps.rowData.orderDelivery!.deliveryStatus)
                      ?.tagType
                  "
                >
                  {{
                    drawerProps.orderStatusOptions?.find(item => item.value === drawerProps.rowData.orderDelivery!.deliveryStatus)
                      ?.label
                  }}
                </el-tag>
              </el-form-item>
            </el-col>
            <el-col :span="6" v-if="drawerProps.rowData.orderDelivery!.deliveryStatus === 5">
              <el-form-item label="异常信息" prop="errorMsg">
                <el-input v-model="drawerProps.rowData.orderDelivery!.errorMsg" disabled></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="备注" prop="remark">
                <el-input v-model="drawerProps.rowData.orderDelivery!.remark" disabled></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-collapse-item>

      <el-collapse-item title="配送员信息" name="2">
        <el-form>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="配送员" prop="deliveryStaffId">
                <el-input v-model="drawerProps.rowData.orderDelivery!.deliveryStaffId" disabled></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-collapse-item>

      <el-collapse-item title="物资信息" name="3">
        <ProTable
          ref="proTable"
          :columns="columns"
          :tool-button="false"
          :data="drawerProps.rowData.orderDeliveryItemDetailsList"
        />
      </el-collapse-item>

      <el-collapse-item title="配送轨迹" name="4">
        <el-timeline>
          <el-timeline-item v-for="(item, index) in drawerProps.rowData.statusNodes" :key="index" :timestamp="item.time">
            <el-tag :type="getDeliveryStatus(item.status)?.tagType">{{ getDeliveryStatus(item.status)?.label }}</el-tag>
            {{ item.deliveryStaffMsg }}
          </el-timeline-item>
        </el-timeline>
      </el-collapse-item>
    </el-collapse>

    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" v-show="!drawerProps.isView" @click="handleSubmit">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="DeliveryOrderDrawer">
import { ref } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { OrderDelivery } from "@/api/interface/delivery/order";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import { reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
const { t } = useI18n(); // 解构出t方法

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<OrderDelivery.ResOrderDeliveryDetail>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  deliveryOrderTypeOptions?: DictOptions[];
  orderStatusOptions?: DictOptions[];
}

const activeNames = ref<string[]>(["1", "2"]);
const proTable = ref<ProTableInstance>();
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
const columns = reactive<ColumnProps<OrderDelivery.ResOrderDeliveryItemDetail>[]>([
  { type: "index", label: "序号", width: 50 },
  { prop: "itemName", label: "物资名称" },
  { prop: "itemPrice", label: "物资单价" },
  { prop: "itemQuantity", label: "物资数量" }
]);
// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await drawerProps.value.api!(drawerProps.value.rowData);
      ElMessage.success({
        message: t("main.successMsg", { title: "配送费", method: `${drawerProps.value.title}` })
      });
      drawerProps.value.getTableList!();
      drawerVisible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};
const getDeliveryStatus = (status: number) => {
  return drawerProps.value.orderStatusOptions?.find(item => item.value === status);
};
defineExpose({
  acceptParams
});
</script>
