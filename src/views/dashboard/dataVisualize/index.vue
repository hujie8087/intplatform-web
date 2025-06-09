<template>
  <div class="home" ref="el">
    <div class="dataScreen-container">
      <div class="dataScreen-content">
        <div class="dataScreen-header">
          <div class="header-lf">
            <el-icon :size="20" style="margin: 0 5px 0 10px; color: white; vertical-align: middle">
              <Timer />
            </el-icon>
            <span>
              {{ dataTime.data }}
            </span>
            <span>
              {{ dataTime.week }}
            </span>
            <span>
              {{ dataTime.time }}
            </span>
          </div>
          <div class="header-ct">
            <div class="header-ct-title">
              <img src="./images/dataScreen-header-title.png" alt="" srcset="" />
            </div>
          </div>
          <div class="header-ri">
            <div
              class="header-btn"
              @click="
                () => {
                  toggle();
                  resize();
                }
              "
            >
              <el-icon>
                <FullScreen />
              </el-icon>
              <span>{{ isFullscreen ? "退出" : "全屏" }}</span>
            </div>
          </div>
        </div>
        <div class="dataScreen-main">
          <div class="dataScreen-lf">
            <div class="dataScreen-top">
              <div class="dataScreen-main-title">
                <img src="./images/dataScreen-title-bg.png" alt="" />
                <span>商店配送订单量</span>
                <span class="date-picker-span">
                  <!-- 日期范围查询 -->
                  <el-date-picker
                    v-model="dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                    format="YYYY-MM-DD"
                    @change="handleDateChange"
                    class="date-picker"
                  />
                </span>
              </div>
              <div class="dataScreen-main-chart">
                <Curve
                  ref="curveRef"
                  v-if="deliveryCompletionRate.sourceMsg.length > 0"
                  :data="deliveryCompletionRate.sourceMsg"
                  label="siteName"
                  value="orderCount"
                  title="商店"
                />
              </div>
            </div>
          </div>
          <div class="dataScreen-ct">
            <div class="dataScreen-main-title">
              <img src="./images/dataScreen-title-bg.png" alt="" />
              <span>人员配送订单量</span>
              <span class="date-picker-span">
                <!-- 日期范围查询 -->
                <el-date-picker
                  v-model="dateRange"
                  class="date-picker"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                  format="YYYY-MM-DD"
                  @change="handleDateChange"
                />
              </span>
            </div>
            <div class="dataScreen-main-chart">
              <HotPlateChart
                v-if="deliveryCompletionRate.deliveryStaff.length > 0"
                :data="deliveryCompletionRate.deliveryStaff"
              />
            </div>
          </div>
          <div class="dataScreen-rg">
            <div class="dataScreen-top">
              <div class="dataScreen-main-title">
                <img src="./images/dataScreen-title-bg.png" alt="" />
                <span>区域维修订单量</span>
                <span class="date-picker-span">
                  >
                  <!-- 日期范围查询 -->
                  <el-date-picker
                    v-model="dateRangeRepair"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                    format="YYYY-MM-DD"
                    :teleported="false"
                    @change="handleDateRepairChange"
                    class="date-picker"
                  />
                </span>
              </div>
              <div class="dataScreen-main-chart">
                <AnnualUseChart v-if="reportData && reportData?.region.length > 0" :data="reportData" />
              </div>
            </div>
          </div>
        </div>
        <div class="dataScreen-main">
          <div class="dataScreen-ct">
            <div class="dataScreen-main-title">
              <img src="./images/dataScreen-title-bg.png" alt="" />
              <span>餐饮类型单量分布</span>
              <span class="date-picker-span">
                <!-- 日期范围查询 -->
                <el-date-picker
                  v-model="dateCateringRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                  format="YYYY-MM-DD"
                  @change="handleDateCateringChange"
                  class="date-picker"
                />
              </span>
            </div>
            <div class="dataScreen-main-chart">
              <AgeRatioChart
                ref="ageRatioChartRef"
                v-if="cateringScreenData.forType.length > 0"
                :data="cateringScreenData.forType"
              />
            </div>
          </div>
          <div class="dataScreen-lf">
            <div class="dataScreen-top">
              <div class="dataScreen-main-title">
                <img src="./images/dataScreen-title-bg.png" alt="" />
                <span>餐饮订单量</span>
                <span class="date-picker-span">
                  <!-- 日期范围查询 -->
                  <el-date-picker
                    v-model="dateCateringRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                    format="YYYY-MM-DD"
                    @change="handleDateCateringChange"
                    class="date-picker"
                  />
                </span>
              </div>
              <div class="dataScreen-main-chart">
                <CateringDataChart
                  ref="cateringDataChartRef"
                  v-if="cateringScreenData.forStore.length > 0"
                  :data="cateringScreenData.forStore"
                />
              </div>
            </div>
          </div>
          <div class="dataScreen-rg">
            <div class="dataScreen-top">
              <div class="dataScreen-main-title">
                <img src="./images/dataScreen-title-bg.png" alt="" />
                <span>维修类型单量分布</span>
                <span class="date-picker-span">
                  <!-- 日期范围查询 -->
                  <el-date-picker
                    v-model="dateRangeRepair"
                    class="date-picker"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                    format="YYYY-MM-DD"
                    @change="handleDateRepairChange"
                  />
                </span>
              </div>
              <div class="dataScreen-main-chart">
                <Pie
                  v-if="reportData && reportData?.type.length > 0"
                  :data="reportData.type.map(val => ({ value: val.num, name: val.name }))"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="dataVisualize">
