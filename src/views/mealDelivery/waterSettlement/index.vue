<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getWaterSettlementList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="danger" :icon="Delete" :disabled="!scope.isSelected">批量删除</el-button>
        </template>
      </ProTable>
      <WaterSettlementDrawer ref="drawerRef" />
    </div>
  </div>
</template>
<script setup lang="tsx" name="WaterSettlement">
import { ref, reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import WaterSettlementDrawer from "./components/WaterSettlementDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Delete } from "@element-plus/icons-vue";
import { getWaterSettlementList } from "@/api/modules/mealDelivery/waterSettlement";
import { WaterSettlement } from "@/api/interface/mealDelivery/waterSettlement";
import { DictOptions } from "@/api/interface";
import { getDeliveryStationList } from "@/api/modules/delivery/station";
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
const tagTypeOptions = ref<string[]>(["success", "danger", "warning", "info", "primary", "error"]);
// 获取配送站点
const deliveryStationOptions = ref<DictOptions[]>([]);
const getDeliveryStationOptions = async () => {
  const res = await getDeliveryStationList({ pageNum: 1, pageSize: 9999 });
  deliveryStationOptions.value = res.rows.map((item, index) => ({
    label: item.sourceStation,
    value: item.code,
    tagType: tagTypeOptions.value[index % tagTypeOptions.value.length]
  }));
};

getDeliveryStationOptions();

// 表格配置项
const columns = reactive<ColumnProps<WaterSettlement.ResWaterSettlement>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "序号", width: 50 },
  { prop: "orderNo", label: "订单号", width: 150, search: { el: "input" } },
  { prop: "deliveryName", label: "收货人姓名", width: 120 },
  { prop: "deliveryTel", label: "收货人电话", width: 120 },
  { prop: "deliveryAddress", label: "配送地址", width: 260 },
  { prop: "orderTime", label: "下单时间", width: 120 },
  { prop: "sourceNo", label: "订单来源编号", width: 150, search: { el: "input" } },
  { prop: "errorMsg", label: "异常信息", width: 100 },
  { prop: "remark", label: "备注", width: 100 },
  { prop: "operation", label: "操作", width: 130, fixed: "right" }
]);
</script>
