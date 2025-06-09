<template>
  <!-- 员工居住区域分布比例 -->
  <div class="echarts">
    <ECharts :option="option" />
  </div>
</template>

<script setup lang="ts">
import ECharts from "@/components/ECharts/index.vue";
import { ECOption } from "@/components/ECharts/config";
import { PropType, ref } from "vue";
import { DataVisualize } from "@/api/interface/dashboard";
interface ChartProp {
  value: number;
  name: string;
  percentage: string;
}
// 接收父组件的传参
const props = defineProps({
  data: {
    type: Array as PropType<DataVisualize.Store[]>,
    required: true
  }
});
const total = ref(props.data.reduce((acc, item) => acc + item.num, 0));
const dataList = ref<ChartProp[]>(
  props.data.map(item => ({
    value: item.num,
    name: item.type,
    percentage: `${((item.num / total.value) * 100).toFixed(2)}%`
  }))
);

const colors = ["#F6C95C", "#EF7D33", "#1F9393", "#184EA1", "#81C8EF", "#9270CA", "#D0D0D0"];

const option: ECOption = {
  color: colors,
  tooltip: {
    show: true,
    trigger: "item",
    formatter: "{b} <br/>订单量：{c}<br/>占比：{d}%"
  },
  legend: {
    orient: "vertical",
    right: "10px",
    top: "10px",
    itemGap: 10,
    itemWidth: 14,
    formatter: function (name: string) {
      let text = "";
      dataList.value.forEach((val: ChartProp) => {
        if (val.name === name) text = " " + name + "　 " + val.value;
      });
      return text;
    },
    textStyle: { color: "#3F559C", textAlign: "left", fontSize: 12 }
  },
  grid: { top: "bottom", left: 10, bottom: 10 },
  series: [
    {
      zlevel: 1,
      name: "餐饮类型分布",
      type: "pie",
      selectedMode: "single",
      radius: [70, 120],
      center: ["40%", "50%"],
      startAngle: 60,
      label: {
        position: "inside",
        show: true,
        color: "#fff",
        formatter: function (params) {
          return (params.data as ChartProp).percentage;
        },
        rich: {
          b: {
            fontSize: 16,
            lineHeight: 30,
            color: "#fff"
          }
        }
      },
      itemStyle: {
        shadowColor: "rgba(0, 0, 0, 0.2)",
        shadowBlur: 10
      },
      data: dataList.value.map((val: ChartProp, index: number) => {
        return {
          value: val.value,
          name: val.name,
          percentage: val.percentage,
          itemStyle: {
            borderWidth: 5,
            shadowBlur: 10,
            borderColor: colors[index % colors.length],
            borderRadius: 5
          }
        };
      })
    },
    {
      name: "",
      type: "pie",
      selectedMode: "single",
      radius: [70, 120],
      center: ["40%", "50%"],
      startAngle: 60,
      data: [
        {
          value: 1000,
          name: "",
          label: {
            show: true,
            formatter: "{a|餐饮类型分布比例}",
            rich: {
              a: {
                align: "center",
                color: "rgb(98,137,169)",
                fontSize: 14
              }
            },
            position: "center"
          }
        }
      ]
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
