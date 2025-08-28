<template>
  <div class="maintenance-report">
    <!-- 报餐送餐 -->
    <div class="maintenance-report-left">
      <div class="maintenance-report-meau">
        <img src="../images/collapseExpand.png" alt="" />
      </div>
      <div class="date-picker-wrapper">
        <el-date-picker
          v-model="seachParams.date"
          type="date"
          placeholder="请选择时间"
          size="small"
          value-format="YYYY-MM-DD"
          :clearable="false"
          popper-class="maintenance-date-picker"
        />
      </div>
      <div class="meal-type">
        <el-select v-model="seachParams.mealType" placeholder="Select">
          <el-option v-for="item in mealType" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>
      <div class="meal-type">
        <el-select v-model="seachParams.carNO" placeholder="Select" filterable @change="handleCarChange">
          <el-option v-for="item in carNOList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>
      <div class="meal-search-btn">
        <el-button type="primary" :icon="Search">查询</el-button>
      </div>
    </div>
    <div class="maintenance-report-top">
      <ul class="person-info-top-item-wrapper">
        <li class="person-info-top-item">
          <div class="person-info-top-item-top">报餐总数</div>
          <div class="person-info-top-item-bottom">
            <img src="../images/big1.png" alt="" style="width: 21px; height: 19px" />
            <dv-digital-flop :config="config.foodCount" style="width: 75%; height: 25px" />
          </div>
        </li>
        <li class="person-info-top-item">
          <div class="person-info-top-item-top">正在配送餐食</div>
          <div class="person-info-top-item-bottom">
            <img src="../images/big2.png" alt="" style="width: 19px; height: 22px" />
            <dv-digital-flop :config="config.deliveryCount" style="width: 75%; height: 25px; text-align: left" />
          </div>
        </li>
        <li class="person-info-top-item">
          <div class="person-info-top-item-top">已完成配送</div>
          <div class="person-info-top-item-bottom">
            <img src="../images/big3.png" alt="" style="width: 18px; height: 19px" />
            <dv-digital-flop :config="config.deliveredCount" style="width: 75%; height: 25px; text-align: left" />
          </div>
        </li>
      </ul>
    </div>
    <div class="maintenance-report-bottom">
      <InfiniteScrollList v-model="seachParams.carNO" :car-list="carNOList" :item-height="40" @change="handleChange" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Search } from "@element-plus/icons-vue";
