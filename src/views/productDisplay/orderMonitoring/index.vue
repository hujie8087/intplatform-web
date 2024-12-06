<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getTableList"
        :data-callback="dataCallback"
        :init-param="initParam"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        row-key="id"
      >
      </ProTable>
    </div>
  </div>
</template>
<script setup lang="tsx" name="OrderMonitoring">
import { ref, reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { OrderMonitoring } from "@/api/interface/productDisplay/orderMonitoring";
import { getOrderMonitoringList } from "@/api/modules/productDisplay/orderMonitoring";
import dayjs from "dayjs";

// ProTable 实例
const proTable = ref<ProTableInstance>();
const initParam = ref<OrderMonitoring.ReqOrderMonitoringParams>({
  pageNum: 1,
  pageSize: 20,
  beginTime: dayjs().format("YYYY-MM-DD 00:00:00"),
  endTime: dayjs().format("YYYY-MM-DD 23:59:59")
});
const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  newParams.time && (newParams.beginTime = newParams.time[0]);
  newParams.time && (newParams.endTime = newParams.time[1]);
  delete newParams.time;
  return getOrderMonitoringList(newParams);
};
const dataCallback = (data: any) => {
  return {
    list: data.rows,
    total: data.total,
    current: data.current,
    size: data.size
  };
};

// const value2 = ref<Date[]>([]);
// 表格配置项
const columns = reactive<ColumnProps<OrderMonitoring.ResOrderMonitoring>[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "序号", width: 80 },
  {
    prop: "time",
    label: "日期范围",
    isShow: false,
    search: {
      el: "date-picker",
      span: 2,
      props: {
        type: "datetimerange",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        defaultTime: [new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)]
      },
      defaultValue: [dayjs().format("YYYY-MM-DD 00:00:00"), dayjs().format("YYYY-MM-DD 23:59:59")]
    }
  },
  { prop: "name", label: "姓名", search: { el: "input" } },
  { prop: "nick", label: "工号", search: { el: "input" } },
  {
    prop: "tel",
    label: "联系电话"
  },
  { prop: "num", label: "订单数" },
  { prop: "total", label: "总金额" }
]);
</script>
