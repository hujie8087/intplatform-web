<template>
  <el-dialog
    v-model="drawerVisible"
    :destroy-on-close="true"
    width="80%"
    :title="`${formInline.title}区域`"
    top="2vh"
    :before-close="beforeClose"
  >
    <el-form ref="formRef" :inline="true" :model="formData" :rules="rules" class="coal-area-pop">
      <el-row>
        <el-col :span="5">
          <el-form-item label="区域名称: " prop="areaName" required>
            <el-input v-model="formData.areaName" class="!w-[210px]" placeholder="请输入区域名称" />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="生活区区域" prop="repairArea">
            <el-cascader
              v-model="formData.repairAreaId"
              :options="treeData"
              style="width: 100%"
              filterable
              :props="{
                label: 'title',
                children: 'children',
                checkStrictly: true,
                value: 'id'
              }"
              @change="handleChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item>
            <el-button
              :type="state.editType === 'polygonEdit' ? 'primary' : ''"
              :disabled="!state.mapLoaded"
              @click="addLocation"
            >
              绘制站点
            </el-button>
            <el-button :type="state.editType === '' ? 'primary' : ''" :disabled="!state.mapLoaded" @click="changeStatus('')">
              取消
            </el-button>
            <el-button type="danger" :disabled="!state.mapLoaded" @click="destroyAll"> 销毁绘制 </el-button>
          </el-form-item></el-col
        >
      </el-row>
    </el-form>
    <div class="map-container" v-loading="!state.mapLoaded">
      <div id="stationMap" class="manufacturer-map" style="width: 100%; height: 100%"></div>
    </div>
    <el-form-item class="draw-area-btn">
      <el-button @click="beforeClose">取消</el-button>
      <el-button type="primary" @click="submitForm">确定</el-button>
    </el-form-item>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeMount, onBeforeUnmount } from "vue";
import { ElMessage } from "element-plus";
import { addRegion, editRegion } from "@/api/modules/system/drawArea";
import { getAllBuildingTree } from "@/api/modules/productDisplay/building";
import { useI18n } from "vue-i18n";
import { Building } from "@/api/interface/productDisplay/building";
import { Area } from "@/api/interface/system";
import { createManufacturerMap, type CreateManufacturerMapOptions, type ManufacturerMapInstance } from "@/utils/mapUtils";
import { nextTick } from "vue";
const { t } = useI18n(); // 解构出t方法
// import { BerthStatusOptions, PireTypeOptions } from "@/contans/coal_add_base_data";

interface DrawerProps {
  title: string;
  rowData?: Partial<Area.ResArea>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  treeData?: Building.ResBuilding[];
}

const drawerVisible = ref(false);

const state: {
  mapLoaded: boolean; // 地图是否加载完成
  editType: string; // 编辑状态
  selectPolygonInfo: any; // 当前选择站点模型信息
  stationList: any[]; // 站点列表
  pointList: any[]; // 乘车点列表
} = reactive({
  mapLoaded: false, // 地图是否加载完成
  editType: "", // 编辑状态
  selectPolygonInfo: null, // 当前选择站点模型信息
  stationList: [], // 站点列表
  pointList: [] // 乘车点列表
});

const formInline = reactive({
  geoJson: null,
  type: "dock",
  title: "",
  areaName: "",
  id: "",
  mapFeatures: [],
  rowData: {
    id: {},
    geoJson: {},
    areaName: "",
    buildName: "",
    buildingId: ""
  },
  fun: () => {
    console.log("fun called");
  }
});
const formData = reactive({
  ...formInline,
  geoJson2: null as any | null,
  repairAreaId: "",
  repairArea: "",
  pierId: ""
} as any);
const formRef = ref();
const treeData = ref<Building.ResBuilding[]>([]);
// 表单校验规则
const rules = reactive({
  repairArea: [{ required: true, message: t("main.inputError", { msg: "生活区区域" }) }],
  areaName: [{ required: true, message: "请输入区域名称", trigger: "blur" }]
});

