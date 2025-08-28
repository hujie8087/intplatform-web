<template>
  <div>
    <div id="map" ref="mapContainer" style="width: 100%; height: 700px" />
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
import { ref, onMounted, onBeforeUnmount, defineEmits } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
// import image3 from "@/assets/202407qcgx-south-all.webp";
import image3 from "@/assets/map.webp";
import { ElMessage } from "element-plus";
import * as turf from "@turf/turf";

const props = defineProps<{
  mapFeatures: Array<GeoJSON.Feature>;
  dockData: any;
  type: any;
  storedPierId: any;
}>();
const emit = defineEmits(["update:geojson"]);

// 将传入的地图特征保存为响应式数据
const mapFeaturesCopy = ref([...props.mapFeatures]);

// 当 props.type === "berth" 时，用于存储包含蓝色区域的父级的 pierId
const storedPierId = ref<number | null>(props.storedPierId);
const storedBerthId = ref<number | null>(null);

let mapInstance: L.Map | null = null;
let drawnItems: L.FeatureGroup | null = null;
let drawControl: L.Control.Draw | null = null;
let clearControl: L.Control | null = null;
let fullscreenControl: L.Control | null = null;
let isFullScreen = false;

/** 递归添加 feature（包括 children） */
const addFeaturesRecursively = (features: Array<any>, parentLayer?: L.LayerGroup) => {
  features.forEach(feature => {
    const geoJsonLayer = L.geoJSON(feature, {
      style: { color: feature.properties.color || "gray", fillOpacity: 0.4 }
    });

    if (parentLayer) {
      geoJsonLayer.addTo(parentLayer);
    } else {
      geoJsonLayer.addTo(mapInstance!);
    }

    if (feature.children && feature.children.length > 0) {
      addFeaturesRecursively(feature.children, geoJsonLayer);
    }
  });
};

