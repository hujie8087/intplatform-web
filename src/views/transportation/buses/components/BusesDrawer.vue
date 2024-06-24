<template>
  <el-dialog
    v-model="drawerVisible"
    :destroy-on-close="true"
    width="1080"
    :title="`${drawerProps.title}${$t('transportation.buses.name')}`"
  >
    <el-form
      ref="ruleFormRef"
      label-width="120px"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="drawerProps.rowData"
      :hide-required-asterisk="drawerProps.isView"
    >
      <el-row>
        <el-col :span="24">
          <el-form-item :label="`${$t('transportation.buses.parkNo')}`" prop="parkNo">
            <el-input
              v-model="drawerProps.rowData.parkNo"
              :placeholder="`${$t('main.inputError', { msg: $t('transportation.buses.parkNo') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('transportation.buses.carType')}`" prop="carType">
            <el-select
              v-model="drawerProps.rowData.carType"
              :placeholder="`${$t('main.selectError', { msg: $t('transportation.buses.carType') })}`"
            >
              <el-option
                v-for="item in drawerProps.carModelList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('transportation.buses.lineNo')}`" prop="lineNo" v-if="drawerProps.rowData.carType === '0'">
            <el-input
              v-model="drawerProps.rowData.lineNo"
              :placeholder="`${$t('main.inputError', { msg: $t('transportation.buses.lineNo') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('transportation.buses.loadNumber')}`" prop="loadNumber">
            <el-input-number
              v-model="drawerProps.rowData.loadNumber"
              :min="1"
              :placeholder="`${$t('main.inputError', { msg: $t('transportation.buses.loadNumber') })}`"
              clearable
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('transportation.buses.path')}`" prop="path">
            <UploadImg v-model:image-url="drawerProps.rowData.path" :file-size="3">
              <template #tip> 上传图片最大为 3M </template>
            </UploadImg>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('transportation.buses.carState')}`" prop="carState">
            <el-radio-group
              v-model="drawerProps.rowData!.carState"
              :placeholder="`${$t('main.inputError', { msg: $t('system.notice.status') })}`"
            >
              <el-radio v-for="item in drawerProps.carRunStatus" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('transportation.buses.remark')}`" prop="remark">
            <el-input type="textarea" v-model="drawerProps.rowData.remark" placeholder=""></el-input>
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

<script setup lang="ts" name="BusesDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { Buses } from "@/api/interface/transportation";
import { useI18n } from "vue-i18n";
import UploadImg from "@/components/Upload/Img.vue";
import { DictOptions } from "@/api/interface";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  parkNo: [{ required: true, message: t("main.inputError", { msg: t("transportation.buses.parkNo") }) }],
  lineNo: [{ required: true, message: t("main.inputError", { msg: t("transportation.buses.lineNo") }) }],
  loadNumber: [{ required: true, message: t("main.inputError", { msg: t("transportation.buses.loadNumber") }) }],
  carType: [{ required: true, message: t("main.inputError", { msg: t("transportation.buses.carType") }) }],
  path: [{ required: true, message: t("main.inputError", { msg: t("transportation.buses.path") }) }],
  carState: [{ required: true, message: t("main.inputError", { msg: t("transportation.buses.carState") }) }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<Buses.ResBuses>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  carRunStatus?: DictOptions[];
  carModelList?: DictOptions[];
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  rowData: {}
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await drawerProps.value.api!(drawerProps.value.rowData);
      ElMessage.success({
        message: t("main.successMsg", { title: t("transportation.buses.name"), method: `${drawerProps.value.title}` })
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
