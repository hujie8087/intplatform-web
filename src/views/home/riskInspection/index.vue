<template>
  <div class="maintenance-report">
    <!-- 隐患排查 -->
    <div class="maintenance-report-top">
      <ul class="person-info-top-item-wrapper">
        <li class="person-info-top-item">
          <div class="person-info-top-item-top">排查总数量</div>
          <div class="person-info-top-item-bottom">
            <img src="../images/big1.png" alt="" style="width: 21px; height: 19px" />
            <!-- <dv-digital-flop :config="config.totalCount" style="width: 75%; height: 25px" /> -->
            <count-up :start-val="0" class="count-number" :end-val="hiddenDangerData.totalCount" :duration="2"></count-up>
          </div>
        </li>
        <li class="person-info-top-item">
          <div class="person-info-top-item-top">已处理隐患</div>
          <div class="person-info-top-item-bottom">
            <img src="../images/big2.png" alt="" style="width: 19px; height: 22px" />
            <!-- <dv-digital-flop :config="config.processedCount" style="width: 75%; height: 25px; text-align: left" /> -->
            <count-up :start-val="0" class="count-number" :end-val="hiddenDangerData.processedCount" :duration="2"></count-up>
          </div>
        </li>
        <li class="person-info-top-item">
          <div class="person-info-top-item-top">正在处理隐患</div>
          <div class="person-info-top-item-bottom">
            <img src="../images/big3.png" alt="" style="width: 18px; height: 19px" />
            <!-- <dv-digital-flop :config="config.processingCount" style="width: 75%; height: 25px; text-align: left" /> -->
            <count-up
              :start-val="0"
              class="count-number"
              :end-val="hiddenDangerData.processingCount + hiddenDangerData.waitCount"
              :duration="2"
            ></count-up>
          </div>
        </li>
      </ul>
    </div>
    <div class="maintenance-report-bottom">
      <div class="maintenance-report-bottom-bar">
        <div class="bar-title">隐患排查</div>
        <div class="bar-sub-title">
          <ul class="bar-date-tab">
            <li
              :class="['bar-date-tab-item', activeType == item.value ? 'bar-date-tab-item-active' : '']"
              v-for="(item, index) in dateType"
              :key="index"
              @click="changeData(item.value)"
            >
              {{ item.name }}
            </li>
          </ul>
          <div class="bar-date-icon">
            <img src="../images/date.png" alt="" />
          </div>
        </div>
        <div style="height: 73%">
          <ECharts :option="barOption" ref="pieChartRef" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import { ECOption } from "@/components/ECharts/config";
import { getCheckHiddenDanger } from "@/api/modules/dashboard";
import CountUp from "vue-countup-v3";
import { DataVisualize } from "@/api/interface/dashboard";

