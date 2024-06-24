<template>
  <el-dialog
    v-model="drawerVisible"
    :destroy-on-close="true"
    width="1080"
    :title="`${drawerProps.title}${$t('transportation.busRoutes.name')}`"
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
          <el-form-item :label="`${$t('transportation.busRoutes.lineName')}`" prop="lineName">
            <el-input
              v-model="drawerProps.rowData.lineName"
              :placeholder="`${$t('main.inputError', { msg: $t('transportation.busRoutes.lineName') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('transportation.busRoutes.lineTime')}`" prop="lineTime">
            <el-input
              v-model="drawerProps.rowData.lineTime"
              :placeholder="`${$t('main.inputError', { msg: $t('transportation.busRoutes.lineTime') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('transportation.busRoutes.linePath')}`" prop="linePath">
            <UploadImg v-model:image-url="drawerProps.rowData.linePath" :file-size="3">
              <template #tip> 上传图片最大为 3M </template>
            </UploadImg>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('transportation.busRoutes.allPath')}`" prop="allPath">
            <UploadImg v-model:image-url="drawerProps.rowData.allPath" :file-size="3">
              <template #tip> 上传图片最大为 3M </template>
            </UploadImg>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('transportation.busRoutes.lineDetails')}`" prop="lineDetails">
            <WangEditor v-model:value="drawerProps.rowData!.lineDetails!" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('transportation.busRoutes.remark')}`" prop="remark">
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

<script setup lang="ts" name="BusRoutesDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { BusRoutes } from "@/api/interface/transportation";
import { useI18n } from "vue-i18n";
import UploadImg from "@/components/Upload/Img.vue";
import WangEditor from "@/components/WangEditor/index.vue";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  lineName: [{ required: true, message: t("main.inputError", { msg: t("transportation.busRoutes.lineName") }) }],
  linePath: [{ required: true, message: t("main.inputError", { msg: t("transportation.busRoutes.linePath") }) }],
  lineTime: [{ required: true, message: t("main.inputError", { msg: t("transportation.busRoutes.lineTime") }) }],
  lineDetails: [{ required: true, message: t("main.inputError", { msg: t("transportation.busRoutes.lineDetails") }) }],
  allPath: [{ required: true, message: t("main.inputError", { msg: t("transportation.busRoutes.allPath") }) }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<BusRoutes.ResBusRoutes>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
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
        message: t("main.successMsg", { title: t("transportation.busRoutes.name"), method: `${drawerProps.value.title}` })
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
