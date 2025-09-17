<template>
  <div class="maintenance-report">
    <!-- 维修统计 -->
    <div class="maintenance-report-top">
      <ul class="person-info-top-item-wrapper">
        <li class="person-info-top-item">
          <div class="person-info-top-item-top">报修总数</div>
          <div class="person-info-top-item-bottom">
            <img src="../images/big1.png" alt="" style="width: 21px; height: 19px" />
            <dv-digital-flop :config="config.totalCount" style="width: 75%; height: 25px" />
            <!-- <span>3034</span> -->
          </div>
        </li>
        <li class="person-info-top-item">
          <div class="person-info-top-item-top">进行中</div>
          <div class="person-info-top-item-bottom">
            <img src="../images/big2.png" alt="" style="width: 19px; height: 22px" />
            <dv-digital-flop :config="config.underWay" style="width: 75%; height: 25px; text-align: left" />
          </div>
        </li>
        <li class="person-info-top-item">
          <div class="person-info-top-item-top">已完成</div>
          <div class="person-info-top-item-bottom">
            <img src="../images/big3.png" alt="" style="width: 18px; height: 19px" />
            <dv-digital-flop :config="config.processedCount" style="width: 75%; height: 25px; text-align: left" />
          </div>
        </li>
        <li class="person-info-top-item">
          <div class="person-info-top-item-top">已返修</div>
          <div class="person-info-top-item-bottom">
            <img src="../images/big3.png" alt="" style="width: 18px; height: 19px" />
            <dv-digital-flop :config="config.reWorkCount" style="width: 75%; height: 25px; text-align: left" />
          </div>
        </li>
      </ul>
    </div>
    <div class="maintenance-report-bottom">
      <div class="maintenance-report-bottom-bar">
        <div class="bar-title">维修统计</div>
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
          <ECharts :option="barOption" />
        </div>
      </div>
      <div class="maintenance-report-bottom-pie">
        <ECharts :option="gaugeChart" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import { ECOption } from "@/components/ECharts/config";
import { getRepairStatistics } from "@/api/modules/dashboard";

