<template>
  <div class="echarts">
    <ECharts :option="option" />
  </div>
</template>

<script setup lang="ts" name="pie">
import { ECOption } from "@/components/ECharts/config";
import ECharts from "@/components/ECharts/index.vue";
import { PropType } from "vue";
const props = defineProps({
  data: {
    type: Array as PropType<{ value: number; name: string }[]>,
    required: true
  }
});
const colors = ["#F6C95C", "#EF7D33", "#1F9393", "#184EA1", "#81C8EF", "#9270CA", "#D0D0D0"];

const pieData = props.data;
const option: ECOption = {
  color: colors,
  tooltip: {
    trigger: "item"
  },
  legend: {
    orient: "vertical",
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

  series: [
    {
      name: "Access From",
      type: "pie",
      radius: "80%",
      data: pieData,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: "rgba(0, 0, 0, 0.5)"
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
