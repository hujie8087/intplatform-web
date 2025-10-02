<template>
  <div class="person-info">
    <div class="person-info-top">
      <ul class="person-info-top-item-wrapper">
        <li class="person-info-top-item" @click="clickCard(0)">
          <div class="person-info-top-item-top">当前已激活人数</div>
          <div class="person-info-top-item-bottom">
            <img src="../images/big1.png" alt="" style="width: 21px; height: 19px" />
            <dv-digital-flop :config="config.allCount" style="width: 75%; height: 25px" />
          </div>
        </li>
        <li class="person-info-top-item" @click="clickCard(1)">
          <div class="person-info-top-item-top">今日登录人数</div>
          <div class="person-info-top-item-bottom">
            <img src="../images/big2.png" alt="" style="width: 19px; height: 22px" />
            <dv-digital-flop :config="config.todayLoginCount" style="width: 75%; height: 25px; text-align: left" />
          </div>
        </li>
        <li class="person-info-top-item" @click="clickCard(2)">
          <div class="person-info-top-item-top">当前在线人数</div>
          <div class="person-info-top-item-bottom">
            <img src="../images/big3.png" alt="" style="width: 18px; height: 19px" />
            <dv-digital-flop :config="config.onlineCount" style="width: 75%; height: 25px; text-align: left" />
          </div>
        </li>
        <li class="person-info-top-item" @click="clickCard(3)">
          <div class="person-info-top-item-top">当日注册人数</div>
          <div class="person-info-top-item-bottom">
            <img src="../images/big4.png" alt="" style="width: 20px; height: 20px" />
            <dv-digital-flop :config="config.todayRegisterCount" style="width: 75%; height: 25px; text-align: left" />
          </div>
        </li>
      </ul>
    </div>
    <div class="person-info-bottom">
      <div class="person-info-bottom-chart">
        <lineECharts :option="option" ref="lineChartRef" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import echarts from "@/components/ECharts/config";
import lineECharts from "@/components/ECharts/index.vue";
import { ECOption } from "@/components/ECharts/config";
import { getPersonnelStatistics } from "@/api/modules/dashboard";
import { chartOptionType, ResponseType } from "@/api/interface/dashboard";
const config = reactive({
  allCount: {
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
  todayLoginCount: {
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
  onlineCount: {
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
  todayRegisterCount: {
    number: [0],
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
const lineChartRef = ref();
const option = reactive<ECOption>({});
const initPage = async () => {
  const res = (await getPersonnelStatistics({})) as ResponseType;
  let data = res.data;
  config.allCount.number[0] = data.activeCount as number;
  config.todayLoginCount.number[0] = data.todayLoginCount as number;
  config.onlineCount.number[0] = data.onlineCount as number;
  config.todayRegisterCount.number[0] = data.todayRegisterCount as number;
  setChartData(data.yearData ?? []);
};

const setChartData = data => {
  let obj: chartOptionType = {
    xData: [],
    seriesDat: []
  };
  let tempObj = {
    loginCount: [],
    registerCount: []
  };
  data.forEach(el => {
    obj["xData"].push(`${el.month}月`);
    Object.keys(tempObj).forEach(key => {
      tempObj[key].push(el[key]);
    });
  });
  let keysTitltle = {
    loginCount: {
      name: "月登录",
      areaStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(
            0,
            0,
            0,
            1,
            [
              {
                offset: 0,
                color: "rgba(55, 226, 226, 0.3)"
              },
              {
                offset: 0.8,
                color: "rgba(55, 226, 226, 0)"
              }
            ],
            false
          ),
          shadowColor: "rgba(0, 0, 0, 0.1)",
          shadowBlur: 10
        }
      },
      itemStyle: {
        normal: {
          color: "rgb(55,226,226)",
          borderColor: "rgba(55,226,226,0.27)",
          borderWidth: 12
        }
      }
    },
    registerCount: {
      name: "当月注册",
      areaStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(
            0,
            0,
            0,
            1,
            [
              {
                offset: 0,
                color: "rgba(114, 46, 209, 0.3)"
              },
              {
                offset: 0.8,
                color: "rgba(114, 46, 209, 0)"
              }
            ],
            false
          ),
          shadowColor: "rgba(0, 0, 0, 0.1)",
          shadowBlur: 10
        }
      },
      itemStyle: {
        normal: {
          color: "rgb(114,46,209)",
          borderColor: "rgba(114,46,209,0.27)",
          borderWidth: 12
        }
      }
    }
  };
  Object.keys(tempObj).forEach(key => {
    obj["seriesDat"].push({
      name: keysTitltle[key].name,
      type: "line",
      smooth: true,
      symbol: "circle",
      symbolSize: 5,
      showSymbol: false,
      data: tempObj[key],
      areaStyle: keysTitltle[key].areaStyle,
      itemStyle: keysTitltle[key].itemStyle
    });
  });
  setOptions(obj);
  return obj;
};
const setOptions = obj => {
  let option1: ECOption = {
    tooltip: {
      show: true,
      trigger: "axis",
      axisPointer: {
        lineStyle: {
          color: "#57617B"
        }
      }
      // formatter
    },
    legend: {
      show: false
    },
    grid: {
      top: 40,
      left: 20,
      bottom: 20,
      right: 25,
      containLabel: true
    },
    xAxis: {
      type: "category",
      axisTick: {
        show: false
      },
      splitLine: {
        show: false
      },
      axisLabel: {
        fontSize: 12
      },
      boundaryGap: false,
      data: obj["xData"]
    },
    yAxis: {
      splitLine: {
        show: true,
        lineStyle: {
          color: "#57617B"
        }
      },
      axisLabel: {
        color: "#57617B",
        formatter: function (value) {
          if (value >= 1000) {
            return value / 1000 + "k"; // y轴显示 k
          }
          return value;
        }
      }
    },
    series: obj.seriesDat
  };
  Object.assign(option, option1);
};
const emit = defineEmits(["childClickEvent"]);
const clickCard = index => {
  let arr = [
    { type: "active", title: "当前已经激活人数", count: config.allCount.number[0] },
    { type: "login", title: "今日登录人数", count: config.todayLoginCount.number[0] },
    { type: "online", title: "当前在线人数", count: config.onlineCount.number[0] },
    { type: "register", title: "当日注册人数", count: config.todayRegisterCount.number[0] }
  ];
  if (arr[index].count > 0) {
    emit("childClickEvent", arr[index]);
  }
};
onMounted(() => {
  initPage();
});
const zoomResize = () => {
  lineChartRef.value?.resize();
};
function formatter(number) {
  if (number === null || number === undefined) return "--";
  const numbers = number.toString().split("").reverse();
  const segs = [];
  while (numbers.length) segs.push(numbers.splice(0, 3).join(""));
  return segs.join(",").split("").reverse().join("");
}
defineExpose({ zoomResize });
</script>

<style scoped>
.person-info {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 4;
  width: 100%;
  height: calc(100% - 130px);

  /* pointer-events: none; */
}
.person-info-top {
  position: absolute;
  top: 0;
  left: 18.5%;
  width: 63%;

  /* height: 13%; */
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
  padding-left: 1.5%;
  list-style: none;
  cursor: pointer;
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
.person-info-bottom {
  position: absolute;
  bottom: 20px;
  left: 18.5%;
  z-index: 5;
  width: 63%;
  height: 36%;
  background: linear-gradient(180deg, #01023c 0%, #0e3047 100%);
  border-radius: 8px;
}
.person-info-bottom-chart {
  height: 100%;
}
</style>
