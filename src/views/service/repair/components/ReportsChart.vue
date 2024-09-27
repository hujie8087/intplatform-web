<template>
  <!-- 年龄比例 -->
  <div class="card content-box">
    <ECharts ref="echartsRef" :option="option" :resize="false" />
  </div>
</template>

<script setup lang="ts" name="ReportsChart">
import ECharts from "@/components/ECharts/index.vue";
import { ECOption } from "@/components/ECharts/config";
import { ref, watch } from "vue";

const colors = ["#F6C95C", "#EF7D33", "#1F9393", "#184EA1", "#81C8EF", "#9270CA"];

interface ChartProp {
  value: number;
  name: string;
}
// 接收父组件参数
const props = defineProps<{ data: ChartProp[] }>();

const option = ref<ECOption>({
  title: {
    text: "维修类型数据统计",
    left: "center"
  },
  color: colors,
  tooltip: {
    show: true,
    trigger: "item",
    formatter: "{b} <br/>占比：{d}%"
  },
  legend: {
    orient: "vertical",
    right: 20,
    itemGap: 15,
    itemWidth: 14,
    formatter: function (name: string) {
      let text = "";
      props.data.forEach((val: ChartProp) => {
        if (val.name === name) text = " " + name;
      });
      return text;
    }
  },
  grid: { top: "bottom", left: 10, bottom: 10 },
  series: [
    {
      zlevel: 1,
      name: "比例",
      type: "pie",
      selectedMode: "single",
      radius: [90, 160],
      center: ["35%", "50%"],
      startAngle: 60,
      label: {
        position: "inside",
        show: true,
        fontSize: 18,
        fontWeight: "bold",
        rich: {
          b: {
            fontSize: 20,
            lineHeight: 30
          }
        }
      },
      itemStyle: {
        shadowColor: "rgba(0, 0, 0, 0.2)",
        shadowBlur: 10
      },
      data: props.data.map((val: ChartProp, index: number) => {
        return {
          value: val.value,
          name: val.name,
          itemStyle: {
            borderWidth: 10,
            shadowBlur: 20,
            borderColor: colors[index % colors.length],
            borderRadius: 10
          }
        };
      })
    },
    {
      name: "",
      type: "pie",
      selectedMode: "single",
      radius: [90, 160],
      center: ["35%", "50%"],
      startAngle: 60,
      data: [
        {
          value: 1000,
          name: "",
          label: {
            show: true,
            formatter: "{a|报修类型统计}",
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
});

watch(props, () => {
  option.value = {
    title: {
      text: "维修类型数据统计",
      left: "center"
    },
    color: colors,
    tooltip: {
      show: true,
      trigger: "item",
      formatter: "{b} <br/>占比：{d}%"
    },
    legend: {
      orient: "vertical",
      right: 20,
      itemGap: 15,
      itemWidth: 14,
      formatter: function (name: string) {
        let text = "";
        props.data.forEach((val: ChartProp) => {
          if (val.name === name) text = " " + name;
        });
        return text;
      }
    },
    grid: { top: "bottom", left: 10, bottom: 10 },
    series: [
      {
        zlevel: 1,
        name: "比例",
        type: "pie",
        selectedMode: "single",
        radius: [90, 160],
        center: ["35%", "50%"],
        startAngle: 60,
        label: {
          position: "inside",
          show: true,
          fontSize: 18,
          fontWeight: "bold",
          rich: {
            b: {
              fontSize: 20,
              lineHeight: 30
            }
          }
        },
        itemStyle: {
          shadowColor: "rgba(0, 0, 0, 0.2)",
          shadowBlur: 10
        },
        data: props.data.map((val: ChartProp, index: number) => {
          return {
            value: val.value,
            name: val.name,
            itemStyle: {
              borderWidth: 10,
              shadowBlur: 20,
              borderColor: colors[index % colors.length],
              borderRadius: 10
            }
          };
        })
      },
      {
        name: "",
        type: "pie",
        selectedMode: "single",
        radius: [90, 160],
        center: ["35%", "50%"],
        startAngle: 60,
        data: [
          {
            value: 1000,
            name: "",
            label: {
              show: true,
              formatter: "{a|报修类型统计}",
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
});
</script>
<style lang="scss" scoped></style>
