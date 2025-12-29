<template>
  <div class="map-wrapper" v-loading="!state.mapLoaded">
    <!-- <div ref="mapContainerRef" class="map-container"></div> -->
    <div id="mapContainer" style="width: 100%; height: 100%"></div>
    <div class="card" v-if="showCard">
      <!-- <p>点击POI点设置起点或终点</p> -->
      <div class="list">
        <div class="typeBtn" @click="startNavi()">开始导航</div>
        <div class="typeBtn" @click="pauseNavi()">暂停</div>
        <div class="typeBtn" @click="restoreNavi()">继续</div>
        <div class="typeBtn" @click="stopNavi()">结束</div>
        <div class="typeBtn" @click="destroyAllNavigation()">销毁轨迹</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Area } from "@/api/interface/system";
import { createManufacturerMap, type CreateManufacturerMapOptions, type ManufacturerMapInstance } from "@/utils/mapUtils";
import "@/assets/css/VgoMap.umd.css";
import { getRepairStatistics } from "@/api/modules/dashboard";
import { reactive, ref, onBeforeUnmount } from "vue";
import { DataVisualize, SiteInformationList } from "@/api/interface/dashboard";

const emit = defineEmits(["showSiteInfo", "clickTab"]);
const showCard = ref(false);
const navigation = ref();
const state: {
  mapLoaded: boolean; // 地图是否加载完成
} = reactive({
  mapLoaded: false // 地图是否加载完成
});
// 信息弹窗对象数组
let infoMarker = reactive<any[]>([]);
let mapInstance: ManufacturerMapInstance | null = null; // 地图实例，不要放到响应式对象里影响性能
let wxbPolygonEdit = ref();
// 存储导航实例，方便销毁
const initMap = async () => {
  // 如果已存在实例，先销毁
  if (mapInstance) {
    destroyAll();
    mapInstance.dispose();
    mapInstance = null;
  }
  const options: CreateManufacturerMapOptions = {
    el: "mapContainer",
    mapId: "1902300333347049472"
  };
  mapInstance = await createManufacturerMap(options);
  const module = await import("@/utils/wxbPolygonEdit/js/index.js");
  const WxbPolygonEdit = module.WxbPolygonEdit;
  mapInstance.on("loaded", () => {
    console.log("站点地图加载完成");
    // 设置指南针
    new window.VgoMap.Compass({
      map: mapInstance,
      id: "1902300333347049472"
    });
    // 缩放组件
    new window.VgoMap.ZoomControl({
      map: mapInstance,
      id: "1902300333347049472"
    });
    new window.VgoMap.ViewModeControl({
      map: mapInstance,
      style: "inset: auto 20px 200px auto;"
    });
    mapInstance!.vmap.setZoom(15);
    // 初始化多边形编辑插件
    wxbPolygonEdit.value = new WxbPolygonEdit(mapInstance);
    //注册多边形点击事件
    wxbPolygonEdit.value.polygonShow.onClick(async (polygonInfo, evt) => {
      console.log(evt);
      const { data } = await getRepairStatistics({
        ancestors: polygonInfo.ancestors
      });
      openRepairInfo(polygonInfo, data);
    });
    state.mapLoaded = true;
    emit("clickTab", "maintenance");
  });
};
// 区域点击事件
const openRepairInfo = (polygonInfo, item: DataVisualize.RepairStatistics) => {
  let content = `
                <div class="region-pop-style-wrapper">
                  <h1>${polygonInfo.name}维修统计</h1>
                  <div class="region-pop-style-text1">
                    <span>报修总数</span>
                    <b>${item.totalCount}</b>
                  </div>
                  <div class="region-pop-style-text2">
                    <span>报修已完成</span>
                    <b>${item.finishCount}</b>
                  </div>
                  <div class="region-pop-style-text3">
                    <span>报修待维修</span>
                    <b>${item.waitingCount + item.waitReWorkCount}</b>
                  </div>
                  <div class="region-pop-style-text4">
                    <span>24H完成比</span>
                    <b>${item.finishRateIn24H}</b>
                  </div>
                </div>
                `;

  openInfo(content, polygonInfo.center);
};

