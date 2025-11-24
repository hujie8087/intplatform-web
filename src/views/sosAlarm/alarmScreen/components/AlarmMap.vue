<template>
  <div class="map-wrapper">
    <div ref="mapContainerRef" class="map-container"></div>
    <div v-if="currentZoom !== null" class="zoom-indicator">缩放级别: {{ currentZoom }}</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import geoJson from "@/assets/geojson/area4.json";
import markerIcon2x from "@/assets/icons/marker-icon-2x.png";
import markerIcon from "@/assets/icons/marker-icon.png";
import markerShadow from "@/assets/icons/marker-shadow.png";

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

const mapContainerRef = ref<HTMLElement | null>(null);
const currentZoom = ref<number | null>(null);
let map: L.Map | null = null;
let maskLayer: L.Layer | null = null;
let markersLayer: L.LayerGroup | null = null;
const markerMap = new Map<number, L.Marker>();

const config = [
  {
    geoJson
  }
];

const emit = defineEmits<{
  mapReady: [map: L.Map];
  markerSelect: [alarm: AlarmData];
}>();

const createMaskLayer = () => {
  if (!map) return;
  if (maskLayer) {
    map.removeLayer(maskLayer);
  }

  const maskPolygon = [
    [
      [-90, -180],
      [-90, 180],
      [90, 180],
      [90, -180]
    ],
    ...config.map(layer => layer.geoJson.geometry.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]))
  ];

  maskLayer = L.polygon(maskPolygon, {
    fillColor: "#082238",
    fillOpacity: 0.7,
    stroke: false
  }).addTo(map);
};

// 创建带涟漪效果的标记
const createMarkerWithRipple = (lat: number, lng: number) => {
  // 创建涟漪层
  const rippleIcon = L.divIcon({
    className: "ripple-marker",
    html: `
      <div class="ripple-container">
        <div class="ripple ripple-1"></div>
        <div class="ripple ripple-2"></div>
        <div class="ripple ripple-3"></div>
      </div>
    `,
    iconSize: [80, 80],
    iconAnchor: [40, 40]
  });

  const rippleMarker = L.marker([lat, lng], {
    icon: rippleIcon,
    interactive: false,
    zIndexOffset: -1000
  });

  // 创建普通标记（使用默认图标）
  const normalMarker = L.marker([lat, lng]);

  return { rippleMarker, normalMarker };
};

const initMap = () => {
  if (!mapContainerRef.value) return;

  map = L.map(mapContainerRef.value, {
    center: [0.482406, 127.985508],
    zoom: 16,
    zoomControl: true,
    attributionControl: false,
    maxZoom: 20,
    minZoom: 10
  });

  currentZoom.value = map.getZoom();

  L.tileLayer("https://www.google.com/maps/vt?lyrs=s@189&gl=en&x={x}&y={y}&z={z}").addTo(map);
  const isHttps = window.location.protocol === "https:";
  const tileUrl = (isHttps ? import.meta.env.VITE_MAP_TILES_URL_https : import.meta.env.VITE_MAP_TILES_URL) + "/{z}/{x}_{y}.webp";

  L.tileLayer(tileUrl, {
    maxZoom: 20,
    minZoom: 10
  }).addTo(map);

  createMaskLayer();

  markersLayer = L.layerGroup().addTo(map);

  // 监听缩放变化
  map.on("zoomend", () => {
    if (map) {
      currentZoom.value = map.getZoom();
    }
  });

  map.on("click", e => {
    console.log("地图点击坐标:", e.latlng);
    console.log("经纬度坐标:", `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`);
  });

  emit("mapReady", map);
};

const updateMarkers = (alarms: AlarmData[]) => {
  if (!markersLayer) return;

  markersLayer.clearLayers();
  markerMap.clear();

  alarms.forEach(alarm => {
    if (alarm.latitude && alarm.longitude) {
      // 添加涟漪和普通标记
      const { rippleMarker, normalMarker } = createMarkerWithRipple(alarm.latitude, alarm.longitude);

      rippleMarker.addTo(markersLayer!);
      normalMarker.addTo(markersLayer!);

      const popupHtml = `
        <div class="alarm-popup">
          <h3>报警ID: ${alarm.id}</h3>
          <p>报警人: ${alarm.reportBy ?? "未知"}</p>
          <p>描述: ${alarm.reportDescription ?? "无"}</p>
          <p>位置: ${alarm.reportLocation ?? "未记录"}</p>
          <p>时间: ${alarm.reportTime ?? "未知"}</p>
        </div>
      `;
      normalMarker.bindPopup(popupHtml);

      // 保存标记引用
      markerMap.set(alarm.id, normalMarker);

      normalMarker.on("click", () => {
        emit("markerSelect", alarm);
      });
    }
  });
};

const centerOnLocation = (lat: number, lng: number) => {
  if (map) {
    map.setView([lat, lng], 18);
  }
};

const openMarkerPopup = (alarm: AlarmData) => {
  const marker = markerMap.get(alarm.id);
  if (marker && map) {
    marker.openPopup();
  }
};

onMounted(() => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
  });
  initMap();
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
  currentZoom.value = null;
});

defineExpose({
  updateMarkers,
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

/* 涟漪标记样式 */
:deep(.ripple-marker) {
  pointer-events: none;
  background: transparent;
  border: none;
}
:deep(.ripple-container) {
  position: relative;
  width: 80px;
  height: 80px;
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
