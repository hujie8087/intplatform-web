<template>
  <div class="location-collection-container">
    <div class="location-card">
      <h1 class="page-title">{{ t("locationCollection.title") }}</h1>

      <el-form ref="formRef" :model="locationList" :rules="rules" label-width="100px" class="location-form">
        <el-form-item :label="t('locationCollection.station')" prop="station">
          <el-select v-model="locationList.station" :placeholder="t('locationCollection.station')" filterable class="full-width">
            <el-option v-for="item in stationList" :key="item.fsIds" :label="item.fsAddress" :value="item.fsIds"></el-option>
          </el-select>
        </el-form-item>

        <div class="coordinates-container">
          <el-form-item :label="t('locationCollection.longitude')" prop="longitude">
            <el-input v-model="locationList.longitude" :placeholder="t('locationCollection.longitude')">
              <template #prefix>
                <el-icon><Location /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item :label="t('locationCollection.latitude')" prop="latitude">
            <el-input v-model="locationList.latitude" :placeholder="t('locationCollection.latitude')">
              <template #prefix>
                <el-icon><Location /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </div>

        <div class="location-map" v-if="locationList.longitude && locationList.latitude">
          <div class="map-placeholder">
            <el-icon :size="36"><MapLocation /></el-icon>
            <span>{{ t("locationCollection.mapPreview") }} ({{ locationList.longitude }}, {{ locationList.latitude }})</span>
          </div>
        </div>

        <div class="action-buttons">
          <el-button type="primary" @click="getLocation" :loading="isLoading" :icon="Aim">
            {{ t("locationCollection.getLocation") }}
          </el-button>
          <el-button type="success" @click="uploadLocation" :icon="Upload"> {{ t("locationCollection.upload") }} </el-button>
        </div>
      </el-form>
      <div class="language-container">
        <Language />
      </div>
      <div class="location-list">
        <el-table :data="stationList" style="width: 100%" height="400" border>
          <el-table-column :label="t('locationCollection.station')" prop="fsAddress" align="center" width="100%" />
          <el-table-column
            :label="t('locationCollection.longitude')"
            prop="longitude"
            align="center"
            class-name="wrap-text"
            width="100%"
          />
          <el-table-column
            :label="t('locationCollection.latitude')"
            prop="latitude"
            align="center"
            class-name="wrap-text"
            width="100%"
          />
          <el-table-column :label="t('locationCollection.status')" prop="status" align="center" sortable width="100%">
            <template #default="scope">
              <el-tag :type="scope.row.status ? 'success' : 'danger'">{{
                scope.row.status ? t("locationCollection.uploaded") : t("locationCollection.notUploaded")
              }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElForm, ElMessage } from "element-plus";
import { ref } from "vue";
import { Location, MapLocation, Aim, Upload } from "@element-plus/icons-vue";
import { editLocationCollection, getStationListApi } from "@/api/modules/delivery/locationCollection";
import { useI18n } from "vue-i18n";
import Language from "@/layouts/components/Header/components/Language.vue";
import { LocationCollection } from "@/api/interface/delivery/locationCollection";
const { t } = useI18n();

const isLoading = ref(false);

const locationList = ref({
  longitude: "",
  latitude: "",
  station: ""
});

const stationList = ref<LocationCollection.ResLocationCollection[]>([]);

const formRef = ref<InstanceType<typeof ElForm>>();
const rules = ref({
  station: [{ required: true, message: t("locationCollection.station") }],
  longitude: [{ required: true, message: t("locationCollection.longitude") }],
  latitude: [{ required: true, message: t("locationCollection.latitude") }]
});

// 获取站点列表
const getStationList = async () => {
  const res = await getStationListApi();
  stationList.value = res.data.map(item => ({
    ...item,
    status: item.latitude ? 1 : 0
  }));
};
getStationList();

const getLocation = () => {
  isLoading.value = true;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        locationList.value.longitude = position.coords.longitude.toString();
        locationList.value.latitude = position.coords.latitude.toString();
        ElMessage.success(t("locationCollection.getLocationSuccess"));
        isLoading.value = false;
      },
      error => {
        console.error(error);
        ElMessage.error(t("locationCollection.getLocationError"));
        isLoading.value = false;
      }
    );
  } else {
    ElMessage.error(t("locationCollection.getLocationErrorMsg"));
    isLoading.value = false;
  }
};

const uploadLocation = async () => {
  formRef.value?.validate(async valid => {
    if (valid) {
      // 这里添加上传逻辑
      const res = await editLocationCollection({
        fsIds: locationList.value.station,
        latitude: locationList.value.latitude,
        longitude: locationList.value.longitude
      });
      if (+res.code === 200) {
        ElMessage.success(t("locationCollection.uploadSuccess"));
        console.log(locationList.value);
        getStationList();
      } else {
        ElMessage.error(t("locationCollection.uploadError"));
      }
    }
  });
};
</script>

<style lang="scss" scoped>
.location-collection-container {
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  min-height: 100%;
  padding: 10px;
  background-color: #f5f7fa;
  .location-card {
    position: relative;
    width: 100%;
    max-width: 100%;
    padding: 14px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
    .language-container {
      position: absolute;
      top: 20px;
      right: 20px;
    }
    .wrap-text .cell {
      word-break: break-word;
      white-space: normal !important;
    }
  }
  .page-title {
    margin-bottom: 30px;
    font-size: 24px;
    color: #303133;
    text-align: center;
  }
  .location-form {
    .full-width {
      width: 100%;
    }
    .coordinates-container {
      display: flex;
      :deep(.el-form-item) {
        flex: 1;
        margin-bottom: 10px;
      }
    }
    .location-map {
      height: 150px;
      margin: 20px 0;
      border: 1px dashed #dcdfe6;
      border-radius: 4px;
      .map-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #909399;
        span {
          margin-top: 8px;
        }
      }
    }
    .action-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-top: 20px;
    }
  }
  .location-list {
    margin-top: 20px;
  }
}

@media (width <= 768px) {
  .location-collection-container {
    .coordinates-container {
      flex-direction: column;
      gap: 0;
    }
  }
}
</style>
