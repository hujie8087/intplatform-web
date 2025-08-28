<template>
  <div class="logistics-dashboard">
    <!-- <full-screen-container> -->
    <div v-if="activePage == 'person'">
      <div id="map" class="map"></div>
    </div>
    <div v-else-if="activePage == 'maintenance'">
      <div id="maintenance" class="map"></div>
    </div>
    <div v-else-if="activePage == 'risk'">
      <div id="risk" class="map"></div>
    </div>
    <div v-else>
      <div id="meal" class="map"></div>
    </div>
    <!-- 顶部导航 -->
    <div class="logistics-dashboard-header">
      <div class="logistics-dashboard-header-font">后勤综合服务数据大屏</div>
      <div class="logistics-dashboard-header-btn">
        <div class="logistics-dashboard-header-btn-left">
          <!-- @click="activePage = 'person'" -->
          <div
            :class="['logistics-dashboard-header-menu-btn', activePage == 'person' ? 'active' : '']"
            @click="clickTab('person')"
          >
            人员信息
          </div>
          <div
            :class="['logistics-dashboard-header-menu-btn', activePage == 'maintenance' ? 'active' : '']"
            @click="clickTab('maintenance')"
          >
            维修统计
          </div>
        </div>
        <div class="logistics-dashboard-header-btn-right">
          <div :class="['logistics-dashboard-header-menu-btn', activePage == 'risk' ? 'active' : '']" @click="clickTab('risk')">
            排查隐患
          </div>
          <div :class="['logistics-dashboard-header-menu-btn', activePage == 'meal' ? 'active' : '']" @click="clickTab('meal')">
            报餐送餐
          </div>
        </div>
      </div>
    </div>
    <!-- 主体区域：动态组件 -->
    <!-- <keep-alive> -->
    <component :is="pages[activePage]" />
    <!-- </keep-alive> -->
    <!-- </full-screen-container> -->
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from "vue";
import PagePerson from "./personInfo/index.vue";
import MaintenanceReport from "./maintenanceReport/index.vue";
import RiskInspection from "./riskInspection/index.vue";
import mealService from "./mealService/index.vue";
import { useMap, maintainMap, riskMap, mealMap } from "./utils/useMap";
import { getRegionAllList } from "@/api/modules/system/drawArea";

const pages = {
  person: PagePerson, // 人员信息
  maintenance: MaintenanceReport, // 维修统计
  risk: RiskInspection, // 排查隐患
  meal: mealService // 报餐送餐
};
const { initializeMap } = useMap(); // 人员信息的地图
const { initMaintainMap } = maintainMap(); // 维修统计的地图
const { initRsikMap } = riskMap(); // 排查隐患地图
const { initMealMap } = mealMap(); // 报餐送餐
const objFun = {
  person: initializeMap,
  maintenance: initMaintainMap,
  risk: initRsikMap,
  meal: initMealMap
};
const activePage = ref("person"); // 当前显示哪个页面
const regionList = reactive([]);
const clickTab = type => {
  // 页签切换
  activePage.value = type;
  nextTick(() => {
    const initMap = objFun[type];
    initMap(regionList);
  });
};
const getRegionList = async () => {
  let { data = [] } = (await getRegionAllList()) || {};
  Object.assign(regionList, data);
  clickTab("person");
};
onMounted(() => {
  let el = document.querySelector(".el-main");
  el?.classList.add("no-padding");
  getRegionList();

  //   initializeMap();
});
onBeforeUnmount(() => {
  const el = document.querySelector(".el-main");
  el?.classList.remove("no-padding");
});
</script>

<style scoped>
.logistics-dashboard {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.map {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
}
.logistics-dashboard-header {
  position: relative;
  z-index: 2;
  height: 96px;
}
.logistics-dashboard-header-font {
  width: 100%;
  height: 85px;
  font-size: 38px;
  font-weight: bold;
  line-height: 70px;
  color: #ffffff;
  text-align: center;
  letter-spacing: 10.5px;
  background: url("./images/headerBanner.png") no-repeat center center;
}
.logistics-dashboard-header-btn {
  position: absolute;
  bottom: 0;
  left: 8%;
  display: flex;
  justify-content: space-between;
  width: 84%;
  height: 55px;
}
.logistics-dashboard-header-btn-left,
.logistics-dashboard-header-btn-right {
  display: flex;
}
.logistics-dashboard-header-menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 140px;
  height: 85%;
  margin-top: 1px;
  font-size: 18px;
  font-weight: bold;
  line-height: 24.7px;
  color: #ffffff;
  text-align: center;
  letter-spacing: 1.37px;
  cursor: pointer;
  background: url("./images/bgDefault.png") no-repeat;
  background-size: contain;
}
.active {
  background: url("./images/bgActive.png") no-repeat !important;
  background-size: contain !important;
}
</style>
<style>
.no-padding {
  padding: 0 !important;
}
.polygon-text {
  font-size: 12px;
  font-weight: bold;
  line-height: 20px;
  color: #ffffff;
  pointer-events: none !important;
}
.region-pop-style {
  z-index: 99;
}
.region-pop-style .leaflet-popup-content-wrapper,
.leaflet-popup-tip {
  width: 180px;
  background: linear-gradient(180deg, #01023c 0%, #0e3047 100%);
  border-radius: 8px;
}
.region-pop-style .leaflet-popup-content {
  width: calc(100% - 16px) !important;
  margin: 14px 8px;
}
.region-pop-style-wrapper {
  z-index: 3000 !important;
}
.region-pop-style-wrapper h1 {
  padding-bottom: 4px;
  margin: 0;
  font-size: 12px;
  line-height: 20px;
  color: #ffffff;
  letter-spacing: 2px;
}
.region-pop-style-text1,
.region-pop-style-text2,
.region-pop-style-text3,
.region-pop-style-text4 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  padding: 0 8px 0 6px;
  margin-bottom: 4px;
  background: rgb(255 255 255 / 90%);
  border-radius: 4px;
  box-shadow: 6px 0 20px 0 rgb(34 87 188 / 10%);
}
.region-pop-style-text1 span {
  font-size: 12px;
  color: #4e5969;
}
.region-pop-style-text1 b {
  font-size: 13px;
  font-weight: bold;
  color: #1d2129;
}
.region-pop-style-text2 span {
  font-size: 12px;
  color: #00e50b;
}
.region-pop-style-text2 b {
  font-size: 13px;
  font-weight: bold;
  color: #00e50b;
}
.region-pop-style-text3 span {
  font-size: 12px;
  color: #ff7d00;
}
.region-pop-style-text3 b {
  font-size: 13px;
  font-weight: bold;
  color: #ff7d00;
}
.region-pop-style-text4 span {
  font-size: 12px;
  color: #00c4ff;
}
.region-pop-style-text4 b {
  font-size: 13px;
  font-weight: bold;
  color: #00c4ff;
}
.leaflet-popup.custom-popup {
  z-index: 3000 !important;
}
</style>
