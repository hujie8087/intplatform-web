<template>
  <el-dialog v-model="drawerVisible" width="680" destroy-on-close :title="`${drawerProps.title}公交站台`">
    <el-form
      ref="ruleFormRef"
      label-width="120px"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="drawerProps.rowData"
      :hide-required-asterisk="drawerProps.isView"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="drawerProps.rowData!.name" :placeholder="`${$t('main.inputError', { msg: '名称' })}`"></el-input>
      </el-form-item>
      <el-form-item label="印尼名称" prop="indonesianName">
        <el-input
          v-model="drawerProps.rowData!.indonesianName"
          :placeholder="`${$t('main.inputError', { msg: '印尼名称' })}`"
        ></el-input>
      </el-form-item>
      <!-- 选择经纬度 -->
      <el-col :span="24">
        <el-form-item label="选择经纬度" prop="longitude">
          <el-input v-model="MapLatlng" :placeholder="`${$t('main.inputError', '经纬度')}`" clearable>
            <template #append>
              <el-button type="primary" @click="openMapDialog">选择经纬度</el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-col>
      <el-form-item label="状态" prop="status">
        <el-switch
          v-model="drawerProps.rowData!.status"
          inline-prompt
          :active-value="0"
          :inactive-value="1"
          :active-text="`${$t('dict.enable')}`"
          :inactive-text="`${$t('dict.disable')}`"
        />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number
          v-model="drawerProps.rowData!.sort"
          :placeholder="`${$t('main.inputError', { msg: '排序' })}`"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          type="textarea"
          :rows="5"
          v-model="drawerProps.rowData!.remark"
          :placeholder="`${$t('main.inputError', { msg: '备注' })}`"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" v-show="!drawerProps.isView" @click="handleSubmit">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
  <el-dialog v-model="drawerMapVisible" :destroy-on-close="true" width="1000" :title="`${drawerProps.title}选择经纬度`">
    <div id="map"></div>
    <template #footer>
      <el-button @click="drawerMapVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" @click="handleMapSubmit">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="BusStationDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import { BusStation } from "@/api/interface/bus";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import imageUrl from "@/assets/images/south-all.webp";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  name: [{ required: true, message: t("main.inputError", { msg: "名称" }) }],
  indonesianName: [{ required: true, message: t("main.inputError", { msg: "印尼名称" }) }],
  status: [{ required: true, message: t("main.inputError", { msg: "状态" }) }]
});
interface DrawerProps {
  title: string;
  isView: boolean;
  rowData?: Partial<BusStation.ResBusStation>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
}

// 经纬度
const MapLatlng = ref("");
const arrLatlng = ref<any[]>([]);
// drawer框状态
const drawerVisible = ref(false);
const drawerMapVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  rowData: {} as BusStation.ResBusStation
});

// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
  if (params.rowData?.longitude) {
    MapLatlng.value = params.rowData.longitude + "," + params.rowData.latitude;
    arrLatlng.value = [{ lng: params.rowData.longitude, lat: params.rowData.latitude }];
  } else {
    MapLatlng.value = "";
    arrLatlng.value = [];
  }
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await drawerProps.value.api!({
        ...drawerProps.value.rowData,
        type: "0"
      });
      ElMessage.success({
        message: t("main.successMsg", { title: "公交站台", method: `${drawerProps.value.title}` })
      });
      drawerProps.value.getTableList!();
      drawerVisible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};
let markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [20, 30]
});
const initMap = () => {
  let map = L.map("map", {
    center: [0.4822936691545465, 127.98023321325684], //中心坐标
    zoom: 15, //初始缩放，因为在下文写了展示全地图，所以这里不设置，也可以设置
    minZoom: 3,
    maxZoom: 18,
    zoomControl: true, //缩放组件
    attributionControl: false //去掉右下角logol
  });
  L.tileLayer("https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}", {
    attribution: "&copy; <p>OpenStreetMap</p> contributors"
  }).addTo(map);
  // 嵌入自定义图层
  L.imageOverlay(imageUrl, [
    [0.462128, 128.047638],
    [0.554159, 127.883903]
  ]).addTo(map);
  let currentMarker = null;
  if (arrLatlng.value.length > 0) {
    currentMarker = L.marker(arrLatlng.value[0], { icon: markerIcon }).addTo(map).bindPopup("标记").openPopup();
  }
  map.on("click", function (e) {
    let latlng = e.latlng;
    // 移除之前的 Marker

    if (currentMarker) {
      map.removeLayer(currentMarker);
    }
    arrLatlng.value = [latlng];
    currentMarker = L.marker(latlng, { icon: markerIcon }).addTo(map).bindPopup("标记").openPopup();
  });
};
const handleMapSubmit = () => {
  drawerProps.value.rowData!.longitude = arrLatlng.value[0].lng;
  drawerProps.value.rowData!.latitude = arrLatlng.value[0].lat;
  MapLatlng.value = arrLatlng.value[0].lng + "," + arrLatlng.value[0].lat;
  drawerMapVisible.value = false;
};

const openMapDialog = () => {
  drawerMapVisible.value = true;
  setTimeout(() => {
    initMap();
  }, 500);
};
defineExpose({
  acceptParams
});
</script>
<style scoped>
#map {
  width: 100%;
  height: 600px;
}
</style>