const submitForm = () => {
  formRef.value.validate(async valid => {
    if (valid) {
      return new Promise(async (resolve, reject) => {
        if (!formData.geoJson2) {
          ElMessage.error("请绘制区域。");
          return reject("区域未绘制");
        }
        let sanitizedData: any = {
          areaName: formData.areaName, // 区域名称
          geoJson: formData.geoJson2,
          buildingId: formData.repairAreaId
        };
        if (formInline.title !== "新增") {
          sanitizedData.id = formData.pierId;
        }
        try {
          const response: any = formInline.title === "新增" ? await addRegion(sanitizedData) : await editRegion(sanitizedData);
          if (response.code == 200) {
            ElMessage({
              message: `${formInline.title}区域成功！`,
              type: "success"
            });
            formInline.fun();
            drawerProps.value.getTableList!();
          } else {
            ElMessage({
              message: `${formInline.title}区域失败，失败原因${response.msg}`,
              type: "error"
            });
          }
        } catch (error) {
          console.log(error);
        }
        drawerVisible.value = false;
      });
    }
  });
};
const drawerProps = ref<DrawerProps>({
  title: ""
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  Object.assign(formInline, params);
  let buildingId = formInline.rowData.buildingId ? [formInline.rowData.buildingId] : [""];
  drawerVisible.value = true;
  Object.assign(formData, {
    ...formInline,
    pierId: formInline.rowData?.id ?? "",
    geoJson2: formInline.rowData?.geoJson,
    areaName: formInline.rowData?.areaName ?? ""
  });
  handleChange(buildingId);
  nextTick(async () => {
    formRef.value.clearValidate();

    await initMap().catch(err => {
      console.error(err);
    });
  });
};

const handleChange = value => {
  formData.repairAreaId = value[0];
  formData.repairArea = treeData.value?.find(item => item.id === value[0])?.title;
};

onBeforeMount(async () => {
  const { data } = await getAllBuildingTree();
  treeData.value = data;
});

let mapInstance: ManufacturerMapInstance | null = null; // 地图实例，不要放到响应式对象里影响性能
let wxbPolygonEdit = ref();
const initMap = async () => {
  const options: CreateManufacturerMapOptions = {
    el: "stationMap",
    mapId: "1902300333347049472"
  };
  mapInstance = await createManufacturerMap(options);
  const module = await import("@/utils/wxbPolygonEdit/js/index.js");
  const WxbPolygonEdit = module.WxbPolygonEdit;
  mapInstance.on("loaded", () => {
    const { center } = JSON.parse(drawerProps.value.rowData?.geoJson ?? "{}");
    let { lng, lat } = mapInstance.coordsToLngLat(center);
    mapInstance.vmap.setCenter([lng, lat]);
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

    // 设置为2D视图模式
    mapInstance.setViewMode("2D");
    // 添加视图控制插件
    new window.VgoMap.ViewModeControl({
      map: mapInstance,
      style: "inset: 20px auto auto 20px;"
    });

    // 初始化多边形编辑插件
    wxbPolygonEdit.value = new WxbPolygonEdit(mapInstance);
    // 加载区域数据
    loadAreaData();
    state.mapLoaded = true;
  });
};

// 定位到指定点位
const focusOnPoint = (lng: number, lat: number) => {
  if (!mapInstance) return;
  const amap = (mapInstance as any)?.amap;
  amap?.setZoomAndCenter?.(18, [lng, lat], false);
};

// 添加区域/站点
const addLocation = () => {
  if (!formData.areaName) {
    ElMessage.warning("请先输入站点名称");
    return;
  }

  changeStatus("polygonEdit");

  wxbPolygonEdit.value.polygonEdit.onDraw(polygonInfo => {
    console.log(polygonInfo, "绘制站点多边形数据~");
    const { points, center } = polygonInfo;

    // 去重首尾点
    const cleanedPoints = points.slice();
    if (cleanedPoints.length > 1) {
      const almostEqual = (a, b, eps = 1e-6) =>
        Math.abs(a.x - b.x) < eps && Math.abs(a.y - b.y) < eps && Math.abs(a.z - b.z) < eps;

      if (almostEqual(cleanedPoints[0], cleanedPoints[cleanedPoints.length - 1])) {
        cleanedPoints.pop();
      }
    }

    let createPolygonObj = {
      color: "#409EFF",
      points: cleanedPoints,
      height: 0,
      type: "polygonShow",
      center,
      floorId: "1",
      opacity: 0.4,
      name: formData.areaName
    };
    // 创建
    wxbPolygonEdit.value.polygonShow.createPolygon(createPolygonObj);
    formData.geoJson2 = JSON.stringify(polygonInfo);
    console.log(formData.geoJson2);
    changeStatus("");
  });
};

// 切换编辑状态
const changeStatus = (type: string) => {
  state.editType = type;
  wxbPolygonEdit.value.status.editType = type;
};

//  销毁全部编辑对象
const destroyAll = () => {
  console.log(wxbPolygonEdit.value);
  wxbPolygonEdit.value.polygonShow?.removeAll?.();
};

// 加载区域数据
const loadAreaData = async () => {
  destroyAll();
  try {
    const { points, center } = JSON.parse(drawerProps.value.rowData?.geoJson ?? "{}");
    let createPolygonObj = {
      color: "blue",
      points: points,
      height: 0,
      type: "polygonShow",
      center,
      floorId: "1",
      opacity: 0.8,
      name: formData.areaName
    };
    wxbPolygonEdit.value.polygonShow.createPolygon(createPolygonObj);
  } catch (error) {
    console.error("加载区域数据失败", error);
  }
};

const beforeClose = () => {
  mapInstance?.destory?.();
  mapInstance = null;
  drawerVisible.value = false;
  console.log("地图销毁");
};

onBeforeUnmount(() => {
  mapInstance?.destory?.();
  mapInstance = null;
  console.log("地图销毁");
});

defineExpose({
  acceptParams,
  focusOnPoint,
  addLocation
});
</script>
<style scoped>
.coal-area-pop {
  overflow: hidden;
}
.draw-area-btn {
  margin-top: 5px;
}
.draw-area-btn ::v-deep(.el-form-item__content) {
  justify-content: end;
}
.map-container {
  height: 700px;
}
</style>