const config = reactive({
  totalCount: {
    number: [0],
    formatter,
    style: {
      //这里可以修改默认样式
      fontSize: 26, //字体大小
      fontWeight: "bold",
      textAlign: "left",
      fill: "#fff" //字体颜色
    }
  },
  underWay: {
    // 进行中
    number: [0],
    prefixText: "",
    formatter,
    style: {
      //这里可以修改默认样式
      fontSize: 26, //字体大小
      fontWeight: "bold",
      textAlign: "left",
      fill: "#fff" //字体颜色
    }
  },
  processedCount: {
    // 已完成
    number: [0],
    prefixText: "",
    formatter,
    style: {
      //这里可以修改默认样式
      fontSize: 26, //字体大小
      fontWeight: "bold",
      textAlign: "left",
      fill: "#fff" //字体颜色
    }
  },
  reWorkCount: {
    // 已完成
    number: [0],
    prefixText: "",
    formatter,
    style: {
      //这里可以修改默认样式
      fontSize: 26, //字体大小
      fontWeight: "bold",
      textAlign: "left",
      fill: "#fff" //字体颜色
    }
  }
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
const barOption = reactive<ECOption>({});
const gaugeChart = reactive<ECOption>({});
const initPage = async () => {
  const res = await getRepairStatistics({});
  const data = res.data;
  config.totalCount.number = [data.totalCount]; // 报修总数
  // 进行中：待维修+带返修
  let underWay = data.waitReWorkCount + data.waitingCount;
  config.underWay.number = [underWay];
  // 已完成： 已完成+已完结
  let end = data?.finishCount + data?.endCount;
  config.processedCount.number = [end];
  // 已返修
  config.reWorkCount.number = [data.reWorkCount];
};
const initChartData = async dateType => {
  const res = await getRepairStatistics({ dateType });
  const data = res.data;
  initBarChart(data);
  initGaugeChart(data);
};
const initBarChart = data => {
  // 已完成=已完成+已完结
  let end = data.finishCount + data.endCount;
  // 待维修 = 待返修数量+待维修数量
  let underWay = data.waitReWorkCount + data.waitingCount;
  let option = {
    grid: {
      top: 10,
      left: "8%",
      right: "8%",
      bottom: "5%",
      containLabel: true
    },
    xAxis: {
      type: "category",
      data: ["报修总数", "已完成", "待维修", "已返修"],
      axisTick: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: "rgba(130, 136, 152, 0.5)",
          type: "dashed"
        }
      },
      axisLabel: {
        color: "#fff",
        interval: 0
      }
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#fff"
      },
      splitLine: {
        lineStyle: {
          color: "rgba(130, 136, 152, 0.5)",
          type: "dashed"
        }
      }
    },
    tooltip: {
      show: true
    },
    series: [
      {
        type: "bar",
        barWidth: "30%",
        data: [
          {
            name: "报修总数",
            value: data.totalCount ?? 0,
            itemStyle: {
              color: "#FE7D00",
              borderRadius: [5, 5, 0, 0]
            }
          },
          {
            name: "已完成",
            value: end ?? 0,
            itemStyle: {
              color: "#33D1C9",
              borderRadius: [5, 5, 0, 0]
            }
          },
          {
            name: "待维修",
            value: underWay,
            itemStyle: {
              color: "#0074F0",
              borderRadius: [5, 5, 0, 0]
            }
          },
          {
            name: "已返修",
            value: data.reWorkCount ?? 0,
            itemStyle: {
              color: "#00E50B",
              borderRadius: [5, 5, 0, 0]
            }
          }
        ]
      }
    ]
  };
  Object.assign(barOption, option);
};
const initGaugeChart = data => {
  let finishRateIn24H = formatPercent(data.finishRateIn24H);
  const gaugeData = [
    {
      value: finishRateIn24H,
      name: "24h内完成",
      title: {
        offsetCenter: ["-40%", "85%"],
        color: "#fff"
      },
      detail: {
        offsetCenter: ["-40%", "108%"],
        color: "#0074F0"
      },
      itemStyle: {
        color: "#0074F0"
      }
    },
    {
      value: 100 - finishRateIn24H,
      name: "24h外完成",
      title: {
        offsetCenter: ["40%", "85%"],
        color: "#fff"
      },
      detail: {
        offsetCenter: ["40%", "108%"],
        color: "#FE7D00"
      },
      itemStyle: {
        color: "#FE7D00"
      }
    }
  ];
  let option = {
    title: {
      text: "24h完成比",
      left: "38%",
      top: "65%",
      textStyle: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "normal"
      }
    },
    series: [
      {
        type: "gauge",
        center: ["50%", "45%"], // [水平位置, 垂直位置]
        radius: "85%", // ← 改动：放大圈半径（默认没写时大概是 75%）
        anchor: {
          // 表盘中指针的固定点
          show: true,
          showAbove: true,
          size: 16,
          itemStyle: {
            color: "#FFB400",
            borderColor: "#00B2FF",
            borderWidth: 2
          }
        },
        pointer: {
          // 仪表盘指针。
          icon: "path://M2.9,0.7L2.9,0.7c1.4,0,2.6,1.2,2.6,2.6v115c0,1.4-1.2,2.6-2.6,2.6l0,0c-1.4,0-2.6-1.2-2.6-2.6V3.3C0.3,1.9,1.4,0.7,2.9,0.7z",
          width: 8,
          length: "75%",
          offsetCenter: [0, "8%"]
        },
        progress: {
          // 展示当前进度。
          show: true,
          overlap: true,
          roundCap: true
        },
        axisLine: {
          // 仪表盘轴线相关配置。
          roundCap: true,
          lineStyle: {
            color: [[1, "#E6EBF8"]] // ← 改动：轴线颜色（可自行调整成你想要的）
          }
        },
        axisTick: {
          // ← 改动：新增，调整刻度颜色
          lineStyle: {
            color: "#63677A" // 刻度颜色
          }
        },
        splitLine: {
          // ← 改动：新增，分隔线样式
          lineStyle: {
            color: "#63677A"
          }
        },
        axisLabel: {
          // ← 改动：新增，刻度文字颜色
          color: "#FFF"
        },
        data: gaugeData,
        title: {
          // 仪表盘标题
          fontSize: 12,
          color: "#464646",
          fontWeight: "normal",
          offsetCenter: ["-40%", "65%"] // ← 上移一点
        },
        detail: {
          // 下面的文字
          fontSize: 18,
          fontWeight: "normal",
          color: "#fff",
          formatter: "{value}%"
        }
      }
    ]
  };

  Object.assign(gaugeChart, option);
};
const formatPercent = value => {
  let num = 0;
  if (value.includes("%")) {
    num = value.replace("%", "");
  }
  return num;
};
const changeData = type => {
  activeType.value = type;
  initChartData(type);
};
onMounted(() => {
  initPage();
  changeData(activeType.value);
});
function formatter(number) {
  if (number === null || number === undefined) return "--";
  const numbers = number.toString().split("").reverse();
  const segs = [];
  while (numbers.length) segs.push(numbers.splice(0, 3).join(""));
  return segs.join(",").split("").reverse().join("");
}
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
  left: 18.5%;
  width: 63%;

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
  width: 14.5%;
  height: 100%;
  padding: 0;
  padding-left: 2%;
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
  bottom: 20px;
  left: 1%;
  z-index: 5;
  width: 19.2%;
  height: 83%;
  pointer-events: auto;
  background: linear-gradient(180deg, #01023c 0%, #0e3047 100%);
  border-radius: 8px;
}
.maintenance-report-bottom-bar {
  width: 100%;
  height: 57%;
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
.maintenance-report-bottom-pie {
  width: 100%;
  height: 42%;
}
</style>