import { ref, reactive, onMounted, nextTick, onActivated } from "vue";
// import { getCheckHiddenDanger } from "@/api/modules/dashboard";
import { getMealService } from "@/api/modules/dashboard";
import InfiniteScrollList from "./components/InfiniteScrollList.vue";
const config = reactive({
  foodCount: {
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
  deliveryCount: {
    // 已处理隐患
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
  deliveredCount: {
    // 正在处理隐患
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
const seachParams = reactive({
  date: "",
  mealType: 1,
  carNO: 90
});
const mealType = [
  { label: "早餐", value: 1 },
  { label: "午餐", value: 2 },
  { label: "晚餐", value: 3 }
];
const carNOList = ref([]);
for (let index = 0; index < 150; index++) {
  carNOList.value.push({ label: `吉普${index + 1}`, value: index + 1 });
}
// 滚动滑块
// const listRef = ref(null);
// const carRefs = {};

const initPage = async () => {
  const res = await getMealService({});
  const data = res.data;
  config.foodCount.number = [data.foodCount]; // 报餐总数
  config.deliveryCount.number = [data.deliveryCount]; // 配送中数量
  config.deliveredCount.number = [data.deliveredCount]; // 配送完成数量
};
// const initChartData = async dateType => {
//   const res = await getCheckHiddenDanger({ dateType });
//   const data = res.data;

// };

// const formatPercent = value => {
//   let num = 0;
//   if (value.includes("%")) {
//     num = value.replace("%", "");
//   }
//   return num;
// };
// 滚动并对齐中央
// const scrollToCar = async carId => {
//   await nextTick();
//   const listBox = listRef.value;
//   const el = carRefs[carId];
//   if (listBox && el) {
//     const boxHeight = listBox.clientHeight;
//     const itemHeight = el.clientHeight;
//     const scrollTop = el.offsetTop - boxHeight / 2 + itemHeight / 2;
//     listBox.scrollTo({
//       top: scrollTop,
//       behavior: "smooth"
//     });
//   }
// };
// // 切换车号时
const handleCarChange = carId => {
  console.log(carId);
  // scrollToCar(carId);
};
// 监听 change 事件
const handleChange = item => {
  console.log("确认选中:", item);
};
nextTick(() => {
  console.log(113);
});
onMounted(() => {
  initPage();
  // scrollToCar(seachParams.carNO); // 初始就居中第一个
});
onActivated(() => {
  // 在这里执行组件激活时需要执行的代码
  console.log("seachParams.carNO", seachParams.carNO);
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
.maintenance-report-left {
  position: relative;
  top: 0;
  left: 11px;
  display: flex;
  align-items: center;
  width: 23%;
  height: 32px;
  pointer-events: auto;
}
.maintenance-report-meau {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.date-picker-wrapper {
  width: 110px;
  margin-left: 14px;
  background: linear-gradient(180deg, #01023c 0%, #0e3047 100%);
  border-radius: 8px;
}
.date-picker-wrapper ::v-deep(.el-input) {
  width: 100%;
  height: 100%;
  color: #ffffff;
  border: none;
}
.date-picker-wrapper ::v-deep(.el-input__wrapper) {
  background: rgb(0 0 0 / 0%);
  border: none !important;
  box-shadow: none !important;
}
.date-picker-wrapper ::v-deep(.el-input__prefix) {
  color: #ffffff;
}
.date-picker-wrapper ::v-deep(.el-input__inner) {
  height: 32px;
  color: #ffffff;
}
.meal-type {
  width: 71px;
  margin-left: 8px;
  background: linear-gradient(180deg, #01023c 0%, #0e3047 100%);
  border-radius: 8px;
}
.meal-type ::v-deep(.el-select__wrapper) {
  height: 32px;
  background: transparent;
  border: none !important; /* 部分版本需要加上 */
  box-shadow: none !important; /* 去掉边框 */
}
.meal-type ::v-deep(.el-icon),
.meal-type ::v-deep(.el-select__placeholder) {
  color: #ffffff;
}
.meal-search-btn {
  width: 84px;
  height: 32px;
  margin-left: 12px;
  background: linear-gradient(180deg, #01023c 0%, #0e3047 100%);
  border-radius: 8px;
}
.meal-search-btn ::v-deep(.el-button) {
  width: 100%;
  height: 100%;
  font-size: 14px;
  background: transparent;
  border: none;
  box-shadow: none;
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
  width: 19.5%;
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
  bottom: 18%;
  left: 1%;
  z-index: 5;
  width: 200px;
  height: 68%;
  pointer-events: auto;
  background: linear-gradient(180deg, rgb(1 2 60 / 0%) 0%, #01023c 30%, #0e3047 68%, rgb(14 48 71 / 0%) 100%);
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.maintenance-report-bottom ::-webkit-scrollbar {
  display: none;
}

/* .car-item {
  height: 40px;
  line-height: 40px;
  text-align: left;
  color: #999;
  cursor: pointer;
  transition: color 0.3s;
  font-size: 16px;
  text-align: center;
}
.car-item.active {
  color: #fff;
  font-weight: bold;
} */

/* 黄色指针容器 */

/* .pointer {
  position: absolute;
  top: 50%;
  right: 6px;
  transform: translateY(-50%) rotate(180deg);
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 12px solid yellow;
  filter: drop-shadow(0 0 7px #00fff7);
} */

/* 左边圆点 */

/* .glow-circle {
  position: absolute;
  top: 50%;
  left: 6px;
  width: 18px;
  height: 18px;
  transform: translateY(-50%);
  box-sizing: border-box;
  border: 1px solid #00d2ff;
  border-radius: 50%;
  filter: drop-shadow(0 0 5px #00fff7);
  box-shadow: inset 0px 0px 3px 0px #00fff7;
} */

/* .outer-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 255, 255, 0.7) 50%,
    rgba(255, 255, 255, 0.3) 80%,
    rgba(255, 255, 255, 0) 100%
  );
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.5); 
} */
</style>
