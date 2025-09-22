<template>
  <div class="stat-view">
    <div class="header">
      <el-text size="large" class="title">回收概览</el-text>
      <div class="refresh">
        <el-tooltip class="box-item" effect="dark" content="点击刷新" placement="top-start">
          <el-icon @click="refresh" :class="{ rotating: isRotating }"><RefreshRight /></el-icon>
        </el-tooltip>
      </div>
    </div>
    <div class="stat-menu">
      <div class="menu-item">
        <el-text>有效回收量</el-text>
        <span class="huishou-tongji">{{ statData?.completeCount ?? "-" }}</span>
      </div>
      <div class="menu-item">
        <el-text>总浏览量</el-text>
        <span class="huishou-tongji second-tongji">{{ statData?.viewCount ?? "-" }}</span>
      </div>
      <div class="menu-item">
        <el-text>平均完成时间</el-text>
        <span class="huishou-tongji last-tongji">{{ statData?.avgCompleteTime ?? "-" }}</span>
      </div>
    </div>
    <div class="week-chart">
      <ECharts ref="lineChartRef" :option="lineChartOption" />
    </div>
    <div class="bottom-chart">
      <div class="item device">
        <el-text class="tit" size="large">常用设备</el-text>
        <ECharts ref="deviceChartRef" :option="deviceOption" />
      </div>
      <div class="item source">
        <el-text class="tit" size="large">来源渠道</el-text>
        <ECharts ref="sourceChartRef" :option="sourceOption" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="statView">
import { ref, onMounted } from "vue";
import { ECOption } from "@/components/ECharts/config";
import ECharts from "@/components/ECharts/index.vue";
import {
  getProjectReportStats,
  getProjectReportSituation,
  getProjectReportDevice,
  getProjectReportSource
} from "@/api/modules/questionnaire/stat";
import { StatType } from "@/api/interface/questionnaire/stat";
import { useRoute } from "vue-router";
const route = useRoute();
const key = route.query.key as string | undefined;

const statData = ref<StatType.ReportStatsEntity | null>(null);
const lineChartRef = ref<InstanceType<typeof ECharts> | null>(null);
const deviceChartRef = ref<InstanceType<typeof ECharts> | null>(null);
const sourceChartRef = ref<InstanceType<typeof ECharts> | null>(null);

// 获取回收状态
const getProjectReportStatsData = async () => {
  const res = await getProjectReportStats(key);
  const data = res.data; // 明确类型断言，避免 any
  if (data) {
    statData.value = data;
  }
};

// 获取项目周回收数量
const getProjectSituationData = async () => {
  const res = await getProjectReportSituation(key);
  const data = res.data; // 明确类型断言，避免 any
  // situationData.value = data;
  if (data) {
    // 更新 x轴时间数据
    lineChartOption.xAxis[0].data = data.map(item => item.createTime);
    // 更新 系列数据（回收数）
    lineChartOption.series[0].data = data.map(item => item.count);
    if (lineChartRef.value) {
      lineChartRef.value.draw(); // 第二个参数true表示全量更新
    }
  }
};

const lineChartOption: ECOption = {
  title: {
    textStyle: {
      color: "#a1a1a1"
    }
  },
  tooltip: {
    trigger: "axis"
  },
  grid: {
    top: "12px",
    left: "3%",
    right: "4%",
    bottom: "7%",
    containLabel: true
  },
  xAxis: [
    {
      type: "category",
      boundaryGap: false,
      data: [],
      axisLine: {
        lineStyle: {
          color: "#999"
        }
      },
      axisTick: { show: false },
      axisLabel: {
        color: "#333"
      }
    }
  ],
  yAxis: [
    {
      type: "value",
      axisLabel: {
        color: "#666"
      },
      splitLine: {
        lineStyle: {
          type: "dashed"
        }
      }
    }
  ],
  series: [
    {
      name: "有效回收量",
      type: "line",
      smooth: true,
      stack: "Total",
      // areaStyle: {},
      // emphasis: {
      //   focus: "series"
      // },
      data: []
    }
  ]
};

