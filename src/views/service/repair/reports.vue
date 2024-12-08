<template>
  <div class="main-box">
    <div class="table-box">
      <div class="card table-search">
        <el-form :inline="true" :model="formInline" class="demo-form-inline">
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="formInline.data"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              :default-time="defaultTime2"
              @change="changeDate"
            />
          </el-form-item>
          <!-- <el-form-item>
            <el-button type="warning" :icon="Download" plain @click="downloadFile">导出用户数据</el-button>
          </el-form-item> -->
        </el-form>
      </div>
      <div class="card table-main">
        <el-row type="flex" justify="space-evenly">
          <el-col :span="10">
            <div class="report-type">
              <ReportsChart ref="reportsChart" v-if="reportTypeData.length > 0" :data="reportTypeData" />
            </div>
          </el-col>
          <el-col :span="10">
            <ReportsColumnChart ref="reportsColumnChartRef" v-if="reportRegionData.length > 0" :data="reportRegionData" />
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>
<script setup lang="tsx" name="RepairType">
import { ref, reactive } from "vue";
import { getRepairReport } from "@/api/modules/service/repair";
import { Repair } from "@/api/interface/service/repair";
import { useDict } from "@/hooks/useDict";
import { DictOptions } from "@/api/interface";
import dayjs from "dayjs";
import ReportsChart from "./components/ReportsChart.vue";
import ReportsColumnChart from "./components/ReportsColumnChart.vue";
// import { Download } from "@element-plus/icons-vue";
// import { ElMessageBox } from "element-plus";
// import { useDownload } from "@/hooks/useDownload";

interface ChartProp {
  value: number;
  name: string;
}
const reportTypeData = ref<ChartProp[]>([]);
const reportRegionData = ref<ChartProp[]>([]);
// 字典数据
const sys_normal_disable = ref<DictOptions[]>([]);
useDict("sys_normal_disable").then(res => {
  sys_normal_disable.value = res.sys_normal_disable;
});
const initParam = reactive({
  beginTime: dayjs().subtract(6, "days").format("YYYY-MM-DD 00:00:00"),
  endTime: dayjs().format("YYYY-MM-DD 23:59:59")
});
const defaultTime2: [Date, Date] = [new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)];
const formInline = reactive({
  data: [initParam.beginTime, initParam.endTime]
});

const reportData = ref<Repair.RepairData>();
// 获取报表数据
const getReportData = async () => {
  const res = await getRepairReport(initParam);
  reportData.value = res.data;
  reportTypeData.value = res.data.type
    ? res.data.type.map(item => {
        return {
          value: item.num,
          name: item.name
        };
      })
    : [];
  reportRegionData.value = res.data.region
    ? res.data.region.map(item => {
        return {
          value: item.num,
          name: item.repairArea
        };
      })
    : [];
};
const reportsChart = ref();
const reportsColumnChartRef = ref();
const changeDate = val => {
  initParam.beginTime = val[0];
  initParam.endTime = val[1];
  getReportData();
};
// const downloadFile = async () => {
//   ElMessageBox.confirm("确认导出报修数据?", "温馨提示", { type: "warning" }).then(() =>
//     useDownload("", "报修数据报表", true, ".xlsx", "post", initParam)
//   );
// };
getReportData();
</script>
<style lang="scss">
.report-type {
  width: 100%;
  height: 500px;
}
</style>