const openInfo = (content, position) => {
  closePointInfo();
  let dom = document.createElement("div");
  dom.innerHTML = `
  	<div class="point-info">
		<div class="point-info-close">×</div>
		<div class="point-info-content">
			${content}
		</div>
	</div>
  `;
  let fooldId = "1";
  if (!mapInstance) return;
  let marker = mapInstance.addDomMarker(fooldId, dom);
  dom.querySelector(".point-info-close")?.addEventListener("click", closePointInfo);
  marker.position.copy(position);
  infoMarker.push(marker);
};

// 关闭区域弹窗
const closePointInfo = () => {
  // 销毁所有 marker
  infoMarker.forEach(marker => {
    marker && marker.dispose();
  });

  infoMarker = [];
};

// 加载区域数据
const loadAreaData = async (regionList: Area.ResArea[]) => {
  if (!regionList) return;
  try {
    if (regionList.length > 0) {
      regionList.forEach(item => {
        const { points, center } = JSON.parse(item.geoJson);
        console.log(center, points);

        let createPolygonObj = {
          color: "blue",
          points: points,
          height: 0,
          type: "polygonShow",
          center,
          floorId: "1",
          opacity: 0.8,
          name: item.areaName,
          ancestors: item.ancestors
        };
        wxbPolygonEdit.value.polygonShow.createPolygon(createPolygonObj, "view");
      });
    }
  } catch (error) {
    console.error("加载区域数据失败", error);
  }
};

let markerList = ref<any[]>([]);
// 加载配送点数据
const loadMealStateData = async (siteList: SiteInformationList[]) => {
  if (!mapInstance) return;
  siteList.forEach(item => {
    let content = `
      <div class="meal-icon-tips ${
        item.goodsCount === 0
          ? "grey-bg-color"
          : item.receivedGoodsCount === item.goodsCount
            ? "green-bg-color"
            : "origin-bg-color"
      }">${item.fsAddressId}</div>
    `;
    let dom = document.createElement("div");
    dom.innerHTML = content;
    // 获取当前楼层ID
    dom.addEventListener("click", () => showSiteInfo(item));
    let marker = mapInstance!.addDomMarker("1", dom);
    marker.position.copy(mapInstance!.lngLatToCoord(item.longitude, item.latitude));
    markerList.value.push(marker);
  });
};

// 销毁所有marker
const destroyAllMarker = () => {
  markerList.value.forEach(marker => {
    marker && marker.dispose();
  });
  markerList.value = [];
};

const showSiteInfo = (item: SiteInformationList) => {
  emit("showSiteInfo", item);
};

// 创建历史轨迹
const loadMealTracks = async (track: {
  pathData: {
    lat: number;
    lng: number;
    floorId: string;
  }[];
}) => {
  if (!track || !mapInstance) return;
  const module = await import("@/utils/navigation/js/navigation.js");
  const Navigation = module.Navigation;

  if (!track.pathData?.length) {
    return;
  }
  showCard.value = true;
  navigation.value = new Navigation(mapInstance);
  navigation.value.drawTrajectoryLine(track.pathData, "end");
  //获取第一个轨迹点
  const firstPoint = track?.pathData[0];

  // 定位到第一个轨迹点
  if (firstPoint) {
    console.log("定位到第一个轨迹点：", firstPoint);
    mapInstance.amap.setZoomAndCenter(16, [firstPoint.lng, firstPoint.lat], false);
  }
};

// 销毁所有导航实例
const destroyAllNavigation = () => {
  showCard.value = false;
  navigation.value?.destroyTrajectoryLine();
  navigation.value = null;
};
// 开始导航
const startNavi = () => {
  navigation.value?.startNavigation();
};

// 暂停导航
const pauseNavi = () => {
  navigation.value?.pause();
};

//继续导航
const restoreNavi = () => {
  // 判断当前是否处于暂停中
  navigation.value?.resume();
};

// 退出导航
const stopNavi = () => {
  navigation.value?.exit();
};

//  销毁全部编辑对象
const destroyAll = () => {
  wxbPolygonEdit.value?.polygonShow?.removeAll?.();
};

onBeforeUnmount(() => {
  destroyAll();
  destroyAllMarker();
  closePointInfo();
  destroyAllNavigation();
  if (mapInstance) {
    mapInstance?.destory?.();
    mapInstance = null;
  }
});

