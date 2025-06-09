<template>
  <!-- 员工居住区域分布比例 -->
  <div class="echarts">
    <!-- <ECharts :option="option" ref="chartRef" /> -->
    <div id="buildingList" ref="chartRef" style="width: 100%; height: 100%"></div>
  </div>
</template>

<script setup lang="ts" name="CateringDataChart">
import { ECOption } from "@/components/ECharts/config";
import { onMounted, PropType, ref } from "vue";
import * as echarts from "echarts";
import { DataVisualize } from "@/api/interface/dashboard";

const colors: string[] = ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"];

// 接收父组件的传参
const props = defineProps({
  data: {
    type: Array as PropType<DataVisualize.Store[]>,
    required: true
  }
});
const chartRef = ref<HTMLElement | null>(null);
const option = ref<ECOption>({
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow"
    }
  },
  legend: {
    right: "2%",
    top: "0%",
    itemWidth: 15,
    itemHeight: 6,
    align: "auto",
    icon: "rect",
    itemGap: 15,
    textStyle: {
      color: "#3F559C"
    }
  },
  xAxis: {
    data: props.data.map(item => item.store!),
    axisLine: {
      lineStyle: {
        color: "#3F559C"
      }
    },
    axisLabel: { interval: 0, rotate: 30 }
  },
  yAxis: {
    splitLine: { show: false },
    axisLine: {
      lineStyle: {
        color: "#3F559C"
      }
    }
  },
  series: [
    {
      name: "订单数量",
      type: "bar",
      id: "sales",
      dataGroupId: "sales",
      barWidth: 20,
      itemStyle: {
        borderRadius: [10, 10, 0, 0]
      },
      label: {
        show: true,
        position: "top"
      },

      data: props.data.map((item, index) => {
        return {
          value: item.num,
          itemStyle: {
            color: colors[index % colors.length]
          }
        };
      }),
      zlevel: 10,
      universalTransition: {
        enabled: true,
        divideShape: "clone"
      }
    }
  ]
});

onMounted(() => {
  const chartDom = document.getElementById("buildingList")!;
  const myChart = echarts.init(chartDom);
  myChart.setOption(option.value);
  // 窗口变化重新加载
  window.addEventListener("resize", () => {
    myChart.resize();
  });
});
</script>
<style lang="scss" scoped>
.echarts {
  width: 100%;
  height: 100%;
}
</style>