// 获取项目设备数据
const getProjectDeviceData = async () => {
  const res = await getProjectReportDevice(key);
  const data = res.data;
  if (data) {
    deviceOption.series[0].data = data.map(item => {
      return {
        value: item.count,
        name: item.osName ? item.osName : "其他"
      };
    });
    if (deviceChartRef.value) {
      deviceChartRef.value.draw();
    }
  }
};

const deviceOption: ECOption = {
  tooltip: {
    trigger: "item",
    formatter: "{a} <br/>{b} : {c} ({d}%)"
  },
  legend: {
    left: "center",
    top: "top",
    data: [],
    textStyle: {
      color: "#a1a1a1"
    }
  },
  series: [
    {
      name: "设备类型",
      type: "pie",
      radius: [80, 110],
      center: ["50%", "45%"],
      itemStyle: {
        borderRadius: 5
      },
      label: {
        show: true
      },
      emphasis: {
        label: {
          show: true
        }
      },
      data: []
    }
  ]
};

// 获取来源数据
const getSourceData = async () => {
  const res = await getProjectReportSource(key);
  const data = res.data;
  if (data) {
    sourceOption.yAxis.data = data.map(item => {
      return item.browserName ? item.browserName : "其他";
    });
    sourceOption.series = [
      {
        barWidth: 30,
        name: "数量",
        type: "bar",
        data: data.map(item => {
          return item.count;
        })
      }
    ];
    if (sourceChartRef.value) {
      sourceChartRef.value.draw();
    }
  }
};

const sourceOption: ECOption = {
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow"
    }
  },
  legend: {},
  xAxis: {
    type: "value",
    boundaryGap: [0, 0.01]
  },
  yAxis: {
    type: "category",
    data: []
  },
  series: [
    {
      name: "2011",
      type: "bar",
      data: []
    }
  ]
};

onMounted(() => {
  getProjectReportStatsData();
  getProjectSituationData();
  getProjectDeviceData();
  getSourceData();
});

const isRotating = ref(false);
const refresh = () => {
  // 触发旋转动画
  isRotating.value = true;
  getProjectReportStatsData();
  getProjectSituationData();
  getProjectDeviceData();
  getSourceData();
  // 动画结束后重置状态
  setTimeout(() => {
    isRotating.value = false;
  }, 500);
};
</script>

<style scoped lang="scss">
.stat-view {
  margin: 10px 12px;
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px;
    background-color: #ffffff;
    border-bottom: 1px solid var(--el-border-color-light);
    border-radius: 6px 6px 0 0;
    box-shadow: 0 0 12px rgb(0 0 0 / 5%);
    .refresh {
      cursor: pointer;
      .el-icon {
        font-size: 18px; /* 调整图标大小 */
        cursor: pointer;
        transition: transform 0.5s ease-in-out; /* 平滑过渡效果 */
      }
      .rotating {
        transform: rotate(180deg); /* 旋转180度 */
      }
    }
  }
  .stat-menu {
    display: flex;
    width: 100%;
    height: 65px;
    background: #ffffff;
    .menu-item {
      display: flex;
      flex: 1;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  }
  .week-chart {
    width: 100%;
    height: 290px;
    background: #ffffff;
    border-radius: 0 0 6px 6px;
    box-shadow: 0 0 12px rgb(0 0 0 / 5%);
  }
  .bottom-chart {
    display: flex;
    height: 350px;
    margin-top: 10px;
    .item {
      display: flex;
      flex: 1;
      flex-direction: column;
      .tit {
        margin: 10px 0;
      }
    }
    .device,
    .source {
      background: #ffffff;
      border: 1px solid var(--el-border-color-light);
      border-radius: 6px;
      box-shadow: 0 0 12px rgb(0 0 0 / 5%);
    }
    .device {
      margin-right: 5px;
    }
    .source {
      margin-left: 5px;
    }
  }
}
.huishou-tongji {
  font-size: 20px;
  font-weight: bold;
  color: #333333;
  color: var(--el-color-danger);
}
.huishou-tongji.second-tongji {
  color: var(--el-color-primary);
}
.huishou-tongji.last-tongji {
  color: var(--el-color-warning);
}
</style>