const initMap = () => {
  mapInstance = L.map("map").setView([0.4760544361548864, 127.98617362976076], 15);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(mapInstance);
  addFeaturesRecursively(mapFeaturesCopy.value);

  drawnItems = new L.FeatureGroup();
  mapInstance.addLayer(drawnItems);

  const bounds = [
    [0.462128, 127.883903],
    [0.554159, 128.047638]
  ];
  L.imageOverlay(image3, bounds, { opacity: 1 }).addTo(mapInstance);

  drawControl = new L.Control.Draw({
    edit: {
      featureGroup: drawnItems,
      remove: false,
      edit: false
    },
    draw: {
      polygon: true,
      rectangle: false,
      polyline: false,
      marker: false,
      circle: false,
      circlemarker: false
    }
  });
  mapInstance.addControl(drawControl);

  const checkBerthBlueArea = (features: any[]): boolean => {
    let emptyColorCount = 0; // 统计 `properties.color` 为空的 feature 数量

    const traverse = (features: any[]): boolean => {
      for (const feature of features) {
        if (feature.properties?.color === "blue" && feature.berthId != null) {
          return true; // 如果找到蓝色泊位，返回 true
        }

        if (!feature.properties?.color) {
          emptyColorCount++; // 统计 color 为空的 feature
          if (emptyColorCount >= 1) {
            return true; // 如果发现两个 color 为空的 feature，则返回 true
          }
        }

        if (feature.children && feature.children.length > 0) {
          if (traverse(feature.children)) {
            return true;
          }
        }
      }
      return false;
    };

    return traverse(features);
  };

  mapInstance.on(L.Draw.Event.CREATED, (event: L.DrawEvents.Created) => {
    const layer = event.layer;
    // 处理绘制多边形的坐标
    const latLngs = layer.getLatLngs() as L.LatLng[][]; // 假设为多边形
    let polygonCoordinates = latLngs[0].map(latLng => [latLng.lng, latLng.lat]);

    if (
      polygonCoordinates.length > 0 &&
      (polygonCoordinates[0][0] !== polygonCoordinates.at(-1)[0] || polygonCoordinates[0][1] !== polygonCoordinates.at(-1)[1])
    ) {
      polygonCoordinates.push(polygonCoordinates[0]);
    }

    const isBerth = props.type === "berth";
    const dockGeoJson = props.dockData.geoJson;
    /*     if (isBerth && dockGeoJson) {
      const drawnPolygon = layer.toGeoJSON();
      let dockPolygon;

      // 如果存储了父级的 pierId，则遍历 dockGeoJson 找出 pierId 相等的那一项
      if (storedPierId.value) {
        if (dockGeoJson && Array.isArray(dockGeoJson)) {
          for (const feature of dockGeoJson) {
            if (feature.pierId === storedPierId.value) {
              dockPolygon = turf.polygon(feature.geometry.coordinates);
              break;
            }
          }
        }
        // 如果未找到匹配项，则退回默认逻辑
        if (!dockPolygon) {
          dockPolygon = turf.polygon(dockGeoJson.geometry.coordinates);
        }
      } else {
        dockPolygon = turf.polygon(dockGeoJson.geometry.coordinates);
      }

      if (!turf.booleanWithin(drawnPolygon, dockPolygon)) {
        ElMessage({
          message: "绘制区域超出码头范围，请重新绘制。",
          type: "warning",
          duration: 3000
        });
        return;
      }
    } */
    if (isBerth && checkBerthBlueArea(mapFeaturesCopy.value)) {
      ElMessage({
        message: "一个区域内只能有一个蓝色区域。",
        type: "warning",
        duration: 3000
      });

      // **清除所有 `properties.color` 为空的项**
      mapFeaturesCopy.value = mapFeaturesCopy.value.filter(feature => feature.properties.color);

      // **清除地图上的图层**
      drawnItems.clearLayers();
      mapInstance.eachLayer(layer => {
        if (layer instanceof L.GeoJSON || layer === drawnItems) {
          mapInstance!.removeLayer(layer);
        }
      });

      // **重新添加剩余的 features**
      if (mapFeaturesCopy.value.length > 0) {
        addFeaturesRecursively(mapFeaturesCopy.value);
      }

      return;
    }

    if (!isBerth) {
      const hasBlueFeature = mapFeaturesCopy.value.some(feature => feature.properties.color === "blue");
      if (hasBlueFeature) {
        ElMessage({
          message: "一个码头只能有一个蓝色区域，请先删除现有的蓝色区域，再添加新的区域。",
          type: "warning",
          duration: 3000
        });
        return;
      }
    }

    if (!isBerth) {
      drawnItems.clearLayers();
    }

    drawnItems.addLayer(layer);
    mapInstance.addLayer(drawnItems);
    const geoJsonData = layer.toGeoJSON();
    geoJsonData.geometry.coordinates[0] = polygonCoordinates;

    // 如果为 berth 类型且存有泊位信息，则在属性中添加 berth 字段
    if (isBerth && storedBerthId.value !== null) {
      geoJsonData.properties = {
        ...geoJsonData.properties,
        berthId: storedBerthId.value
      };
    }
    mapFeaturesCopy.value = [...mapFeaturesCopy.value, geoJsonData];
    console.log(geoJsonData);
    emit("update:geojson", geoJsonData);
  });

  clearControl = L.control({ position: "topright" });

  clearControl.onAdd = () => {
    const button = L.DomUtil.create("button", "leaflet-bar leaflet-control leaflet-control-custom");
    button.innerText = props.type === "berth" ? "清除区域" : "清除蓝色区域";
    button.type = "button"; // 关键代码，防止页面刷新
    button.style.backgroundColor = "white";
    button.style.padding = "5px 10px";
    button.style.border = "2px solid #ccc";
    button.style.borderRadius = "4px";
    button.style.cursor = "pointer";

    L.DomEvent.on(button, "click", event => {
      L.DomEvent.stopPropagation(event);
      L.DomEvent.preventDefault(event);

      let initialLength = mapFeaturesCopy.value.length;

      mapFeaturesCopy.value = mapFeaturesCopy.value
        .filter(feature => feature.properties.color) // 直接过滤掉 `color` 为空的项
        .map(feature => {
          if (feature.children) {
            feature.children = feature.children.filter(child => child.properties.color);
          }
          return feature;
        });

      drawnItems.clearLayers();

      const hasDockTypeInDeleted = mapFeaturesCopy.value.some(
        feature => (feature.properties.color === "blue" || !feature.properties.color) && feature.pierId
      );

      // if (props.type === "berth" && hasDockTypeInDeleted) {
      //   ElMessage({
      //     message: "操作泊位时不允许删除码头。",
      //     type: "warning",
      //     duration: 3000
      //   });

      //   return;
      // }

      const hasBerthUnderDock = mapFeaturesCopy.value.some(
        feature => feature.properties.color === "blue" && Array.isArray(feature.children) && feature.children.length > 0
      );
      if (hasBerthUnderDock) {
        ElMessage({
          message: "码头下存在泊位，无法删除蓝色区域。",
          type: "warning",
          duration: 3000
        });
        return;
      }

      mapFeaturesCopy.value = mapFeaturesCopy.value
        .map(feature => {
          if (feature.properties.color === "blue" || !feature.properties.color) {
            return null;
          }
          if (feature.children) {
            feature.children = feature.children.filter(child => child.properties.color !== "blue");
          }
          return feature;
        })
        .filter(Boolean);

      mapInstance.eachLayer(layer => {
        if (layer instanceof L.GeoJSON || layer === drawnItems) {
          mapInstance!.removeLayer(layer);
        }
      });

      // **重新渲染剩余的 features**
      if (mapFeaturesCopy.value.length > 0) {
        addFeaturesRecursively(mapFeaturesCopy.value);
      }

      emit("update:geojson", null);
    });

    return button;
  };

  clearControl.addTo(mapInstance);

  fullscreenControl = L.control({ position: "topright" });
  fullscreenControl.onAdd = () => {
    const button = L.DomUtil.create("button", "leaflet-bar leaflet-control leaflet-control-custom");
    button.innerText = "全屏";
    button.style.backgroundColor = "white";
    button.style.padding = "5px 10px";
    button.style.border = "2px solid #ccc";
    button.style.borderRadius = "4px";
    button.style.cursor = "pointer";
    L.DomEvent.on(button, "click", () => {
      if (!isFullScreen) {
        mapInstance?.getContainer().requestFullscreen();
        button.innerText = "退出全屏";
      } else {
        document.exitFullscreen();
        button.innerText = "全屏";
      }
      isFullScreen = !isFullScreen;
    });
    return button;
  };
  fullscreenControl.addTo(mapInstance);

  mapInstance.on(L.Draw.Event.DELETED, () => {
    mapFeaturesCopy.value = [];
    emit("update:geojson", mapFeaturesCopy.value);
  });
};

onMounted(() => {
  // 当 props.type === "berth"，遍历 mapFeaturesCopy，
  // 找出其子项中 color 为 "blue" 的项，
  // 使用 child.properties.berthHpId 存储父级 id
  if (props.type === "berth") {
    for (const feature of mapFeaturesCopy.value) {
      if (feature.children) {
        for (const child of feature.children) {
          if (child.properties && child.properties.color === "blue") {
            storedPierId.value = child.berthHpId;
            break;
          }
        }
      }
      if (storedPierId.value !== null) break;
    }
  }
  initMap();
});

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.off();
    mapInstance.remove();
  }
});
</script>

<style scoped>
#map {
  width: 100%;
  height: 100%;
  border: 1px solid #dddddd;
  border-radius: 8px;
}
.leaflet-bar button {
  padding: 4px 8px;
  font-size: 14px;
  cursor: pointer;
}
.leaflet-control-custom {
  padding: 4px 8px;
  cursor: pointer;
  background: white;
  border: 2px solid gray;
}
</style>
