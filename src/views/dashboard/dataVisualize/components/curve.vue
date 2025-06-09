<template>
  <div class="echarts">
    <ECharts :option="option" />
  </div>
</template>

<script setup lang="ts" name="cure">
import echarts, { ECOption } from "@/components/ECharts/config";
import ECharts from "@/components/ECharts/index.vue";
import { DataVisualize } from "@/api/interface/dashboard";
const props = defineProps<{
  data: DataVisualize.DeliveryStaff[];
  label: string;
  value: string;
}>();

// 接收父组件传入的label
const label = props.label;
const value = props.value;

const curveData = props.data;
const colors = ["#F6C95C", "#EF7D33", "#1F9393", "#184EA1", "#81C8EF", "#9270CA", "#D0D0D0"];
const option: ECOption = {
  color: colors,
  tooltip: {
    trigger: "axis",
    backgroundColor: "transparent",
    axisPointer: {
      type: "none"
    },
    padding: 0,
    formatter: (p: any) => {
      let dom = `<div style="width:100%; height: 70px !important; display:flex;flex-direction: column;justify-content: space-between;padding:10px;box-sizing: border-box;
      color:#fff; background: #6B9DFE;border-radius: 4px;font-size:14px; ">
        <div style="display: flex; align-items: center;"> <div style="width:5px;height:5px;background:#ffffff;border-radius: 50%;margin-right:5px"></div>${p[0].name}</div>
        <div style="display: flex;align-items: center;"><div style="width:5px;height:5px;background:#ffffff;border-radius: 50%;margin-right:5px"></div>订单量 :  ${p[0].value}</div>
      </div>`;
      return dom;
    }
  },
  toolbox: {
    show: true,
    orient: "horizontal"
  },
  grid: {
    left: "0",
    right: "0",
    bottom: "50px"
  },
  dataZoom: [
    {
      show: false,
      height: 10,
      xAxisIndex: [0],
      bottom: 0,
      startValue: 0,
      endValue: 9,
      handleStyle: {
        color: "#6b9dfe"
      },
      textStyle: {
        color: "transparent"
      }
    },
    {
      type: "inside",
      show: true,
      height: 0,
      zoomLock: true
    }
  ],
  xAxis: [
    {
      type: "category",
      data: curveData.map((val: any) => {
        return {
          value: val[label]
        };
      }),
      axisTick: {
        show: false
      },
      axisLabel: {
        margin: 20,
        interval: 0,
        color: "#3F559C",
        fontSize: 12,
        formatter: function (name: string) {
          return name !== null ? (name.length > 8 ? name.slice(0, 8) + "..." : name) : "--";
        }
      },
      axisLine: {
        lineStyle: {
          color: "#c0c0c0"
        }
      }
    }
  ],
  yAxis: [
    {
      min: 0,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: "#c0c0c0"
        }
      },
      axisLabel: {
        color: "#a1a1a1",
        fontSize: 16,
        fontWeight: 400,
        formatter: function (value: number) {
          if (value === 0) {
            return value + "";
          } else if (value >= 10000) {
            return (value / 10000).toFixed(1) + "w";
          }
          return value + "";
        }
      }
    }
  ],
  series: [
    {
      name: "Direct",
      type: "bar",
      data: curveData.map((val: any) => {
        return {
          value: val[value]
        };
      }),
      barWidth: "25px",
      label: {
        show: true,
        position: "top"
      },
      itemStyle: {
        // 渐变
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "#C5D8FF" },
          { offset: 1, color: "#6B9DFE" }
        ]),
        borderRadius: [12, 12, 0, 0]
      },
      emphasis: {
        itemStyle: {
          color: "#6B9DFE"
        }
      }
    }
  ]
};
</script>

<style lang="scss" scoped>
.echarts {
  width: 100%;
  height: 100%;
}
</style>
