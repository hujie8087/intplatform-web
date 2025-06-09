<template>
  <div class="echarts">
    <ECharts :option="option" />
  </div>
</template>

<script setup lang="ts">
import ECharts from "@/components/ECharts/index.vue";
import { ECOption } from "@/components/ECharts/config";
import { onMounted, PropType } from "vue";
import { DataVisualize } from "@/api/interface/dashboard";
interface ChartProp {
  name: string;
  value: number;
}
// 接收父组件的传参
const props = defineProps({
  data: {
    type: Array as PropType<DataVisualize.DeliveryStaff[]>,
    required: true
  }
});

const dataList = props.data
  .map(item => {
    return {
      value: item.orderCount,
      name: item.deliveryName
    };
  })
  .sort((a, b) => b.value - a.value);
const colors = ["#1089E7", "#F57474", "#56D0E3", "#F8B448", "#8B78F6"];

const option: ECOption = {
  grid: {
    top: "0%",
    left: "4%",
    right: "4%",
    bottom: "1%",
    containLabel: true
  },
  xAxis: {
    type: "value",
    axisLine: {
      show: false,
      lineStyle: {
        color: "#00c1de"
      }
    },
    nameGap: 1,
    splitLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      show: false,
      fontSize: 16
    },
    triggerEvent: false
  },
  yAxis: [
    {
      show: true,
      data: dataList.map((val: ChartProp) => val.name),
      inverse: true,
      axisLabel: {
        color: "#00c1de"
      },
      axisLine: {
        show: false
      },
      splitLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      triggerEvent: false
    },
    {
      show: true,
      inverse: true,
      data: dataList,
      axisLabel: {
        show: false
      },
      axisLine: {
        show: false
      },
      splitLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      triggerEvent: false
    }
  ],
  series: [
    {
      name: "条",
      type: "bar",
      yAxisIndex: 0,
      data: dataList,
      barWidth: 16,
      itemStyle: {
        borderRadius: 30,
        color: function (params) {
          let num = colors.length;
          return colors[params.dataIndex % num];
        }
      },
      label: {
        show: true,
        position: [12, 0],
        lineHeight: 16,
        color: "#fff"
      }
    }
  ]
};
// 窗口变化重新加载
onMounted(() => {
  window.addEventListener("resize", () => {
    option.series![0].data = props.data;
  });
});
</script>
<style lang="scss" scoped>
.echarts {
  width: 100%;
  height: 100%;
}
.echarts-header {
  box-sizing: border-box;
  display: flex;
  height: 36px;
  margin: 10px 10px 0;
  line-height: 36px;
  background: url("../images/rankingChart-bg.png") no-repeat;
  background-size: 100% 100%;
  span {
    width: 18%;
    margin-left: 4px;
    font-size: 14px;
    font-weight: bold;
    color: #fdbc52;
    text-align: center;
    &:nth-child(2) {
      margin-left: 4px;
    }
    &:last-child {
      width: 20%;
      margin-left: 60px;
    }
  }
}
</style>
