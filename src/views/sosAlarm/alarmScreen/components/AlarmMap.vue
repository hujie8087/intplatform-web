<template>
  <div class="map-wrapper">
    <!-- <div ref="mapContainerRef" class="map-container"></div> -->
    <div id="mapContainer" style="width: 100%; height: 100%"></div>
  </div>
</template>

<script setup lang="ts">
import "@/assets/css/VgoMap.umd.css";
import { DomMarker } from "@/assets/js/DomMarker.js";
import { ref } from "vue";

declare global {
  interface Window {
    VgoMap: any;
  }
}
interface AlarmData {
  id: number;
  latitude: number;
  longitude: number;
  reportBy?: string;
  reportDescription?: string;
  reportLocation?: string;
  reportTime?: string;
  orderNumber?: string;
  userId?: number;
  orderNo?: string;
  orderId?: string | number;
}

const emit = defineEmits<{
  markerSelect: [alarm: AlarmData];
}>();

const mapId = "1902300333347049472";
const map = ref<any | null>(null);
const currentZoom = ref<number | null>(null);
// 存储当前打开的 marker info 元素，用于关闭其他已打开的
const currentOpenInfoElement = ref<HTMLElement | null>(null);

const initMap = (assetTagsData: AlarmData[]) => {
  if (map.value) {
    map.value.dispose();
  }

  const mapInstance = new window.VgoMap.Map({
    el: "mapContainer",
    id: mapId
  });
  map.value = mapInstance;
  currentZoom.value = mapInstance?.amap?.getZoom?.() ?? null;
  mapInstance?.amap?.on?.("zoomchange", () => {
    currentZoom.value = mapInstance?.amap?.getZoom?.() ?? null;
  });

  let idx = 0;
  let changeFocus = () => {
    if (idx > assetTagsData.length - 1) idx = 0;
    let item = assetTagsData[idx];
    idx++;

    console.log(item, "item");
    // 等于1的则是室外直接聚焦
    mapInstance.amap.setZoomAndCenter(21.5, [item.longitude, item.latitude], false);
  };
  document.querySelector("#function")?.addEventListener("click", changeFocus);

  function createMapMarker(item) {
    const poiUrl = new URL("@/assets/images/marker-icon.png", import.meta.url).href;
    let content = `
        <div class='wxb-custom-marker unselectable'>
          <div class="custom-marker-icon">
            <img class="wxb-marker-icon" src="${poiUrl}" />
            <div class="ripple-container">
              <div class="ripple ripple-1"></div>
              <div class="ripple ripple-2"></div>
              <div class="ripple ripple-3"></div>
            </div>
          </div>
          <div class="wxb-marker-info" id="alarm-${item.id}">
            <div class="alarm-close">X</div>
            <div class="alarm-popup">
              <h3>报警ID: ${item.id}</h3>
              <p>报警人: ${item.reportBy ?? "未知"}</p>
              <p>描述: ${item.reportDescription ?? "无"}</p>
              <p>位置: ${item.reportLocation ?? "未记录"}</p>
              <p>时间: ${item.reportTime ?? "未知"}</p>
            </div>
            <div class="leaflet-popup-tip-container"><div class="leaflet-popup-tip"></div></div>
          </div>
        </div>
        `;

    const marker = new DomMarker(mapInstance, item, item.floorId, content);
    marker.create(item.position);

    console.log(marker, "marker", item);
    setTimeout(() => {
      // marker.domElement: DomMarker 渲染的 DOM 节点

      const alarmInfo = document.querySelector<HTMLElement>(`#alarm-${item.id}`);
      const closeBtn = document.querySelector<HTMLElement>(".alarm-close");

      if (closeBtn && alarmInfo) {
        closeBtn.addEventListener("click", e => {
          e.stopPropagation(); // 避免触发 marker 的点击事件
          console.log(e, 12313123);
          alarmInfo.style.display = "none";
        });
      }
    });
    // 绑定点击事件，控制 info 显示/隐藏
    marker.on("click", e => {
      e.stopPropagation?.();
      e.preventDefault?.();

      // 将地图中心定位到该位置
      openMarkerPopup(item);
      emit("markerSelect", item);
    });
  }

  // function updateMarkers(item) {
  //   const mapRenderer = window.VgoMap.Map;
  //   if (!mapRenderer) return null;

  //   let customMarker = mapRenderer.addMarker(item.floorId, {
  //     src: "./img/poi.png",
  //     fillStyle: "#e03131", // 字体颜色
  //     strokeStyle: "#fff", // 边框
  //     // bgColor: '#C0C4CC', // 背景颜色 灰色
  //     strokeWidth: 0.15,
  //     isCollision: false, // 是否有碰撞体积
  //     position: item.position,
  //     // scale: 1, // 缩放
  //     text: item.name,
  //     fontSize: 14,
  //     renderOrder: 10000 // 渲染优先级
  //   });
  //   customMarker.on("click", e => {
  //     e.event?.stopPropagation?.();
  //     e.event?.preventDefault?.();
  //     console.log(e, "点击了标记");
  //     // customMarker.dispose() // 销毁标记
  //   });
  //   return customMarker;
  // }

  mapInstance.on("loaded", () => {
    console.log("地图加载成功");
    window.VgoMap.Map = mapInstance;

    // 监听地图点击事件，请勿多次监听
    // 解绑请使用map.off
    mapInstance.on("click", e => {
      // 点击地图其他地方时，关闭已打开的 marker info
      if (currentOpenInfoElement.value) {
        currentOpenInfoElement.value.style.display = "none";
        currentOpenInfoElement.value = null;
      }
      console.log(e, "e 地图点击事件");
      // let position = mapInstance.lngLatToCoord(e.lnglat);
      // let newClickMarker = createMapMarker({
      //   name: "新点击的点位",
      //   floorId: "1",
      //   position
      // });
    });

    console.log("点位数据---", assetTagsData);

    assetTagsData.forEach(item => {
      let markerItem = {
        ...item,
        // 转换坐标系将火星坐标系转换成坐标轴系
        position: mapInstance.lngLatToCoord(item.longitude, item.latitude),
        floorId: "1"
      };
      // 创建DOM标记，DOM标记自由度相当较高，但是性能较差，如果渲染点位较多请使用map自带的渲染点位
      // createDomMarker(markerItem)

      // 地图自带的渲染点位，性能较好适合渲染大量点位
      console.log(mapInstance.lngLatToCoord(item.longitude, item.latitude), "position");
      createMapMarker(markerItem);
    });
  });
};

