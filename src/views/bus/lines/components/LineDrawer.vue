<template>
  <el-dialog v-model="drawerVisible" width="1350" destroy-on-close :title="`${drawerProps.title}公交站台`">
    <el-form
      ref="ruleFormRef"
      label-width="120px"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="drawerProps.rowData"
      :hide-required-asterisk="drawerProps.isView"
    >
      <el-row :gutter="10">
        <el-col :span="12">
          <el-form-item label="线路名称" prop="lineName">
            <el-input
              v-model="drawerProps.rowData!.lineName"
              :placeholder="`${$t('main.inputError', { msg: '名称' })}`"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
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
        </el-col>
        <el-col :span="12">
          <el-form-item label="线路详情" prop="lineDetails">
            <el-input
              type="textarea"
              :rows="5"
              v-model="drawerProps.rowData!.lineDetails"
              :placeholder="`${$t('main.inputError', { msg: '备注' })}`"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="运行图片" prop="path">
            <UploadImg
              v-model:image-url="drawerProps.rowData!.linePath"
              :file-size="5"
              width="100px"
              height="100px"
              :api="uploadFlora"
              file-label="file"
            >
              <template #tip> 上传图片最大为 5M </template>
            </UploadImg>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="线路类型" prop="lineType">
            <el-radio-group v-model="drawerProps.rowData!.lineType">
              <el-radio v-for="item in drawerProps.lineTypeOptions" :key="item.value" :label="item.value">{{
                item.label
              }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="线路排序" prop="sort">
            <el-input-number v-model="drawerProps.rowData!.sort" :min="0" :max="10000" :step="1" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="备注" prop="remark">
            <el-input
              type="textarea"
              :rows="5"
              v-model="drawerProps.rowData!.remark"
              :placeholder="`${$t('main.inputError', { msg: '备注' })}`"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <!-- 时刻表 -->
          <el-form-item label="时刻表" prop="cdtId">
            <div style="padding: 10px; border: 1px solid #dcdfe6; border-radius: 5px">
              <div style="margin-bottom: 5px">
                已选时刻表:<span style="margin-left: 10px; font-weight: bold; color: #409eff">{{
                  drawerProps.rowData!.cdtId?.length
                }}</span>
              </div>
              <el-checkbox-group v-model="drawerProps.rowData!.cdtId">
                <el-checkbox
                  v-for="item in drawerProps.departureTime"
                  :key="item.id"
                  :label="item.departureTime?.split(':').slice(0, 2).join(':')"
                  :value="item.id"
                />
              </el-checkbox-group>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <!-- 站点 -->
          <el-form-item label="站点" prop="sId">
            <div class="station-selector">
              <div class="station-header">
                <el-select
                  v-model="selectedStation"
                  filterable
                  placeholder="请选择站点"
                  class="station-select"
                  multiple
                  @change="handleStationSelect"
                >
                  <el-option v-for="item in stationOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </div>
              <el-card class="station-list" v-if="selectedStations.length">
                <div class="station-list-header">
                  <span>已选站点</span>
                  <span>（可拖拽调整顺序）</span>
                </div>
                <el-empty v-if="selectedStations.length === 0" description="暂无选择站点"></el-empty>
                <draggable v-model="selectedStations" item-key="value" handle=".drag-handle" @end="updateStationIds">
                  <template #item="{ element, index }">
                    <div class="station-item">
                      <el-icon class="drag-handle"><Rank /></el-icon>
                      <span>{{ index + 1 }}. {{ element.label }}</span>
                      <el-button type="danger" text @click="removeStation(index)">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </template>
                </draggable>
              </el-card>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" v-show="!drawerProps.isView" @click="handleSubmit">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="BusStationDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import { BusDeparture, BusLine, BusStation } from "@/api/interface/bus";
import draggable from "vuedraggable";
import { Delete, Rank } from "@element-plus/icons-vue";
import UploadImg from "@/components/Upload/Img.vue";
import { uploadFlora } from "@/api/modules/upload";
import { DictOptions } from "@/api/interface";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  lineName: [{ required: true, message: t("main.inputError", { msg: "名称" }) }],
  status: [{ required: true, message: t("main.inputError", { msg: "状态" }) }],
  sId: [{ required: true, message: t("main.inputError", { msg: "站点" }), trigger: "change" }],
  cdtId: [{ required: true, message: t("main.inputError", { msg: "时刻表" }), trigger: "change" }]
});
interface DrawerProps {
  title: string;
  isView: boolean;
  rowData?: Partial<BusLine.ResBusLine>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  station?: BusStation.ResBusStation[];
  departureTime?: BusDeparture.ResBusDeparture[];
  lineTypeOptions?: DictOptions[];
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  rowData: {} as BusLine.ResBusLine
});

// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
  stationOptions.value = params.station?.map(item => ({ value: item.id, label: item.name || "" })) || [];
  selectedStations.value = params.rowData?.carSiteList?.map(item => ({ value: item.id, label: item.name || "" })) || [];
  selectedStation.value = selectedStations.value.map(item => item.value) as number[];
  if (drawerProps.value.rowData) {
    drawerProps.value.rowData.sId = selectedStations.value.map(item => item.value) as number[];
  }
  if (params.rowData && params.rowData.carDepartureTimeList) {
    drawerProps.value.rowData!.cdtId = params.rowData.carDepartureTimeList?.map(item => item.id) || [];
  }
};

// 站点选择相关数据
interface StationOption {
  value: number;
  label: string;
}

// 模拟站点数据，实际应该从API获取
const stationOptions = ref<StationOption[]>([]);

const selectedStation = ref<number[]>([]);
const selectedStations = ref<StationOption[]>([]);

// 添加站点
const handleStationSelect = (value: number[]) => {
  selectedStations.value = [...stationOptions.value.filter(item => value.includes(item.value))];
  updateStationIds();
};

// 移除站点
const removeStation = (index: number) => {
  selectedStations.value.splice(index, 1);
  updateStationIds();
};

// 更新站点ID到表单数据
const updateStationIds = () => {
  if (!drawerProps.value.rowData) return;
  drawerProps.value.rowData.sId = selectedStations.value.map(item => item.value) as number[];
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await drawerProps.value.api!({
        ...drawerProps.value.rowData
      });
      ElMessage.success({
        message: t("main.successMsg", { title: "公交线路", method: `${drawerProps.value.title}` })
      });
      drawerProps.value.getTableList!();
      drawerVisible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};
defineExpose({
  acceptParams
});
</script>

<style scoped lang="scss">
.station-selector {
  width: 100%;
}
.station-header {
  display: flex;
  margin-bottom: 5px;
}
.station-select {
  flex: 1;
  margin-right: 5px;
}
.station-list {
  margin-top: 5px;
}
.station-list-header {
  margin-bottom: 5px;
  font-size: 14px;
  color: #606266;
}
.station-item {
  display: flex;
  align-items: center;
  padding: 2px;
  border-bottom: 1px solid #ebeef5;
}
.station-item:last-child {
  border-bottom: none;
}
.drag-handle {
  margin-right: 8px;
  color: #909399;
  cursor: move;
}
.station-item span {
  flex: 1;
}
.el-checkbox-group {
  height: 200px;
  overflow-y: auto;
  :deep(.el-checkbox) {
    margin-right: 10px;
  }
}
</style>
