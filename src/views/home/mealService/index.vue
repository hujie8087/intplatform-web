<template>
  <div class="maintenance-report">
    <!-- 报餐送餐 -->
    <div class="maintenance-report-left">
      <div class="maintenance-report-meau" @click="showSearchCriteria">
        <img src="../images/collapseExpand.png" alt="" />
      </div>
      <div class="date-picker-wrapper" v-show="isShow" :style="datePickerStyle">
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
      <div class="meal-type" v-show="isShow" :style="selectStyle">
        <el-select v-model="seachParams.foodName" placeholder="请选择">
          <el-option v-for="item in foodNameMap" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>
      <div class="meal-type" v-show="isShow" :style="selectStyle">
        <el-select v-model="seachParams.fcId" placeholder="请选择" filterable>
          <el-option v-for="item in carList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>
      <div class="meal-search-btn" v-show="isShow" :style="buttonStyle">
        <el-button type="primary" :icon="Search" @click="searchAllData">查询</el-button>
      </div>
      <div class="meal-search-btn" v-show="isShow" :style="buttonStyle">
        <el-button type="primary" :icon="Refresh" @click="resetSearch">重置</el-button>
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
    <div class="maintenance-report-bottom" v-if="isShow">
      <InfiniteScrollList v-model="seachParams.fcId" :car-list="carList" :item-height="40" @change="handleChange" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Search, Refresh } from "@element-plus/icons-vue";
import { ref, reactive, computed, onMounted, useAttrs } from "vue";
import { getMealService, getSiteInformation, getCarLine } from "@/api/modules/dashboard";
import { getAllCarNameList } from "@/api/modules/mdc/system";
import InfiniteScrollList from "./components/InfiniteScrollList.vue";
import dayjs from "dayjs";
const formatter = number => {
  if (number === null || number === undefined) return "--";
  const numbers = number.toString().split("").reverse();
  const segs = [];
  while (numbers.length) segs.push(numbers.splice(0, 3).join(""));
  return segs.join(",").split("").reverse().join("");
};
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
const attrs = useAttrs();
let { setMarker, setTrucks } = attrs["set-function"] as any;
const isShow = ref(true);
const seachParams = reactive({
  date: dayjs().format("YYYY-MM-DD"),
  foodName: "0",
  fcId: ""
});
const foodNameMap = [
  { label: "早餐", value: "0", tagType: "primary" },
  { label: "午餐", value: "1", tagType: "success" },
  { label: "晚餐", value: "2", tagType: "warning" },
  { label: "夜宵", value: "3", tagType: "danger" },
  { label: "20L", value: "4", tagType: "info" },
  { label: "点心", value: "5", tagType: "warning" },
  { label: "凌晨餐", value: "6", tagType: "info" }
];
interface carListType {
  label: string;
  value: string | number;
}
const carList = ref<carListType[]>([]);
const getCarList = async () => {
  const res = await getAllCarNameList();
  carList.value = res.data.map(item => ({
    label: item.fcName,
    value: item.fcName
  }));
};
getCarList();
const showSearchCriteria = () => {
  isShow.value = !isShow.value;
};
const initPage = async () => {
  const res = await getMealService({});
  const data = res.data;
  config.foodCount.number = [data.foodCount]; // 报餐总数
  config.deliveryCount.number = [data.deliveryCount]; // 配送中数量
  config.deliveredCount.number = [data.deliveredCount]; // 配送完成数量
};
// 查询站点信息
const siteInformation = async () => {
  const res = await getSiteInformation({ date: seachParams.date, foodName: seachParams.foodName });
  let { data = [] } = res;
  let handleArr = data.filter(item => item.latitude && item.longitude);
  if (handleArr.length) {
    setMarker(handleArr);
  } else {
    setMarker([]);
  }
};
const carLineArr = ref([]);
// 车辆路线
const carLine = async () => {
  const res = await getCarLine({ date: seachParams.date, foodName: seachParams.foodName, fcName: seachParams.fcId });
  let { data = [] } = res;
  carLineArr.value = data.filter(item => item.line.length > 0);
  setTrucks(carLineArr.value, { date: seachParams.date, foodName: seachParams.foodName, fcName: seachParams.fcId });
};
const searchAllData = () => {
  siteInformation();
  carLine();
};
// 左边车牌滚动组件change 事件
const handleChange = () => {
  // 切换单辆车，要把那个车的行驶轨迹给标红
  setTrucks(carLineArr.value, { date: seachParams.date, foodName: seachParams.foodName, fcName: seachParams.fcId });
};
const resetSearch = () => {
  Object.assign(seachParams, {
    date: dayjs().format("YYYY-MM-DD"),
    foodName: "0",
    fcId: ""
  });
  searchAllData();
};
// 改为基于缩放状态的管理
const isZoomed = ref(false); // 缩放状态：true=放大/全屏，false=正常
onMounted(() => {
  initPage();
  searchAllData();
});
const datePickerStyle = computed(() => {
  const width = isZoomed.value ? "140px" : "110px";
  return { width };
});
const selectStyle = computed(() => {
  const width = isZoomed.value ? "100px" : "75px";
  return { width };
});
const buttonStyle = computed(() => {
  const width = isZoomed.value ? "80px" : "65px";
  return { width };
});

const zoomResize = value => {
  isZoomed.value = value;
};
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
.maintenance-report-left {
  position: relative;
  top: 0;
  left: 11px;
  display: flex;
  align-items: center;
  width: 28%;
  height: 32px;
  pointer-events: auto;
  transition: width 0.3s ease;
}
.maintenance-report-meau {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.date-picker-wrapper {
  /* width: 110px; */
  margin-left: 14px;
  background: linear-gradient(180deg, #01023c 0%, #0e3047 100%);
  border-radius: 8px;
  transition: width 0.3s ease;
}
.date-picker-wrapper :deep(.el-input) {
  width: 100%;
  height: 100%;
  color: #ffffff;
  border: none;
}
.date-picker-wrapper :deep(.el-input__wrapper) {
  background: rgb(0 0 0 / 0%);
  border: none !important;
  box-shadow: none !important;
}
.date-picker-wrapper :deep(.el-input__prefix) {
  color: #ffffff;
}
.date-picker-wrapper :deep(.el-input__inner) {
  height: 32px;
  color: #ffffff;
}
.meal-type {
  /* width: 71px; */
  margin-left: 8px;
  background: linear-gradient(180deg, #01023c 0%, #0e3047 100%);
  border-radius: 8px;
  transition: width 0.3s ease;
}
.meal-type :deep(.el-select__wrapper) {
  height: 32px;
  background: transparent;
  border: none !important;
  box-shadow: none !important;
}
.meal-type :deep(.el-icon),
.meal-type :deep(.el-select__placeholder) {
  color: #ffffff;
}
.meal-search-btn {
  /* width: 60px; */
  height: 32px;
  margin-left: 12px;
  background: linear-gradient(180deg, #01023c 0%, #0e3047 100%);
  border-radius: 8px;
  transition: width 0.3s ease;
}
.meal-search-btn :deep(.el-button) {
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
</style>
