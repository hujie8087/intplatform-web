<template>
  <div class="data-analyze">
    <div class="header">
      <el-text size="large" class="title">分析概览</el-text>
      <div class="refresh">
        <el-tooltip class="box-item" effect="dark" content="点击刷新" placement="top-start">
          <el-icon @click="refresh" :class="{ rotating: isRotating }"><RefreshRight /></el-icon>
        </el-tooltip>
      </div>
    </div>
    <el-divider border-style="dashed" />

    <!-- 数据为空状态 -->
    <div v-if="dataList.length === 0" class="empty-state">
      <el-empty description="暂无数据" />
    </div>

    <div v-else class="content" v-for="(item, index) in dataList" :key="index">
      <div class="select">
        <el-text>{{ item.label }} ({{ item.type }})</el-text>
        <el-radio-group v-model="item.chartType" size="default">
          <el-radio-button label="柱状图" value="column" />
          <el-radio-button label="折线图" value="line" />
          <el-radio-button label="饼图" value="pie" />
        </el-radio-group>
      </div>
      <div class="chart">
        <ECharts ref="chartRefs[index]" :option="getOption(item)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="dataAnalyze">
import { ref, onMounted, watch } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import { ECOption } from "@/components/ECharts/config";
import { getProjectReportAnalysis } from "@/api/modules/questionnaire/stat";
import { useRoute } from "vue-router";
const route = useRoute();
const key = route.query.key as string | undefined;

const chartRefs = ref<(InstanceType<typeof ECharts> | null)[]>([]);
const dataList = ref<any>([]);

// 获取折线图配置
const getLineOption = (item): ECOption => {
  return {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        label: {
          backgroundColor: "#6a7985"
        }
      }
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    xAxis: [
      {
        type: "category",
        boundaryGap: false,
        data: item.fieldName,
        axisLabel: {
          color: "#a1a1a1",
          rotate: 30
        }
      }
    ],
    yAxis: [
      {
        type: "value",
        axisLabel: {
          color: "#a1a1a1"
        }
      }
    ],
    series: [
      {
        name: item.label,
        type: "line",
        stack: "Total",
        smooth: true,
        areaStyle: {
          opacity: 0.3
        },
        emphasis: {
          focus: "series"
        },
        data: item.data,
        markPoint: {
          data: [
            { type: "max", name: "最大值" },
            { type: "min", name: "最小值" }
          ]
        }
      }
    ]
  };
};

// 获取饼图配置
const getPieOption = (item): ECOption => {
  // 准备饼图数据
  const pieData = item.fieldName
    .map((name, index) => ({
      name,
      value: item.data[index]
    }))
    .filter(item => item.value > 0); // 过滤掉值为0的数据
  return {
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b} : {c} ({d}%)"
    },
    legend: {
      left: "center",
      top: "top",
      data: pieData.map(item => item.name),
      textStyle: {
        color: "#a1a1a1"
      }
    },
    series: [
      {
        name: item.label,
        type: "pie",
        radius: ["40%", "70%"],
        center: ["50%", "55%"],
        itemStyle: {
          borderRadius: 5,
          borderColor: "#fff",
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: "{b}: {c} ({d}%)"
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: "bold"
          }
        },
        data: pieData
      }
    ]
  };
};

// 获取柱状图配置
const getColumnOption = (item): ECOption => {
  return {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    xAxis: {
      type: "category",
      data: item.fieldName,
      axisLabel: {
        color: "#a1a1a1",
        rotate: 30 // 旋转标签防止重叠
      }
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#a1a1a1",
        formatter: "{value}"
      }
    },
    series: [
      {
        name: item.label,
        type: "bar",
        data: item.data,
        barWidth: "60%",
        itemStyle: {
          borderRadius: 4
        }
      }
    ]
  };
};

// 根据图表类型获取对应的配置
const getOption = (item): ECOption => {
  switch (item.chartType) {
    case "pie":
      return getPieOption(item);
    case "column":
      return getColumnOption(item);
    case "line":
      return getLineOption(item);
    default:
      return getPieOption(item);
  }
};

const getReportAnalysis = async () => {
  const res = await getProjectReportAnalysis(key);
  if (res.data) {
    dataList.value = res.data.map((item: any) => ({
      ...item,
      chartType: item.chartType || "pie" // 默认使用饼图
    }));
  }
};

// 监听数据变化，刷新图表
watch(
  dataList,
  newVal => {
    newVal.forEach((_, index) => {
      if (chartRefs.value[index]) {
        chartRefs.value[index]?.draw();
      }
    });
  },
  { deep: true }
);

// 监听每个item的图表类型变化，刷新对应图表
watch(
  () => dataList.value.map(item => item.chartType),
  (newVal, oldVal) => {
    newVal.forEach((_, index) => {
      if (newVal[index] !== oldVal[index] && chartRefs.value[index]) {
        chartRefs.value[index]?.draw();
      }
    });
  }
);

onMounted(() => {
  getReportAnalysis();
});

const isRotating = ref(false);
const refresh = () => {
  // 触发旋转动画
  isRotating.value = true;
  getReportAnalysis();
  // 动画结束后重置状态
  setTimeout(() => {
    isRotating.value = false;
  }, 500);
};
</script>

<style scoped lang="scss">
.data-analyze {
  min-height: calc(100vh - 200px); /* 确保容器至少占满视口高度 */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 20px;
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
  .content {
    display: flex;
    flex-direction: column;
    margin: 20px;
    .select {
      display: flex;
      justify-content: space-between;
    }
    .chart {
      width: 100%;
      height: 400px;
    }
  }
}
</style>