const centerOnLocation = (lat: number, lng: number) => {
  if (map.value?.amap) {
    map.value.amap.setZoomAndCenter(21.5, [lng, lat], false);
  }
};

const openMarkerPopup = (alarm: AlarmData) => {
  // 查找对应的 alarm info 元素
  const alarmInfo = document.getElementById(`alarm-${alarm.id}`) as HTMLElement | null;
  document.querySelectorAll<HTMLElement>(".wxb-marker-info").forEach(el => (el.style.display = "none"));

  if (!alarmInfo) {
    console.warn(`未找到 ID 为 alarm-${alarm.id} 的元素`);
    return;
  }

  // 显示当前点击的 info
  alarmInfo.style.display = "block";

  // 可选：将地图中心定位到该 alarm 的位置
  if (map.value && alarm.longitude && alarm.latitude) {
    centerOnLocation(alarm.latitude, alarm.longitude);
  }

  console.log("打开报警弹窗:", alarm, alarmInfo);
};

defineExpose({
  initMap,
  centerOnLocation,
  openMarkerPopup
});
</script>

<style scoped>
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
  bottom: 16px;
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
:deep(.alarm-popup) {
  font-size: 13px;
  line-height: 1.5;
  color: #062033;
}
:deep(.alarm-popup h3) {
  margin: 0 0 6px;
  font-size: 16px;
  color: #0a3d6e;
}
:deep(.wxb-marker-icon) {
  position: relative;
  z-index: 10;
}
:deep(.leaflet-popup-tip-container) {
  position: absolute;
  left: 50%;
  width: 40px;
  height: 20px;
  margin-top: 12px;
  margin-left: -20px;
  overflow: hidden;
  pointer-events: none;
}
:deep(.leaflet-popup-tip) {
  width: 17px;
  height: 17px;
  padding: 1px;
  margin: -10px auto 0;
  color: #333333;
  pointer-events: auto;
  background: #ffffff;
  box-shadow: 0 3px 14px #00000066;
  transform: rotate(45deg);
}

/* 涟漪标记样式 */
:deep(.ripple-marker) {
  pointer-events: none;
  background: transparent;
  border: none;
}
:deep(.ripple-container) {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80px;
  height: 80px;
  margin: -40px 0 0 -40px;
  pointer-events: none;
}

/* 涟漪效果 */
:deep(.ripple) {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  pointer-events: none;
  border: 2px solid #ff4444;
  border-radius: 50%;
  opacity: 0;
  transform: translate(-50%, -50%);
  animation: ripple-animation 2s ease-out infinite;
}
:deep(.ripple-2) {
  animation-delay: 0.6s;
}
:deep(.ripple-3) {
  animation-delay: 1.2s;
}
:deep(.wxb-custom-marker) {
  position: relative;
}
:deep(.wxb-marker-info) {
  position: absolute;
  bottom: 100%;
  left: 50%;
  z-index: 1000;
  display: none;
  min-width: 200px;
  padding: 13px 24px 13px 20px;
  margin-bottom: 10px;
  color: #333333;
  white-space: nowrap;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 3px 14px #00000066;
  transform: translateX(-50%);

  /* 添加箭头指向 marker */
  &::after {
    position: absolute;
    top: 100%;
    left: 50%;
    width: 0;
    height: 0;
    content: "";
    border-top: 8px solid #ffffff;
    border-right: 8px solid transparent;
    border-left: 8px solid transparent;
    transform: translateX(-50%);
  }
  .alarm-popup {
    font-size: 13px;
    line-height: 1.5;
    color: #062033;
    white-space: normal;
    h3 {
      margin: 0 0 6px;
      font-size: 16px;
      color: #0a3d6e;
    }
    p {
      margin: 1.3em 0;
    }
  }
}
:deep(.alarm-close) {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 3px 5px;
  font-size: 14px;
  font-weight: bold;
  color: white;
  cursor: pointer;
  background: rgb(0 0 0 / 40%);
  border-radius: 4px;
}

@keyframes ripple-animation {
  0% {
    width: 20px;
    height: 20px;
    opacity: 1;
  }
  100% {
    width: 80px;
    height: 80px;
    opacity: 0;
  }
}
</style>
