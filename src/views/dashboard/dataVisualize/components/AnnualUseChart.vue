<template>
  <!-- 年度使用 -->
  <div class="echarts">
    <ECharts :option="option" />
  </div>
</template>

<script setup lang="ts">
import ECharts from "@/components/ECharts/index.vue";
import { ECOption } from "@/components/ECharts/config";
import { PropType } from "vue";
import { Repair } from "@/api/interface/service/repair";

interface ChartProp {
  label: string;
  value: number[];
}
// 接收父组件的传参
const props = defineProps({
  data: {
    type: Object as PropType<Repair.RepairData>,
    required: true
  }
});
const inTotalList: number[] = props.data.region.map(val => val.total);
const outTotalList: number[] = props.data.type.map(val => val.num);
console.log(inTotalList, outTotalList);
const gradientColors = ["rgba(254, 219, 101,0.1)", "rgba(0, 122, 254,0.1)"];
const annualData = [
  {
    label: "总订单数",
    value: inTotalList
  },
  {
    label: "完成订单数",
    value: outTotalList
  }
];
const data = {
  data: annualData,
  unit: annualData.map(val => val.label),
  columns: Object.keys(props.data).sort((b, a) => b.localeCompare(a)),
  colors: ["#007AFE", "#FFA600"]
};

const option: ECOption = {
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "none"
    },
    borderWidth: 0,
    padding: 0,
    backgroundColor: "transparent",
    formatter: (params: any) => {
      let str = "";
      params.forEach((val: { color: string; seriesName: string; data: number }) => {
        str += `
            <div class="year-item">
              <span class="year-dot" style="background-color: ${val.color};"></span>
              <span class="year-name" style="margin-right:15px">${val.seriesName}</span>
              <span class="year-value" style="color: ${val.color};">${val.data}</span>
            </div>
            `;
      });
      const dom = `
                      <div class="annual-tooltip">
                        <span class="annual-month">${params[0].axisValue}区域</span>
                        <div class="annual-list">
                          ${str}
                        </div>
                      </div>
                    `;
      return dom;
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
  grid: {
    top: "20%",
    left: "40",
    right: "4%",
    bottom: "20%"
  },
  xAxis: [
    {
      name: "(区域)",
      type: "category",
      boundaryGap: false,
      axisLine: {
        show: true,
        lineStyle: {
          color: "#233653"
        }
      },
      axisLabel: {
        color: "#3F559C",
        padding: 0,
        fontSize: 12,
        rotate: 45,
        formatter: function (data) {
          return data;
        }
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: "#192a44"
        }
      },
      axisTick: {
        show: false
      },
      data: props.data.region.map(val => val.repairArea)
    }
  ],
  yAxis: {
    name: "(订单数)",
    nameTextStyle: {
      color: "#D6DFEA",
      fontSize: 12,
      padding: [0, 30, 0, 0]
    },
    minInterval: 1,
    splitNumber: 5,
    splitLine: {
      show: false,
      lineStyle: {
        color: "#192a44"
      }
    },
    axisLine: {
      show: true,
      lineStyle: {
        color: "#233653"
      }
    },
    axisLabel: {
      show: true,
      color: "#3F559C",
      padding: 0
    },
    axisTick: {
      show: false
    }
  },
  series: data.data.map((val: ChartProp, index: number) => {
    return {
      name: val.label,
      type: "line",
      symbol: "circle",
      showSymbol: false,
      smooth: true,
      lineStyle: {
        width: 1,
        color: data.colors[index],
        borderColor: data.colors[index]
      },
      itemStyle: {
        color: data.colors[index],
        borderColor: "#646ace",
        borderWidth: 2
      },
      tooltip: {
        show: true
      },
      areaStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: data.colors[index]
            },
            {
              offset: 1,
              color: gradientColors[index]
            }
          ],
          global: false
        },
        shadowColor: "rgba(25,163,223, 0.3)",
        shadowBlur: 20
      },
      data: val.value
    };
  })
};
</script>
<style lang="scss" scoped>
.echarts {
  width: 100%;
  height: 100%;
}
:deep(.annual-tooltip) {
  box-sizing: border-box;
  width: 156px;
  padding: 5px;
  background-color: rgb(255 255 255 / 80%);
  border-radius: 10px;
  .annual-month {
    display: inline-block;
    margin-bottom: 2px;
    font-size: 12px;
    color: #03b8e2;
  }
  .annual-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    .year-item {
      display: flex;
      align-items: center;
      width: 100%;
      height: 22px;
      .year-dot {
        width: 5px;
        height: 5px;
        margin: 0 2px;
        border-radius: 50%;
      }
      .year-name,
      .year-value {
        font-size: 12px;
        color: #03b8e2;
      }
      .year-name {
        margin: 0 2px;
      }
      .year-value {
        display: inline-block;
        width: 25%;
      }
    }
  }
}
</style>
