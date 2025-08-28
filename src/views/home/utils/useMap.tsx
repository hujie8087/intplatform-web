/* eslint-disable */
import { ref, onMounted, onBeforeUnmount, defineEmits } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
// import image3 from "@/assets/202407qcgx-south-all.webp";
import image3 from "@/assets/map.webp";
import { getRepairStatistics } from "@/api/modules/dashboard";
const convertToLatLng = polygons => {
  return polygons.map(
    ring => ring.map(([lng, lat]) => [lat, lng]) // 交换顺序
  );
};
// 人员信息函数
export const useMap = (regionList = []) => {
  let map = {};
  let mapInstance: L.Map | null = null;
  // if (map != null) {
  //   map.remove(); // 先移除旧地图
  // }
  const initializeMap = () => {
    map = L.map("map", {
      center: [0.471591392971324, 127.98038005828859],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: { smooth: true, debounceTimeout: 200 },
      maxZoom: 20
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    const bounds = [
      [0.462128, 127.883903],
      [0.554159, 128.047638]
    ];
    L.imageOverlay(image3, bounds, { opacity: 1 }).addTo(map);
  };
  return {
    initializeMap
  };
};
// 维修统计函数
export const maintainMap = () => {
  let map = {};
  let mapInstance: L.Map | null = null;
  let drawnItems: L.FeatureGroup | null = null;
  // if (map != null) {
  //   map.remove(); // 先移除旧地图
  // }
  const initMaintainMap = (regionList = []) => {
    map = L.map("maintenance", {
      center: [0.471591392971324, 127.98038005828859],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: { smooth: true, debounceTimeout: 200 },
      maxZoom: 20
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
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
    /*  L.imageOverlay(url, bounds, options) 用来把一张图片放到指定的 bounds 范围里。
        image3：图片的路径或者 Base64。
        bounds：上面定义的经纬度范围。
        { opacity: 1 }：图片的不透明度（1=完全不透明，0=完全透明）
        .addTo(map)：把这个图片覆盖层加到 map 地图对象里。
    */
    L.imageOverlay(image3, bounds, { opacity: 1 }).addTo(map);
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
          // -------------------------------------
          /*           let popupContent = L.DomUtil.create("div", "region-pop-style-wrapper");
          popupContent.innerHTML = `
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
            `;
          console.log("*************", popupContent);
          marker.bindPopup(popupContent, { className: "custom-popup" });
          marker.on("popupopen", e => {
            // debugger;
            let popupElement = e.popup.getElement();
            if (popupElement && !popupElement.dataset.moved) {
              document.body.appendChild(popupElement);
              popupElement.dataset.moved = "true"; // 防止重复 append
              const pos = map.latLngToContainerPoint(popup.getLatLng());
              popupElement.style.position = "absolute";
              popupElement.style.left = pos.x + "px";
              popupElement.style.top = pos.y + "px";
            }
          });
          marker.openPopup(); // 打开Popub弹框
          map.on("move", () => {
            const popup = marker.getPopup();
            if (!popup || !popup.isOpen()) return;

            const pos = map.latLngToContainerPoint(popup.getLatLng());
            const popupElement = popup.getElement();
            if (popupElement) {
              popupElement.style.position = "absolute";
              popupElement.style.left = pos.x + "px";
              popupElement.style.top = pos.y + "px";
            }
          }); */
          //---------------------------------

          const offsetCenter = L.latLng(center.lat - 0.009, center.lng + 0.004);
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
      polygonsGroup = L.featureGroup(polygons).addTo(map);
      // 缩放到能看到所有区域
      map.fitBounds(polygonsGroup.getBounds());
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
  return {
    initMaintainMap
  };
};
//隐患排查
export const riskMap = () => {
  let map = {};
  let mapInstance: L.Map | null = null;
  let drawnItems: L.FeatureGroup | null = null;
  // if (map != null) {
  //   map.remove(); // 先移除旧地图
  // }
  const initRsikMap = (regionList = []) => {
    map = L.map("risk", {
      center: [0.471591392971324, 127.98038005828859],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: { smooth: true, debounceTimeout: 200 },
      maxZoom: 20
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    /*   L.FeatureGroup()：Leaflet 提供的一种 图层组（Layer Group）。
    它可以用来存放多个绘制的图形对象（点、线、面、矩形、多边形等）。
    drawnItems 就是一个变量，用来保存你绘制出来的所有图层。 */
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    const bounds = [
      [0.462128, 127.883903],
      [0.554159, 128.047638]
    ];
    L.imageOverlay(image3, bounds, { opacity: 1 }).addTo(map);

    let maskLayer;
    const createMaskLayer = () => {
      if (maskLayer) map.removeLayer(maskLayer);
      const maskPolygon = [
        [
          [-90, -180],
          [-90, 180],
          [90, 180],
          [90, -180]
        ],
        ...config.map(layer => layer.geoJson.geometry.coordinates[0].map(coord => [coord[1], coord[0]]))
      ];
      maskLayer = L.polygon(maskPolygon, {
        fillColor: "#082238",
        fillOpacity: 0.7,
        stroke: false
      }).addTo(map);
    };
    // createMaskLayer();
  };
  return {
    initRsikMap
  };
};
// 报餐送餐
export const mealMap = (regionList = []) => {
  let map = {};
  let mapInstance: L.Map | null = null;
  let drawnItems: L.FeatureGroup | null = null;
  // if (map != null) {
  //   map.remove(); // 先移除旧地图
  // }
  const initMealMap = () => {
    map = L.map("meal", {
      center: [0.471591392971324, 127.98038005828859],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: { smooth: true, debounceTimeout: 200 },
      maxZoom: 20
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    /*   L.FeatureGroup()：Leaflet 提供的一种 图层组（Layer Group）。
    它可以用来存放多个绘制的图形对象（点、线、面、矩形、多边形等）。
    drawnItems 就是一个变量，用来保存你绘制出来的所有图层。 */
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    const bounds = [
      [0.462128, 127.883903],
      [0.554159, 128.047638]
    ];
    L.imageOverlay(image3, bounds, { opacity: 1 }).addTo(map);
    let maskLayer;
    const createMaskLayer = () => {
      if (maskLayer) map.removeLayer(maskLayer);
      const maskPolygon = [
        [
          [-90, -180],
          [-90, 180],
          [90, 180],
          [90, -180]
        ],
        ...config.map(layer => layer.geoJson.geometry.coordinates[0].map(coord => [coord[1], coord[0]]))
      ];
      maskLayer = L.polygon(maskPolygon, {
        fillColor: "#082238",
        fillOpacity: 0.7,
        stroke: false
      }).addTo(map);
    };
  };
  return {
    initMealMap
  };
};
