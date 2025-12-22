<template>
  <div class="logistics-dashboard">
    <!-- <full-screen-container> -->
    <template v-if="activePage == 'person'">
      <PagePerson />
    </template>
    <template v-else-if="activePage == 'maintenance'">
      <MaintenanceReport />
    </template>
    <template v-else-if="activePage == 'risk'">
      <RiskInspection />
    </template>
    <template v-else>
      <mealService @get-site-data="getSiteData" ref="mealServiceRef" @get-track-data="getTrackData" />
    </template>
    <HomeMap ref="HomeMapRef" @show-site-info="showSiteInfo" @click-tab="clickTab" />
    <!-- 顶部导航 -->
    <div class="logistics-dashboard-header">
      <div class="logistics-dashboard-header-font">后勤综合服务数据大屏</div>
      <div class="large-screen-zoom">
        <img :src="imgUrl" alt="" @click="isFullScreen" />
      </div>
      <div class="logistics-dashboard-header-btn">
        <div class="logistics-dashboard-header-btn-left">
          <!-- <div
            :class="['logistics-dashboard-header-menu-btn', activePage == 'person' ? 'active' : '']"
            @click="clickTab('person')"
          >
            人员信息
          </div> -->
          <div
            :class="['logistics-dashboard-header-menu-btn', activePage == 'maintenance' ? 'active' : '']"
            @click="clickTab('maintenance')"
          >
            维修统计
          </div>
          <div :class="['logistics-dashboard-header-menu-btn', activePage == 'risk' ? 'active' : '']" @click="clickTab('risk')">
            排查隐患
          </div>
        </div>
        <div class="logistics-dashboard-header-btn-right">
          <div :class="['logistics-dashboard-header-menu-btn', activePage == 'meal' ? 'active' : '']" @click="clickTab('meal')">
            报餐送餐
          </div>
        </div>
      </div>
    </div>
    <!-- <component
      v-if="activePage !== 'meal'"
      ref="childCompRef"
      :is="pages[activePage]"
      :set-function="setMapFun"
      @child-click-event="childEvent"
    /> -->
    <!-- <el-dialog v-model="dialogShow" width="60%" class="person-info-dialog">
      <template #title>
        <div class="dialog-title">
          <el-icon class="title-icon back-button-page" :size="22">
            <Back />
          </el-icon>
          <span>{{ dialogTitle }}</span>
          <i> ( {{ deptPath }} ) </i>
        </div>
      </template>
      <div class="person-dialog-chart" ref="personBarChart"></div>
    </el-dialog> -->
  </div>
</template>

<script setup lang="tsx" name="Home">
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from "vue";
import PagePerson from "./personInfo/index.vue";
import MaintenanceReport from "./maintenanceReport/index.vue";
import RiskInspection from "./riskInspection/index.vue";
import mealService from "./mealService/index.vue";
import { getRegionAllList } from "@/api/modules/system/drawArea";
import enlargeImg from "./images/fangda.png";
import narrowImg from "./images/suoxiao.png";
import HomeMap from "./HomeMap.vue";
import { Area } from "@/api/interface/system";
import { SiteInformationList } from "@/api/interface/dashboard";

const isFull = ref(false);
const imgUrl = ref(enlargeImg);
const HomeMapRef = ref();
const getSiteData = (data: SiteInformationList[]) => {
  console.log(data);
  HomeMapRef.value.destroyAllMarker();
  HomeMapRef.value.loadMealStateData(data);
};
// const pages = {
//   person: PagePerson, // 人员信息
//   maintenance: MaintenanceReport, // 维修统计
//   risk: RiskInspection, // 排查隐患
//   meal: mealService // 报餐送餐
// };
// 各个页面地图初始化方法
const activePage = ref("person"); // 当前显示哪个页面
const regionList = reactive<Area.ResArea[]>([]);
const clickTab = type => {
  // 页签切换
  activePage.value = type;
  nextTick(() => {
    switch (type) {
      case "person":
        HomeMapRef.value.destroyAll();
        HomeMapRef.value.destroyAllMarker();
        HomeMapRef.value.destroyAllNavigation();
        break;
      case "maintenance":
        HomeMapRef.value.loadAreaData(regionList);
        HomeMapRef.value.destroyAllMarker();
        HomeMapRef.value.destroyAllNavigation();
        break;
      case "risk":
        HomeMapRef.value.destroyAll();
        HomeMapRef.value.destroyAllMarker();
        HomeMapRef.value.destroyAllNavigation();
        break;
      case "meal":
        HomeMapRef.value.destroyAll();
        HomeMapRef.value.loadAreaData([]);
        break;
      default:
        break;
    }
  });
};
const getRegionList = async () => {
  let { data = [] } = (await getRegionAllList()) || {};
  Object.assign(regionList, data);
};
const childCompRef = ref();
const isFullScreen = () => {
  let el = document.querySelector(".el-main");
  isFull.value = !isFull.value;
  if (isFull.value) {
    imgUrl.value = narrowImg;
    el?.classList.add("full-screen");
  } else {
    imgUrl.value = enlargeImg;
    el?.classList.remove("full-screen");
  }
  childCompRef.value?.zoomResize(isFull.value); // 各个页图表缩放
};
// const childEvent = obj => {
//   if (activePage.value == "person") {
//     dialogShow.value = true;
//     dialogTitle.value = obj["title"];
//     getCardDataFun(obj);
//   }
// };
const mealServiceRef = ref();
const showSiteInfo = (item: SiteInformationList) => {
  mealServiceRef.value.showSiteInfo(item);
};