defineExpose({
  initMap,
  loadAreaData,
  loadMealStateData,
  destroyAllMarker,
  loadMealTracks,
  destroyAllNavigation,
  destroyAll
});
</script>

<style scoped lang="scss">
.map-wrapper {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.map-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.zoom-indicator {
  position: absolute;
  right: 16px;
  bottom: 0;
  z-index: 1000;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #ffffff;
  pointer-events: none;
  background: rgb(6 32 51 / 85%);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 30%);
}
:deep(.point-info) {
  position: relative;
  top: -50px;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  min-width: 200px;
  padding: 20px 14px 14px;
  font-size: 12px;
  line-height: 1.5;
  color: #1f2d3d;
  background: rgb(6 32 51 / 85%);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
  .point-info-close {
    position: absolute;
    top: 12px;
    right: 15px;
    font-size: 16px;
    color: #ffffff;
    cursor: pointer;
    transition:
      color 0.15s ease,
      transform 0.15s ease;
  }
  .point-info-close:hover {
    color: #6bbbf2;
    transform: scale(1.05);
  }
  .point-info-content {
    flex: 1;
    .info-item {
      padding: 5px 0;
      border-bottom: 1px solid #e0e6ed;
    }
    .info-item:first-child {
      border-bottom: none;
    }
  }
  .point-info > div:not(.point-info-close) {
    margin-top: 6px;
  }

  /* 审批状态颜色样式 */
  .status-box {
    padding: 2px 6px;
    padding: 0 5px;
    margin-left: 5px;
    font-size: 12px;
    border: 1px solid;
    border-radius: 3px;
  }
  .status-primary {
    font-weight: bold;
    color: #409eff; /* 蓝色 */
    border-color: #409eff;
  }
  .status-warning {
    font-weight: bold;
    color: #e6a23c; /* 橙色 */
    border-color: #e6a23c;
  }
  .status-danger {
    font-weight: bold;
    color: #f56c6c; /* 红色 */
    border-color: #f56c6c;
  }
  .status-success {
    font-weight: bold;
    color: #67c23a; /* 绿色 */
    border-color: #67c23a;
  }
  .status-info {
    font-weight: bold;
    color: #ffffff; /* 深灰色 */
    background-color: #909399;
    border-color: #ffffff;
  }
}
:deep(.meal-icon-tips) {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  border: 1px solid #ffffff;
  border-radius: 4px;
  &::before {
    position: absolute;
    bottom: -7px;
    left: 50%;
    content: "";
    border-top: 8px solid #ffffff;
    border-right: 8px solid transparent;
    border-left: 8px solid transparent;
    transform: translate(-50%);
  }
  &::after {
    position: absolute;
    bottom: -5px;
    left: 50%;
    width: 0;
    height: 0;
    content: "";
    border-right: 8px solid transparent;
    border-left: 8px solid transparent;
    transform: translate(-50%);
  }
}
.card {
  position: absolute;
  bottom: 50px;
  left: 50%;
  z-index: 1000;
  padding: 10px;
  font-size: 12px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 0 3px 3px rgb(0 0 0 / 7%);
  transform: translateX(-50%);
}
.list {
  display: flex;
}
.typeBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 10px;
  margin-right: 10px;
  color: #74b9ff;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  background-color: #e9ecef;
}
.speed {
  color: #57606f;
  cursor: default;
  background-color: #e9ecef;
}
.input-card {
  background-color: #ffffff;
  border-radius: 5px;
  box-shadow: 3px 3px 5px 3px rgb(0 0 0 / 7%);
  transform: translateY(-25px);
}
.input-card .name {
  padding: 5px 10px;
  font-size: 15px;
  color: #ffffff;
  background-color: #50b4b9;
}
.input-card::after {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 15px;
  height: 15px;
  content: "";
  background-color: #ffffff;
  transform: translateX(-50%) translateY(50%) rotateZ(45deg);
}
.bar {
  display: flex;
  flex-wrap: nowrap;
  background-color: #ffffff;
}
.btn {
  padding: 5px 10px;
  margin: 12px 7px;
  font-size: 14px;
  color: #4c4e4e;
  white-space: nowrap;
  background-color: #f3f3f3;
}
</style>
