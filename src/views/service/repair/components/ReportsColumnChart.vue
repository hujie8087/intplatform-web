<template>
  <div class="card content-box">
    <ECharts ref="echartsRef" :option="option" />
  </div>
</template>

<script setup lang="ts" name="columnChart">
import { ECOption } from "@/components/ECharts/config";
import ECharts from "@/components/ECharts/index.vue";
import { ref, watch } from "vue";
interface ChartProp {
  value: number;
  name: string;
}
const props = defineProps<{ data: ChartProp[] }>();

const option = ref<ECOption>({
  title: {
    text: "维修区域数据统计",
    left: "center"
  },
  xAxis: {
    type: "category",
    data: props.data.map(item => item.name)
  },
  yAxis: {
    type: "value"
  },
  series: [
    {
      data: props.data.map(item => item.value),
      type: "bar",
      barMaxWidth: 30
    }
  ]
});
watch(props, () => {
  option.value = {
    title: {
      text: "维修区域数据统计",
      left: "center"
    },
    xAxis: {
      type: "category",
      data: props.data.map(item => item.name)
    },
    yAxis: {
      type: "value"
    },
    series: [
      {
        data: props.data.map(item => item.value),
        type: "bar",
        barMaxWidth: 30
      }
    ]
  };
});
</script>
