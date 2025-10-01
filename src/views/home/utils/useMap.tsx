/* eslint-disable */

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import { getRepairStatistics, getCarMessge } from "@/api/modules/dashboard";
import truckImg from "../images/truckImg.png";
import { CarListItem } from "@/api/interface/dashboard";
type ParamsType = { date: string; foodName: string; fcName: string };
const isHttps = window.location.protocol === "https:";
const convertToLatLng = polygons => {
  return polygons.map(
    ring => ring.map(([lng, lat]) => [lat, lng]) // 交换顺序
  );
};
// 人员信息函数
export const useMap = (regionList = []) => {
  let map: L.Map | null = null;
  const initializeMap = () => {
    // 如果已有实例，先销毁
    if (map) {
      map.remove();
      map = null;
    }
    map = L.map("map", {
      center: [0.471591392971324, 127.98038005828859],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: { smooth: true, debounceTimeout: 200 },
      maxZoom: 19
    });
    // L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    L.tileLayer("https://www.google.com/maps/vt?lyrs=s@189&gl=en&x={x}&y={y}&z={z}").addTo(map);
    const bounds = [
      [0.462128, 127.883903],
      [0.554159, 128.047638]
    ];
    const customTileLayer = L.tileLayer(
      (isHttps ? import.meta.env.VITE_MAP_TILES_URL_https : import.meta.env.VITE_MAP_TILES_URL) + "/{z}/{x}_{y}.webp",
      {
        maxZoom: 19,
        minZoom: 10,
        bounds: bounds, // 限制瓦片层显示范围
        attribution: "© Custom Tiles"
      }
    ).addTo(map);
    personZoom();
    // layer.imageOverlay = customTileLayer;
    // L.imageOverlay(image3, bounds, { opacity: 1 }).addTo(map);
  };
  const personZoom = () => {
    map.invalidateSize && map.invalidateSize();
  };
  return {
    initializeMap,
    personZoom
  };
};
// 维修统计函数
export const maintainMap = () => {
  let map: L.Map | null = null;
  let drawnItems: L.FeatureGroup | null = null;
  const initMaintainMap = (regionList = []) => {
    // 如果已有实例，先销毁
    if (map) {
      map.remove();
      map = null;
    }
    map = L.map("maintenance", {
      center: [0.471591392971324, 127.98038005828859],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: { smooth: true, debounceTimeout: 200 },
      maxZoom: 19
    });
    // L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    L.tileLayer("https://www.google.com/maps/vt?lyrs=s@189&gl=en&x={x}&y={y}&z={z}").addTo(map);
    /*   L.FeatureGroup()：Leaflet 提供的一种 图层组（Layer Group）。
    它可以用来存放多个绘制的图形对象（点、线、面、矩形、多边形等）。
    drawnItems 就是一个变量，用来保存你绘制出来的所有图层。 */
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    /*  表示图片在地图上覆盖的地理范围,它是一个二维数组，包含两个点：左上角（或西南角）经纬度：[0.462128, 127.883903]
      右下角（或东北角）经纬度：[0.554159, 128.047638],这样 Leaflet 就知道这张图片对应地图上的哪一块区域。
    */
    const bounds = [
      [0.462128, 127.883903],
      [0.554159, 128.047638]
    ];
    const customTileLayer = L.tileLayer(
      (isHttps ? import.meta.env.VITE_MAP_TILES_URL_https : import.meta.env.VITE_MAP_TILES_URL) + "/{z}/{x}_{y}.webp",
      {
        maxZoom: 19,
        minZoom: 10,
        bounds: bounds, // 限制瓦片层显示范围
        attribution: "© Custom Tiles"
      }
    ).addTo(map);
    // layer.imageOverlay = customTileLayer;
    // L.imageOverlay(image3, bounds, { opacity: 1 }).addTo(map);
    interface arrType {
      name: string;
      ancestors: string;
      geoJson: any;
    }
    let arr: arrType[] = [];
    regionList.forEach(item => {
      let geoJson = item.geoJson;
      if (geoJson) {
        geoJson = JSON.parse(geoJson);
        let geometry = geoJson.geometry;
        let { coordinates = [] } = geometry || [];
        const convertedMaskPolygon = convertToLatLng(coordinates);
        arr.push({
          name: item.buildName,
          ancestors: item.ancestors,
          geoJson: convertedMaskPolygon
        });
      }
    });
    let polygonsGroup = null; // 存放所有 polygon（用于整体 fitBounds）
    const createMaskLayer = () => {
      if (polygonsGroup) map.removeLayer(polygonsGroup);
      // 多边形组
      const polygons = arr.map(item => {
        // 绘制多边形
        const polygonLayer = L.polygon(item.geoJson, {
          fillColor: "#0074F0", // 填充颜色
          fillOpacity: 0.45, // 填充透明度
          color: "#0074F0", // 边框颜色
          weight: 2, // 边框粗细（默认 3）
          opacity: 1 // 边框透明度（默认 1）
          // stroke: false // true会绘制边框
        }).addTo(map);
        // 获取多边形中心点
        const center = polygonLayer.getBounds().getCenter();
        // 比如向下偏移 0.002 度（纬度增加方向是北，上方，所以要减去）

        // 添加文字标注， 在中心加一个 marker + divIcon 显示文字
        let marker = L.marker(center, {
          zIndexOffset: 1000,
          icon: L.divIcon({
            className: "polygon-text",
            html: item.name, // 这里就是区域的名字
            iconSize: [120, 26],
            iconAnchor: [28, 13] // 锚点居中
          })
        }).addTo(map);

        polygonLayer.on("click", async () => {
          const res = await getRepairStatistics({ ancestors: item.ancestors });
          const data = res.data;
          let {
            totalCount = 0,
            finishCount = 0,
            endCount = 0,
            waitReWorkCount = 0,
            waitingCount = 0,
            finishRateIn24H = 0
          } = data || {};
          let end = finishCount + endCount;
          let fix = waitReWorkCount + waitingCount;
          // const offsetCenter = L.latLng(center.lat - 0.009, center.lng + 0.004);
          const offsetCenter = L.latLng(center.lat, center.lng);
          const popup = L.popup({
            closeButton: false, // 右上角删除按钮
            closeOnClick: true, // 点击空白地方消失
            className: "region-pop-style", // 弹窗容器的class值
            // autoPan: false // 不让地图因 popup 移动
            pane: "tooltipPane" // 默认 popupPane 可以改成 tooltipPane，更靠前
          })
            .setLatLng(center) // 设置坐标点
            .setLatLng(offsetCenter) // 设置坐标点
            .setContent(
              `
                <div class="region-pop-style-wrapper">
                  <h1>${item.name}维修统计</h1>
                  <div class="region-pop-style-text1">
                    <span>报修总数</span>
                    <b>${formatter(totalCount)}</b>
                  </div>
                  <div class="region-pop-style-text2">
                    <span>报修已完成</span>
                    <b>${formatter(end)}</b>
                  </div>
                  <div class="region-pop-style-text3">
                    <span>报修待维修</span>
                    <b>${formatter(fix)}</b>
                  </div>
                  <div class="region-pop-style-text4">
                    <span>24H完成比</span>
                    <b>${finishRateIn24H || "--"}</b>
                  </div>
                </div>
                `
            )
            .openOn(map);
        });
        return polygonLayer;
      });
      // 整体 featureGroup,然后一个整体，然后后面缩放到可视区域
      if (polygons.length) {
        polygonsGroup = L.featureGroup(polygons).addTo(map);
        // 缩放到能看到所有区域
        map.fitBounds(polygonsGroup.getBounds());
      }
    };
    createMaskLayer();
    function formatter(number) {
      if (number === null || number === undefined) return "--";
      const numbers = number.toString().split("").reverse();
      const segs = [];
      while (numbers.length) segs.push(numbers.splice(0, 3).join(""));
      return segs.join(",").split("").reverse().join("");
    }
  };
  const maintainZoom = () => {
    map.invalidateSize && map.invalidateSize();
  };
  return {
    initMaintainMap,
    maintainZoom
  };
};
//隐患排查
export const riskMap = () => {
  let map: L.Map | null = null;
  let mapInstance: L.Map | null = null;
  let drawnItems: L.FeatureGroup | null = null;
  const initRsikMap = (regionList = []) => {
    if (map) {
      map.remove(); // 先移除旧地图
    }
    map = L.map("risk", {
      center: [0.471591392971324, 127.98038005828859],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: { smooth: true, debounceTimeout: 200 },
      maxZoom: 19
    });
    // L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    L.tileLayer("https://www.google.com/maps/vt?lyrs=s@189&gl=en&x={x}&y={y}&z={z}").addTo(map);
    /*   L.FeatureGroup()：Leaflet 提供的一种 图层组（Layer Group）。
    它可以用来存放多个绘制的图形对象（点、线、面、矩形、多边形等）。
    drawnItems 就是一个变量，用来保存你绘制出来的所有图层。 */
    const bounds = [
      [0.462128, 127.883903],
      [0.554159, 128.047638]
    ];
    L.tileLayer((isHttps ? import.meta.env.VITE_MAP_TILES_URL_https : import.meta.env.VITE_MAP_TILES_URL) + "/{z}/{x}_{y}.webp", {
      maxZoom: 19,
      minZoom: 10,
      bounds: bounds, // 限制瓦片层显示范围
      attribution: "© Custom Tiles"
    }).addTo(map);
  };
  const riskZoom = () => {
    map.invalidateSize && map.invalidateSize();
  };
  return {
    initRsikMap,
    riskZoom
  };
};
// 报餐送餐
export const mealMap = (regionList = []) => {
  let map: L.Map | null = null;
  let drawnItems: L.FeatureGroup | null = null;
  // 🔹不同类型的图层单独管理
  let layers = {
    markers: L.layerGroup(),
    lines: L.layerGroup(),
    trucks: L.layerGroup()
    // overlays: L.layerGroup()
  };
  const initMealMap = () => {
    // 如果已有实例，先销毁
    if (map) {
      map.remove();
      map = null;
    }
    map = L.map("meal", {
      center: [0.471591392971324, 127.98038005828859],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: { smooth: true, debounceTimeout: 200 },
      maxZoom: 19
    });
    // L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    L.tileLayer("https://www.google.com/maps/vt?lyrs=s@189&gl=en&x={x}&y={y}&z={z}").addTo(map);
    /*   L.FeatureGroup()：Leaflet 提供的一种 图层组（Layer Group）。
    它可以用来存放多个绘制的图形对象（点、线、面、矩形、多边形等）。
    drawnItems 就是一个变量，用来保存你绘制出来的所有图层。 */
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    const bounds = [
      [0.462128, 127.883903],
      [0.554159, 128.047638]
    ];
    const isHttps = window.location.protocol === "https:";
    const customTileLayer = L.tileLayer(
      (isHttps ? import.meta.env.VITE_MAP_TILES_URL_https : import.meta.env.VITE_MAP_TILES_URL) + "/{z}/{x}_{y}.webp",
      {
        maxZoom: 19,
        minZoom: 10,
        bounds: bounds, // 限制瓦片层显示范围
        attribution: "© Custom Tiles"
      }
    ).addTo(map);

    // L.imageOverlay(image3, bounds, { opacity: 1 }).addTo(map);
    // 把所有图层组挂到地图上
    Object.values(layers).forEach(layer => layer.addTo(map));
  };
  // 在模块/组件的外层作用域（只声明一次）
  const setMarker = (data: any[] = []) => {
    layers.markers.clearLayers(); // 先清空之前的 markers
    data.forEach(item => {
      const lat = Number(item.latitude);
      const lng = Number(item.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return;
      const chosenIcon =
        item.receivedGoodsCount === item.goodsCount && item.goodsCount !== 0
          ? "green-bg-color"
          : item.receivedGoodsCount === 0
            ? "grey-bg-color"
            : "origin-bg-color";
      // 定义一个透明 icon
      const text = item.fsAddressId || "未命名";
      let { width, height } = measureWidth(text, chosenIcon);
      const transparentIcon = L.divIcon({
        className: `meal-service-icon-tips ${chosenIcon}`,
        html: text, // 不渲染任何 DOM
        iconSize: [width, height], // 让它自适应文字宽度
        iconAnchor: [width / 2, height / 2],
        popupAnchor: [0, -(height / 2 - 5)]
      });
      const marker = L.marker([lat, lng], { icon: transparentIcon }).bindPopup(setPopupStyle(item), {
        closeButton: false,
        className: "meal-custom-popup", // 自定义类名便于样式控制
        autoPan: false // 禁止自动平移，避免影响定位
      });
      marker.on("click", () => {
        marker.openPopup();
      });
      layers.markers.addLayer(marker);
    });
    function setPopupStyle(item) {
      const now = new Date();
      const pad = n => String(n).padStart(2, "0");
      const hh = pad(now.getHours());
      const mm = pad(now.getMinutes());
      const ss = pad(now.getSeconds());
      let time = `${hh}: ${mm}: ${ss}`;
      return `<div class="site-popup">
        <div class="site-popup-first">
          <b>${item.fsAddressId || "-"}</b>
          <span>${time}</span>
        </div>
        <div class="site-popup-second">
          <span>货物总数</span>
          <b>${formatNumber(item.goodsCount)}</b>
        </div>
        <div class="site-popup-third">
          <span>剩余货物</span>
          <b>${formatNumber(item.goodsCount - item.receivedGoodsCount)}</b>
        </div>
      </div>`;
    }
    // var markers = L.layerGroup(layerGroup);
    // markers.addTo(map);
    // map.setView([0.47969, 127.9831427], 15);
  };
  /** 行驶轨迹 + 卡车 */
  const setTrucks = (data: CarListItem[], obj: ParamsType) => {
    layers.lines.clearLayers();
    layers.trucks.clearLayers();
    const truckIcon = L.icon({
      iconUrl: truckImg,
      iconSize: [50, 30],
      iconAnchor: [25, 15]
    });

    let allLatLngs: L.LatLngExpression[] = [];
    data.forEach(item => {
      if (!item.line || item.line.length < 2) return;
      // 1. 添加路线
      let polyline = {};
      if (obj.fcName == item.fcName && item.line.length > 0) {
        polyline = L.polyline(item.line, {
          // color: "#00E5FF",
          color: "#e30dbe",
          weight: 3
        });
        // 如果有值则证明选择了某辆车，需要聚焦到那辆车，否则是聚焦所有
        allLatLngs = allLatLngs.concat(item.line);
      } else {
        polyline = L.polyline(item.line, {
          color: "blue",
          weight: 3
        });
        // 累加坐标用于 fitBounds
        allLatLngs = allLatLngs.concat(item.line);
      }
      layers.lines.addLayer(polyline);
      // 2. 小车平滑移动
      const latlngs = item.line.map(([lat, lng]) => L.latLng(lat, lng));
      const carMarker = L.marker(latlngs[latlngs.length - 1], { icon: truckIcon, zIndexOffset: 1000 }).addTo(layers.trucks);
      let currentSegment = 0;
      let progress = 0; // [0,1] 插值进度
      const speed = 0.05; // 🔹控制速度，越小越慢

      function animate() {
        if (currentSegment >= latlngs.length - 1) return; // 已经到终点
        const start = latlngs[currentSegment];
        const end = latlngs[currentSegment + 1];

        // 插值计算位置
        const lat = start.lat + (end.lat - start.lat) * progress;
        const lng = start.lng + (end.lng - start.lng) * progress;

        carMarker.setLatLng([lat, lng]);
        // carMarker.bringToFront();
        carMarker.setZIndexOffset(1000);
        carMarker.off("click"); // 先解绑之前的
        //  给小车 marker 加点击事件
        carMarker.on("click", async () => {
          //  每次点击先移除 popup，避免立刻显示上一次的内容
          carMarker.unbindPopup();
          try {
            let res: any = await getCarMessge({
              date: obj.date,
              foodName: obj.foodName,
              fcName: item.fcName
            });
            const truckData = res.data;
            let time = getNowTime();
            // 拼接内容
            const content = `<div class="site-popup">
              <div class="site-popup-first">
                <b>${item.fcName || "-"}</b>
                <span>${time}</span>
              </div>
              <div class="site-popup-second">
                <span>货物总数</span>
                <b>${formatNumber(truckData.foodCount)}</b>
              </div>
              <div class="site-popup-second sit-popup-margin">
                <span>剩余货物</span>
                <b>${formatNumber(truckData.deliveryCount)}</b>
              </div>
              <div class="site-popup-third">
                <span>已完成</span>
                <b>${formatNumber(truckData.deliveredCount)}</b>
              </div>
            </div>`;
            // 弹出 popup
            carMarker
              .bindPopup(content, {
                className: "truck-popup", // 自定义 popup class
                closeButton: false
              })
              .openPopup();
          } catch (err) {
            carMarker.bindPopup("<b>加载失败，请重试</b>").openPopup();
          }
        });
        progress += speed;
        if (progress >= 1) {
          progress = 0;
          currentSegment++;
        }
        requestAnimationFrame(animate);
      }
      animate();
    });

    // 3. 地图聚焦到所有车辆轨迹
    if (allLatLngs.length > 0) {
      const bounds = L.latLngBounds(allLatLngs);
      map!.fitBounds(bounds, { padding: [50, 50] });
    }
  };
  const mealZoom = () => {
    map.invalidateSize && map.invalidateSize();
  };

  return {
    initMealMap,
    setMarker,
    setTrucks,
    mealZoom
  };
};
const formatNumber = number => {
  if (number === null || number === undefined) return "--";
  const numbers = number.toString().split("").reverse();
  const segs = [];
  while (numbers.length) segs.push(numbers.splice(0, 3).join(""));
  return segs.join(",").split("").reverse().join("");
};
const getNowTime = () => {
  const now = new Date();
  const pad = n => String(n).padStart(2, "0");
  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  return `${hh}: ${mm}: ${ss}`;
};
// 测试文本标签宽度
const measureWidth = (text, chosenIcon) => {
  const tempDiv = document.createElement("div");
  tempDiv.className = `meal-service-icon-tips ${chosenIcon}`;
  tempDiv.style.visibility = "hidden";
  tempDiv.style.visibility = "hidden";
  tempDiv.style.position = "absolute";
  tempDiv.innerHTML = text;
  document.body.appendChild(tempDiv);
  const width = tempDiv.clientWidth;
  const height = tempDiv.clientHeight;
  document.body.removeChild(tempDiv);
  return { width, height };
};