const hiddenDangerData = ref<DataVisualize.CheckHiddenDanger>({
  totalCount: 0,
  waitCount: 0,
  processingCount: 0,
  processedCount: 0
});
const activeType = ref("day");
const dateType = [
  {
    name: "今日",
    value: "day"
  },
  {
    name: "本周",
    value: "week"
  },
  {
    name: "本月",
    value: "month"
  },
  {
    name: "全年",
    value: "year"
  }
];
const pieChartRef = ref();
const barOption = reactive<ECOption>({});
const initPage = async () => {
  const res = await getCheckHiddenDanger({});
  const data = res.data;
  hiddenDangerData.value = data;
};
const initChartData = async dateType => {
  const res = await getCheckHiddenDanger({ dateType });
  const data = res.data;
  initPieChart(data);
};
const initPieChart = (data: DataVisualize.CheckHiddenDanger) => {
  // 进行中 = 处理中数量+待处理数量
  let underWay = data.processingCount + data.waitCount;
  let text = "";
  switch (activeType.value) {
    case "day":
      text = "当日";
      break;
    case "week":
      text = "本周";
      break;
    case "month":
      text = "本月";
      break;
    default:
      text = "全年";
      break;
  }
  let option = {
    title: {
      text: `${text}排查总量\n${data.totalCount.toLocaleString("en-US")}`,
      left: "center",
      top: "30%",
      textStyle: {
        fontSize: 14,
        color: "#000", // 改为黑色，白色背景上才看得清
        fontWeight: "normal",
        lineHeight: 24
      }
    },
    grid: {
      top: 10,
      left: "8%",
      right: "8%",
      bottom: "5%",
      containLabel: true
    },
    tooltip: {
      trigger: "item",
      confine: true,
      formatter: data => {
        let seriesName = data.seriesName;
        if (seriesName !== "排查状态") {
          let str = "<div>";
          str += `
          <span style="width: 10px;height: 10px;display:inline-block;border-radius: 50%;background:${data.color} "></span>
          <span style="font-size:12px">${data.name}:</span>
          <span style="font-size:12px">${data.value}</span>
          <span style="font-size:12px"> (${data.percent}%)</span>
          `;
          console.log(data);
          str += "</div>";
          return str;
        }
      }
    },
    legend: {
      bottom: 10, // 放在底部
      itemWidth: 10, // 图例标记的宽度
      itemHeight: 10, // 图例标记的高度
      left: "center",
      textStyle: {
        color: "#fff" // 图例文字白色
      },
      icon: "circle",
      data: ["已处理", "进行中"],
      itemStyle: {
        borderWidth: 0
      }
    },
    series: [
      {
        name: "隐患数量",
        type: "pie", // 饼图类型
        radius: ["40%", "60%"], // 环形图的内外半径，实现环形效果
        center: ["50%", "40%"], // 中心位置
        color: ["#313CA9", "#21CCFF"], // 三种颜色，对应图例
        // 鼠标移上去的item不会凸出了
        hoverAnimation: false,
        z: 2,
        label: {
          show: true, // 不显示饼图上的文本标签
          normal: {
            formatter: "{d|{d}%}", //显示文字样式
            rich: {
              d: {
                fontSize: 13,
                color: "#fff"
              }
            }
          }
        },
        labelLine: {
          show: true
        },
        data: [
          { value: data.processedCount, name: "已处理" }, // 36%
          { value: underWay, name: "进行中" } // 48%
        ],
        itemStyle: {
          //饼图按块划分时是否需要用线隔开，
          normal: {
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.6)"
          }
        }
      },
      {
        name: "排查状态",
        type: "pie",
        radius: "45%",
        // 鼠标移上去的item不会凸出了
        hoverAnimation: false,
        labelLine: {
          show: false
        },
        label: {
          show: false
        },
        center: ["50%", "40%"],
        color: ["#fff"],
        data: [300],
        z: 1
      }
    ]
  };
  Object.assign(barOption, option);
};
const changeData = type => {
  activeType.value = type;
  initChartData(type);
};
const zoomResize = () => {
  pieChartRef.value?.resize();
};
onMounted(() => {
  initPage();
  changeData(activeType.value);
});
defineExpose({ zoomResize });
</script>

<style scoped>
.maintenance-report {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 4;
  width: 100%;
  height: calc(100% - 130px);
  pointer-events: none;
}
.maintenance-report-top {
  position: absolute;
  top: 0;
  left: 30%;
  width: 40%;

  /* height: 12%; */
  height: 84px;
  overflow: hidden;
}
.person-info-top-item-wrapper {
  display: flex;
  justify-content: space-between;
  height: 100%;
  padding: 0;
  margin: 0;
}
.person-info-top-item {
  box-sizing: border-box;
  min-width: 150px;
  height: 100%;
  padding: 0 15px;
  list-style: none;
  pointer-events: auto;
  background: linear-gradient(180deg, #01023c 0%, #0e3047 100%);
  border-radius: 8px;
  opacity: 1;
}
.person-info-top-item-top {
  padding-top: 10%;
  padding-bottom: 8%;
  font-size: 12px;
  font-weight: bold;
  line-height: 20px;
  color: #ffffff;
}
.person-info-top-item-bottom {
  display: flex;
  align-items: center;
}
.person-info-top-item-bottom .count-number {
  display: inline-block;
  margin-left: 5px;
  font-size: 26px;
  font-weight: bold;
  line-height: 25px;
  color: #ffffff;
  vertical-align: top;
}
.person-info-top-item-bottom span {
  padding-left: 10px;
  font-size: 26px;
  font-weight: bold;
  line-height: 34px;
  color: #ffffff;
}
.maintenance-report-bottom {
  position: absolute;
  bottom: 36%;
  left: 1%;
  z-index: 5;
  width: 19.5%;
  height: 50%;
  pointer-events: auto;
  background: linear-gradient(180deg, #01023c 0%, #0e3047 100%);
  border-radius: 8px;
}
.maintenance-report-bottom-bar {
  width: 100%;
  height: 100%;
}
.bar-title {
  padding-top: 10px;
  padding-left: 20px;
  font-size: 16px;
  font-weight: bold;
  line-height: 24px;
  color: #ffffff;
}
.bar-sub-title {
  display: flex;
  justify-content: space-between;
  padding: 16px 20px 10px;
}
.bar-date-tab {
  display: flex;
  padding: 0;
  margin: 0;
}
.bar-date-tab-item {
  padding: 0;
  padding-right: 20px;
  margin: 0;
  font-size: 14px;
  font-weight: normal;
  color: #ffffff;
  color: rgb(255 255 255 / 65%);
  list-style: none;
  cursor: pointer;
}
.bar-date-tab-item-active {
  font-weight: bold;
  color: #ffffff;
}
</style>