import Curve from "./components/curve.vue";
import HotPlateChart from "./components/HotPlateChart.vue";
import { getDeliveryOrderCount, getCateringScreenData } from "@/api/modules/dashboard";
import { ref, onMounted, reactive } from "vue";
import { DataVisualize } from "@/api/interface/dashboard";
import dayjs from "dayjs";
import { useFullscreen } from "@vueuse/core";
import CateringDataChart from "./components/CateringDataChart.vue";
import AgeRatioChart from "./components/AgeRatioChart.vue";
import { getRepairReport } from "@/api/modules/service/repair";
import { Repair } from "@/api/interface/service/repair";
import AnnualUseChart from "./components/AnnualUseChart.vue";
import Pie from "./components/pie.vue";
const el = ref<HTMLElement | null>(null);

const { isFullscreen, toggle } = useFullscreen(el);
const curveRef = ref();
const deliveryCompletionRate = ref<DataVisualize.ResDeliveryCompletionRate>({
  deliveryStaff: [],
  sourceMsg: []
});
const cateringScreenData = ref<DataVisualize.ResCateringScreenData>({
  forStore: [],
  forType: []
});
const getCateringScreenDataHandler = async () => {
  const res = await getCateringScreenData({
    beginTime: dateCateringRange.value[0],
    endTime: dateCateringRange.value[1]
  });
  cateringScreenData.value = res.data;
};
const getDeliveryOrderCountData = async () => {
  const res = await getDeliveryOrderCount({
    beginTime: dateRange.value[0],
    endTime: dateRange.value[1]
  });
  deliveryCompletionRate.value = res.data;
};

const dateRange = ref<string[]>([]);
const dataTime = reactive({
  data: dayjs().format("YYYY/MM/DD"),
  week: dayjs().locale("zh-cn").format("dddd"),
  time: dayjs().format("HH:mm:ss")
});
const dateCateringRange = ref<string[]>([]);

// 设置响应式
const resize = () => {
  // 重新加载板块
  getDeliveryOrderCountData();
};
onMounted(() => {
  getDeliveryOrderCountData();
  getCateringScreenDataHandler();
});
const handleDateChange = () => {
  deliveryCompletionRate.value.deliveryStaff = [];
  deliveryCompletionRate.value.sourceMsg = [];
  getDeliveryOrderCountData();
};

const dateRangeRepair = ref<string[]>([
  dayjs().subtract(6, "days").format("YYYY-MM-DD 00:00:00"),
  dayjs().format("YYYY-MM-DD 23:59:59")
]);
// 获取维修报告
const reportData = ref<Repair.RepairData>();
const getReportData = async () => {
  const res = await getRepairReport({
    beginTime: dateRangeRepair.value[0],
    endTime: dateRangeRepair.value[1]
  });
  reportData.value = res.data;
};
const handleDateRepairChange = () => {
  reportData.value = undefined;
  getReportData();
};
getReportData();
const handleDateCateringChange = () => {
  cateringScreenData.value.forStore = [];
  cateringScreenData.value.forType = [];
  getCateringScreenDataHandler();
};
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
