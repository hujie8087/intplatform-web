<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="80%" :title="`${formInline.title}区域`" top="2vh">
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
      </el-row>
    </el-form>
    <MapDrawer
      v-if="isMapReady"
      :geo-json="formInline.mapFeatures"
      :map-features="formInline.mapFeatures"
      :dock-data="dockDataWithGeoJson"
      :type="formInline.type"
      :action="formInline.title"
      :stored-pier-id="storedPierId"
      @update:geojson="handleGeoJsonUpdate"
    />
    <el-form-item class="draw-area-btn">
      <el-button @click="drawerVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm">确定</el-button>
    </el-form-item>
  </el-dialog>
</template>

<script setup lang="ts">
import { PopParams } from "@/api/interface/drawArea";
import { ref, reactive, computed, toRaw, nextTick, onBeforeMount } from "vue";
import { ElMessage } from "element-plus";
import MapDrawer from "./MapDrawer.vue";
import { addRegion, editRegion } from "@/api/modules/system/drawArea";
import { getAllBuildingTree } from "@/api/modules/productDisplay/building";
import { useI18n } from "vue-i18n";
const { t } = useI18n(); // 解构出t方法
// import { BerthStatusOptions, PireTypeOptions } from "@/contans/coal_add_base_data";
const drawerVisible = ref(false);
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
const treeData = ref([]);
// 表单校验规则
const rules = reactive({
  repairArea: [{ required: true, message: t("main.inputError", { msg: "生活区区域" }) }],
  areaName: [{ required: true, message: "请输入区域名称", trigger: "blur" }]
});

const dockDataWithGeoJson = computed(() => {
  return {
    ...formData,
    geoJson: formInline.type === "berth" ? formInline.mapFeatures : "",
    geoJson2: null // 提交接口Json
  };
});

const storedPierId = ref();
const isMapReady = ref(true);

const handleGeoJsonUpdate = (geoJson: GeoJSON.Feature | null) => {
  if (geoJson) {
    formData.geoJson2 = JSON.parse(JSON.stringify(toRaw(geoJson)));
  } else {
    formData.geoJson2 = null;
  }
};

const resetMap = () => {
  isMapReady.value = false;
  nextTick(() => {
    isMapReady.value = true;
  });
};

const submitForm = () => {
  formRef.value.validate(async valid => {
    if (valid) {
      return new Promise(async (resolve, reject) => {
        if (!formData.geoJson2) {
          ElMessage.error("请绘制区域。");
          return reject("区域未绘制");
        }
        debugger;
        let sanitizedData: any = {
          areaName: formData.areaName, // 区域名称
          geoJson: JSON.stringify(formData.geoJson2),
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

// 接收父组件传过来的参数
const acceptParams = (params: PopParams): void => {
  Object.assign(formInline, params);
  storedPierId.value = formInline.rowData.id;
  let buildingId = formInline.rowData.buildingId ? [formInline.rowData.buildingId] : [""];
  formInline.mapFeatures = handleAllData(formInline.treeData, formInline.rowData.id);
  drawerVisible.value = true;
  Object.assign(formData, {
    ...formInline,
    pierId: formInline.rowData?.id ?? "",
    geoJson2: formInline.rowData?.geoJson ? JSON.parse(formInline.rowData.geoJson) : null,
    areaName: formInline.rowData?.areaName ?? ""
  });
  handleChange(buildingId);
  resetMap();
};

const handleAllData = (data, id) => {
  const mapFeatures = data && data.length > 0 ? getMapFeatures(data) : [];
  function getMapFeatures(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }
    return data.map(feature => {
      let geoJson = JSON.parse(feature.geoJson);
      const geoJsonFeature = {
        ...geoJson,
        geoJson: feature.geoJson,
        pierName: feature.areaName,
        pierId: feature.id,
        berthHpId: feature.berthHpId,
        berthId: feature.id,
        properties: {
          ...geoJson?.properties,
          color: feature.id === id ? "blue" : "gray"
        }
      };
      if (Array.isArray(feature.children) && feature.children.length > 0) {
        geoJsonFeature.children = getMapFeatures(feature.children);
      }

      return geoJsonFeature;
    });
  }
  return mapFeatures;
};
const handleChange = value => {
  formData.repairAreaId = value[0];
  formData.repairArea = treeData.value?.find(item => item.id === value[0])?.title;
};

onBeforeMount(async () => {
  const { data } = await getAllBuildingTree();
  treeData.value = data;
});

defineExpose({
  acceptParams
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
</style>