const getTrackData = (data: { coordinatesList: string | null; fcId: number; fcName: string; line: [number, number][] }) => {
  const pathData =
    data.line.length > 0
      ? data.line.map(item => {
          return { lat: item[0], lng: item[1], floorId: "1" };
        })
      : [];
  HomeMapRef.value.destroyAllNavigation();
  HomeMapRef.value.loadMealTracks({
    pathData
  });
};

onMounted(async () => {
  let el = document.querySelector(".el-main");
  el?.classList.add("no-padding");
  getRegionList();
  await HomeMapRef.value.initMap();
});
onBeforeUnmount(() => {
  const el = document.querySelector(".el-main");
  el?.classList.remove("no-padding");
  el?.classList.remove("full-screen");
});
</script>

<style lang="scss" scoped>
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
  z-index: 1000;
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
.site-popup {
  width: 180px;
  background: linear-gradient(180deg, #01023c 0%, #0e3047 100%);
  border-radius: 8px;
  .site-popup-first {
    line-height: 20px;
    color: #ffffff;
    b {
      font-size: 12px;
    }
    span {
      font-size: 10px;
    }
  }
  .site-popup-second,
  .site-popup-third {
    height: 32px;
    line-height: 32px;
    background: rgb(255 255 255 / 90%);
    border-radius: 4px;
    box-shadow: 6px 0 20px 0 rgb(34 87 188 / 10%);
    span {
      font-size: 12px;
      color: #4e5969;
    }
    b {
      font-size: 13px;
      color: #1d2129;
    }
  }
}
.large-screen-zoom {
  position: absolute;
  top: 12px;
  left: 25%;
  cursor: pointer;
  img {
    width: 20px;
  }
}
.person-info-dialog {
  .dialog-title {
    display: flex;
    align-items: center;
    color: #999999;
    .title-icon {
      margin-right: 10px;
      cursor: pointer;
    }
  }
  .back-button-page {
    display: none;
  }
  i {
    font-size: 12px;
    font-style: normal;
    color: #888888;
  }
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
.site-popup {
  background: linear-gradient(180deg, #01023c 0%, #0e3047 100%);
  border-radius: 8px;
}
.site-popup-first {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  line-height: 20px;
  color: #ffffff;
}
.site-popup .site-popup-first b {
  font-size: 12px;
}
.site-popup .site-popup-first span {
  font-size: 11px;
}
.site-popup-second,
.site-popup-third {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  padding: 0 6px;
  line-height: 32px;
  background: rgb(255 255 255 / 90%);
  border-radius: 4px;
  box-shadow: 6px 0 20px 0 rgb(34 87 188 / 10%);
}
.site-popup-third {
  margin-top: 4px;
}
#meal .leaflet-popup-content-wrapper {
  width: 180px;
  background: linear-gradient(180deg, #01023c 0%, #0e3047 100%);
  border-radius: 8px;
}
#meal .leaflet-popup-content {
  width: calc(100% - 16px);
  margin: 12px 8px 16px;
}
.truck-popup .sit-popup-margin {
  margin-top: 4px;
}
.full-screen {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
}
.full-screen .large-screen-zoom {
  left: 27.8%;
}
.meal-service-icon-tips {
  padding: 4px 6px 0;
  font-size: 12px;
  font-weight: bold;
  color: #ffffff;
  text-align: center;
  white-space: nowrap; /* 避免文字换行 */
  cursor: pointer;
  border: 1px solid #ffffff;
  border-radius: 4px;
}
.meal-service-icon-tips::after {
  position: absolute;
  bottom: -6px; /* 往下偏移一点 */
  left: 50%;
  width: 0;
  height: 0;
  content: "";
  border-right: 6px solid transparent;
  border-left: 6px solid transparent;
  transform: translateX(-50%);
}
.meal-service-icon-tips::before {
  position: absolute;
  bottom: -7px; /* 稍微大一点 */
  left: 50%;
  content: "";
  border-top: 7px solid #ffffff; /* 白色边框 */
  border-right: 7px solid transparent;
  border-left: 7px solid transparent;
  transform: translateX(-50%);
}
.green-bg-color {
  background: #00e50b;
}
.green-bg-color::after {
  border-top: 6px solid #00e50b; /* 和背景色保持一致 */
}
.origin-bg-color {
  background: #ff7d00;
}
.origin-bg-color::after {
  border-top: 6px solid #ff7d00; /* 和背景色保持一致 */
}
.grey-bg-color {
  background: #86909c;
}
.grey-bg-color::after {
  border-top: 6px solid #86909c; /* 和背景色保持一致 */
}
.person-dialog-chart {
  height: 380px;
}
.person-info-dialog {
  height: 450px;
  background: linear-gradient(180deg, #01023c 0%, #0e3047 100%);
}
.person-info-dialog .el-dialog__header {
  border-bottom: 1px solid #57617b;
}
</style>
