<template>
  <div>
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
              <dv-digital-flop :config="mealMapData.foodCount" style="width: 75%; height: 25px" />
            </div>
          </li>
          <li class="person-info-top-item">
            <div class="person-info-top-item-top">正在配送餐食</div>
            <div class="person-info-top-item-bottom">
              <img src="../images/big2.png" alt="" style="width: 19px; height: 22px" />
              <dv-digital-flop :config="mealMapData.deliveryCount" style="width: 75%; height: 25px; text-align: left" />
            </div>
          </li>
          <li class="person-info-top-item">
            <div class="person-info-top-item-top">已完成配送</div>
            <div class="person-info-top-item-bottom">
              <img src="../images/big3.png" alt="" style="width: 18px; height: 19px" />
              <dv-digital-flop :config="mealMapData.deliveredCount" style="width: 75%; height: 25px; text-align: left" />
            </div>
          </li>
        </ul>
      </div>
      <div class="maintenance-report-bottom" v-if="isShow">
        <InfiniteScrollList v-model="seachParams.fcId" :car-list="carList" :item-height="40" @change="handleChange" />
      </div>
    </div>
    <el-dialog
      v-model="dialogShow"
      width="85%"
      class="site-info-dialog"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
    >
      <template #header>
        <div class="dialog-header">
          <div class="dialog-title-section">
            <h3 class="site-name">
              <el-icon size="24"><Location /></el-icon>{{ dialogSiteInformation?.fsAddressId }}
            </h3>
            <!-- 餐饮名称 -->
            <div class="food-name">
              <el-tag
                size="large"
                effect="dark"
                :type="foodNameMap.find(item => item.value === seachParams.foodName)?.tagType ?? 'primary'"
                >{{ foodNameMap.find(item => item.value === seachParams.foodName)?.label }}</el-tag
              >
            </div>
            <div class="site-stats">
              <!-- 餐饮名称 -->
              <div class="stat-item">
                <span class="stat-label">货物总数</span>
                <span class="stat-value total">{{ formatter(dialogSiteInformation?.goodsCount || 0) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">备餐中</span>
                <span class="stat-value remaining">{{ formatter(dialogSiteInformation?.kitchenPreppingCount || 0) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">配送中</span>
                <span class="stat-value remaining">{{ formatter(dialogSiteInformation?.remainingGoodsCount || 0) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">已送达</span>
                <span class="stat-value remaining" style="color: #27ae60">{{
                  formatter(dialogSiteInformation?.receivedGoodsCount || 0)
                }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">完成率</span>
                <span class="stat-value completion">
                  {{
                    dialogSiteInformation?.goodsCount
                      ? Math.round((dialogSiteInformation?.receivedGoodsCount / dialogSiteInformation.goodsCount) * 100)
                      : 0
                  }}%
                </span>
              </div>
            </div>
          </div>
          <el-button class="close-btn" circle @click="dialogShow = false">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </template>

      <div class="dialog-content">
        <div class="table-container">
          <ProTable
            ref="proTable"
            :columns="columns"
            :data="siteInformationOfGoods"
            row-key="id"
            :tool-button="false"
            :pagination="false"
            class="custom-table"
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="tsx" setup>
import { Search, Refresh, Location, Close } from "@element-plus/icons-vue";
import { ref, reactive, computed, nextTick, onBeforeMount } from "vue";
import { getMealService, getSiteInformation, getCarLine, getCarMessge, getSiteInformationOfGoods } from "@/api/modules/dashboard";
import { getAllCarNameList, getAllMessHallNameList } from "@/api/modules/mdc/system";
import InfiniteScrollList from "./components/InfiniteScrollList.vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import dayjs from "dayjs";
import truckImg from "../images/truckImg.png";
import { CarListItem, SiteInformationList } from "@/api/interface/dashboard";
import { ColumnProps } from "@/components/ProTable/interface";
import { MdcOrder } from "@/api/interface/mealDelivery/order";
import { DictOptions } from "@/api/interface";
import ProTable from "@/components/ProTable/index.vue";

const emit = defineEmits(["getSiteData", "getTrackData"]);

import imageUrl from "@/assets/images/south-all.webp";
const filePath = import.meta.env.VITE_API_URL;
const formatter = number => {
  const numbers = number.toString().split("").reverse();
  const segs: string[] = [];

  while (numbers.length) segs.push(numbers.splice(0, 3).join(""));
  return segs.join(",").split("").reverse().join("");
};
// 报餐送餐统计
let mealMapData = reactive({
  orderCount: {
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
  deliveredCount: {
    number: [0],
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
// 获取食堂列表
const messHallListOptions = ref<DictOptions[]>([]);
const getMessHallList = async () => {
  const res = await getAllMessHallNameList();
  messHallListOptions.value = res.data.map(item => ({
    label: item.fdName,
    value: item.fdId
  }));
};
getMessHallList();

// 站点货物弹出框
const dialogSiteInformation = ref<SiteInformationList>();
const dialogShow = ref(false);
// 出餐方式
const foodTypeOptions = ref<DictOptions[]>([
  { label: "中国餐", value: "0", tagType: "primary", idLabel: "Makanan Cina" },
  { label: "印尼餐", value: "1", tagType: "success", idLabel: "Makanan Indonesia" },
  { label: "桶装水", value: "2", tagType: "warning", idLabel: "Air Mineral" }
]);
const foodNameMap = ref<DictOptions[]>([
  { label: "早餐", value: "0", tagType: "primary" },
  { label: "午餐", value: "1", tagType: "success" },
  { label: "晚餐", value: "2", tagType: "warning" },
  { label: "夜宵", value: "3", tagType: "danger" },
  { label: "20L", value: "4", tagType: "info" },
  { label: "点心", value: "5", tagType: "warning" },
  { label: "凌晨餐", value: "6", tagType: "info" }
]);
// 字典数据
const packageTypeOptions = ref<DictOptions[]>([
  { label: "打包袋", value: "0", tagType: "primary" },
  { label: "餐盒", value: "1", tagType: "success" },
  { label: "桶装", value: "2", tagType: "warning" }
]);
const orderStatusMapping = (row: MdcOrder.ResMdcOrder): { text: string; color: string } => {
  const { orderStatus, centerStatus } = row;

  if ("0" === orderStatus && "1" === centerStatus) {
    // 班组已下单
    return { text: "班组已下单", color: "primary" };
  } else if ("0" === orderStatus && "2" === centerStatus) {
    // 部门已审核
    return { text: "部门已审核", color: "primary" };
  } else if ("1" === orderStatus && "3" === centerStatus) {
    // 餐厅备餐中
    return { text: "餐厅备餐中", color: "warning" };
  } else if ("3" === orderStatus && "3" === centerStatus) {
    // 取餐配送中
    return { text: "取餐配送中", color: "success" };
  } else if ("4" === orderStatus && "3" === centerStatus) {
    // 送达
    return { text: "已送达", color: "info" };
  }
  return { text: "未知", color: "danger" };
};
const orderDateTime = (row: MdcOrder.ResMdcOrder) => {
  const key = `${row.orderStatus}_${row.centerStatus}`;
  const timeMap = {
    "0_1": row.teamSubmitTime,
    "0_2": row.deptSubmitTime,
    "1_3": row.leadTime,
    "3_3": row.mealTime,
    "4_3": row.completeTime
  };

  return timeMap[key] ?? "";
};
const columns = reactive<ColumnProps<MdcOrder.ResMdcOrder>[]>([
  { prop: "orderNo", label: "订单编号", width: 160 },
  {
    prop: "canteen",
    label: "出餐食堂",
    enum: messHallListOptions,
    render(scope) {
      return <div style="white-space: normal;">{scope.row.canteen}</div>;
    }
  },
  {
    prop: "deliverySite",
    label: "配送站点",
    width: 80
  },
  { prop: "pNum", label: "数量", width: 60 },
  {
    prop: "createBy",
    label: "申报人",
    render(scope) {
      return <div style="white-space: normal;">{scope.row.createBy}</div>;
    }
  },
  {
    prop: "phone",
    label: "联系方式",
    width: 100,
    render(scope) {
      return <div style="white-space: normal;">{scope.row.phone}</div>;
    }
  },
  { prop: "foodType", label: "餐饮类型", width: 80, enum: foodTypeOptions, tag: true },
  {
    prop: "foodName",
    label: "餐饮名称",
    width: 80,
    enum: foodNameMap,
    tag: true
  },
  { prop: "packageType", label: "打包类型", width: 80, enum: packageTypeOptions, tag: true },
  {
    prop: "fcName",
    label: "车号",
    width: 60
  },
  {
    prop: "orderStatus",
    label: "订单状态",
    render(scope) {
      return (
        <div>
          <div class="table-column-order-status">
            <el-tag type={orderStatusMapping(scope.row).color}>{orderStatusMapping(scope.row).text}</el-tag>
            {scope.row.orderStatus === "4" && scope.row.centerStatus === "3" && (
              <el-image
                ref="imageRef"
                style="width: 25px; height: 25px;display: inline-block;vertical-align: middle; margin-left: 10px;"
                src={filePath + "/file/mdc/image?filename=" + scope.row.imageUrl + "&w=50&h=50"}
                show-progress
                preview-src-list={[filePath + "/file/mdc/image?filename=" + scope.row.imageUrl]}
                fit="cover"
                preview-teleported={true}
                z-index={10000}
                onClick={e => {
                  e.stopPropagation(); // 阻止冒泡
                }}
              >
                {{
                  error: () => (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="#ccc"
                      style="vertical-align: middle;"
                    >
                      <rect width="24" height="24" fill="#f5f5f5" stroke="#aaa" />
                      <path d="M4 16l4-4 3 3 5-5 4 4v6H4z" fill="#999" />
                      <path d="M10 8h.01M14 8h.01M12 10l1.5 2L12 14l-1.5-2z" stroke="#666" strokeWidth="1" />
                    </svg>
                  )
                }}
              </el-image>
            )}
            <br />
            <span style="font-size: 12px; line-height: 12px; color: #909399">{orderDateTime(scope.row)}</span>
          </div>
        </div>
      );
    }
  }
]);
const siteInformationOfGoods = ref<any[]>([]);
const isShow = ref(true);
const seachParams = reactive({
  date: dayjs().format("YYYY-MM-DD"),
  foodName: "0",
  fcId: ""
});
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
const showSearchCriteria = () => {
  isShow.value = !isShow.value;
};
const layers = ref<any>({});
const map = ref<L.Map | null>(null);
const initMap = () => {
  let drawnItems: L.FeatureGroup | null = null;
  map.value = null;
  layers.value = {};
  // 🔹不同类型的图层单独管理
  layers.value = {
    markers: L.layerGroup(),
    lines: L.layerGroup(),
    trucks: L.layerGroup()
    // overlays: L.layerGroup()
  };
  // 如果已有实例，先销毁
  const mapContainer = document.getElementById("meal") as any;
  if (mapContainer && mapContainer._leaflet_id) {
    mapContainer._leaflet_id = null; // 强制解除 Leaflet 挂载状态
  }
  map.value = L.map("meal", {
    center: [0.48187163935937005, 127.9847670540254],
    zoom: 15,
    zoomControl: false,
    attributionControl: false,
    scrollWheelZoom: { smooth: true, debounceTimeout: 200 },
    maxZoom: 19
  });
  L.tileLayer("https://www.google.com/maps/vt?lyrs=s@189&gl=en&x={x}&y={y}&z={z}").addTo(map.value);

  L.imageOverlay(imageUrl, [
    [0.462128, 128.047638],
    [0.554159, 127.883903]
  ]).addTo(map.value);
  drawnItems = new L.FeatureGroup();
  map.value.addLayer(drawnItems);
  map.value.invalidateSize && map.value.invalidateSize();
  // 把所有图层组挂到地图上
  Object.values(layers.value).forEach((layer: any) => layer.addTo(map.value));
  // 在模块/组件的外层作用域（只声明一次）
  layers.value.markers = L.layerGroup(); // 先清空之前的 markers
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

// 查询站点信息
const siteInformationData = ref<SiteInformationList[]>([]);
const siteInformation = async () => {
  const res = await getSiteInformation({ date: seachParams.date, foodName: seachParams.foodName, fcName: seachParams.fcId });
  siteInformationData.value = res.data.filter(item => item.latitude && item.longitude);
  emit("getSiteData", siteInformationData.value);
};
// 在模块/组件的外层作用域（只声明一次）
const setMarker = (data: SiteInformationList[] = []) => {
  if (!map.value) return;
  layers.value.markers.clearLayers();
  data.forEach(item => {
    const lat = Number(item.latitude);
    const lng = Number(item.longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;
    const chosenIcon =
      item.goodsCount === 0
        ? "grey-bg-color"
        : item.receivedGoodsCount === item.goodsCount
          ? "green-bg-color"
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
    const marker = L.marker([lat, lng], { icon: transparentIcon });
    marker.on("click", () => showSiteInfo(item));
    // 将 marker 添加到图层组中
    layers.value.markers.addLayer(marker);
  });
  // 如果之前没挂载到地图上，则添加一次
  if (!map.value.hasLayer(layers.value.markers)) {
    layers.value.markers.addTo(map.value);
  }
};
const carLineArr = ref<CarListItem[]>([]);
// 车辆路线
const carLine = async () => {
  const res = await getCarLine({ date: seachParams.date, foodName: seachParams.foodName, fcName: seachParams.fcId });
  const truck = res.data.find(item => item.fcName === seachParams.fcId);
  if (!truck) return;
  emit("getTrackData", truck);
};

// 查询所有数据
const searchAllData = async () => {
  await siteInformation();
  await carLine();
  nextTick(() => {
    setMarker(siteInformationData.value);
  });
};
// 左边车牌滚动组件change 事件
const handleChange = () => {
  // 切换单辆车，要把那个车的行驶轨迹给标红
  setTrucks(carLineArr.value, { date: seachParams.date, foodName: seachParams.foodName, fcName: seachParams.fcId }, layers);
};

/** 行驶轨迹 + 卡车 */
const setTrucks = (data: CarListItem[], obj: any, layers: any) => {
  layers.lines = L.layerGroup();
  layers.trucks = L.layerGroup();
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
          let time = dayjs().format("YYYY-MM-DD HH:mm:ss");
          // 拼接内容
          const content = `<div class="site-popup">
              <div class="site-popup-first">
                <b>${item.fcName || "-"}</b>
                <span>${time}</span>
              </div>
              <div class="site-popup-second">
                <span>货物总数</span>
                <b>${formatter(truckData.foodCount)}</b>
              </div>
              <div class="site-popup-second sit-popup-margin">
                <span>剩余货物</span>
                <b>${formatter(truckData.deliveryCount)}</b>
              </div>
              <div class="site-popup-third">
                <span>已完成</span>
                <b>${formatter(truckData.deliveredCount)}</b>
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
    map.value!.fitBounds(bounds, { padding: [50, 50] });
  }
};
const showSiteInfo = async (item: SiteInformationList) => {
  dialogSiteInformation.value = item;
  dialogShow.value = true;
  const res = await getSiteInformationOfGoods({ fsIds: item.fsIds, date: seachParams.date, foodName: seachParams.foodName });
  siteInformationOfGoods.value = res.data;
  console.log(siteInformationOfGoods.value, "siteInformationOfGoods");
};
// 重置搜索
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
onBeforeMount(async () => {
  await siteInformation();
  await getCarList();
  await carLine();
  const res = await getMealService({});
  mealMapData.deliveredCount.number[0] = res.data.deliveredCount;
  mealMapData.deliveryCount.number[0] = res.data.deliveryCount;
  mealMapData.foodCount.number[0] = res.data.foodCount;
  mealMapData.orderCount.number[0] = res.data.orderCount;

  nextTick(() => {
    initMap();
  });
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
defineExpose({ zoomResize, showSiteInfo });
</script>

<style scoped>
.map {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
}
.maintenance-report {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 1000;
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

/* 站点信息对话框样式 */
.site-info-dialog {
  overflow: hidden;
  border-radius: 16px;
}
.site-info-dialog :deep(.el-dialog) {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgb(0 0 0 / 30%);
}
.site-info-dialog :deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border-bottom: 1px solid rgb(255 255 255 / 10%);
}
.site-info-dialog :deep(.el-dialog__body) {
  padding: 0;
  background: transparent;
}
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
}
.dialog-title-section {
  display: flex;
  flex: 1;
  gap: 30px;
  align-items: center;
}
.site-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  color: var(--el-text-color-regular);
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgb(52 152 219 / 30%);
}
.site-info {
  flex: 1;
}
.site-name {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-regular);
  text-shadow: 0 2px 4px rgb(0 0 0 / 30%);
}
.site-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}
.stat-item {
  display: flex;
  align-items: center;
}
.stat-label {
  margin-right: 10px;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-regular);
  letter-spacing: 0.5px;
}
.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 2px 4px rgb(0 0 0 / 30%);
}
.stat-value.total {
  color: #3498db;
}
.stat-value.remaining {
  color: #e74c3c;
}
.stat-value.completion {
  color: #27ae60;
}
.close-btn {
  width: 40px;
  height: 40px;
  color: #ffffff;
  background: rgb(0 0 0 / 50%);
  border: 1px solid rgb(255 255 255 / 20%);
  transition: all 0.3s ease;
}
.close-btn:hover {
  background: rgb(231 76 60 / 80%);
  border-color: #e74c3c;
  transform: scale(1.05);
}
.dialog-content {
  padding: 0;
}
.table-container {
  background: rgb(255 255 255 / 5%);
  backdrop-filter: blur(10px);
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 12px;
}
.custom-table :deep(.el-table) {
  overflow: hidden;
  background: transparent;
  border-radius: 8px;
}
.custom-table :deep(.el-table__header) {
  background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
}
.custom-table :deep(.el-table th) {
  padding: 16px 12px;
  font-weight: 600;
  color: #ffffff;
  background: transparent;
  border-bottom: 1px solid rgb(255 255 255 / 10%);
}
.custom-table :deep(.el-table td) {
  padding: 12px;
  color: #ecf0f1;
  background: rgb(255 255 255 / 2%);
  border-bottom: 1px solid rgb(255 255 255 / 5%);
}
.custom-table :deep(.el-table tr:hover td) {
  background: rgb(255 255 255 / 8%);
}
.custom-table :deep(.el-table__row:nth-child(even)) {
  background: rgb(255 255 255 / 2%);
}
.custom-table :deep(.el-table__row:nth-child(odd)) {
  background: rgb(255 255 255 / 1%);
}
.custom-table :deep(.el-tag) {
  font-weight: 500;
  border: none;
  border-radius: 6px;
}
.custom-table :deep(.el-image) {
  overflow: hidden;
  border-radius: 6px;
}

/* 响应式设计 */
@media (width <= 768px) {
  .site-info-dialog {
    width: 95% !important;
  }
  .dialog-header {
    padding: 0;
  }
  .dialog-title-section {
    width: 100%;
  }
  .site-stats {
    gap: 16px;
  }
  .dialog-content {
    padding: 16px 20px 20px;
  }
  .site-name {
    font-size: 18px;
  }
  .stat-value {
    font-size: 16px;
  }
}
</style>
