<template>
  <el-dialog v-model="drawerVisible" width="680" destroy-on-close :title="`${drawerProps.title}公交车`">
    <el-form
      ref="ruleFormRef"
      label-width="120px"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="drawerProps.rowData"
      :hide-required-asterisk="drawerProps.isView"
    >
      <el-form-item label="车牌号" prop="parkNo">
        <el-input v-model="drawerProps.rowData!.parkNo" :placeholder="`${$t('main.inputError', { msg: '车牌号' })}`"></el-input>
      </el-form-item>
      <el-form-item label="车辆类型" prop="carType">
        <el-input
          v-model="drawerProps.rowData!.carType"
          :placeholder="`${$t('main.inputError', { msg: '车辆类型' })}`"
        ></el-input>
      </el-form-item>
      <el-form-item label="载客量" prop="loadNumber">
        <el-input-number
          v-model="drawerProps.rowData!.loadNumber"
          :placeholder="`${$t('main.inputError', { msg: '载客量' })}`"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="图片" prop="path">
        <UploadImg
          v-model:image-url="drawerProps.rowData!.path"
          :file-size="5"
          width="100px"
          height="100px"
          :api="uploadFlora"
          file-label="file"
        >
          <template #tip> 上传图片最大为 5M </template>
        </UploadImg>
      </el-form-item>
      <el-form-item label="状态" prop="carState">
        <el-switch
          v-model="drawerProps.rowData!.carState"
          inline-prompt
          active-value="0"
          inactive-value="1"
          :active-text="`${$t('dict.enable')}`"
          :inactive-text="`${$t('dict.disable')}`"
        />
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
</template>

<script setup lang="ts" name="BusCarDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import { BusCar, BusDeparture } from "@/api/interface/bus";
import { DictOptions } from "@/api/interface";
import { uploadFlora } from "@/api/modules/upload";
const { t } = useI18n(); // 解构出t方法
import UploadImg from "@/components/Upload/Img.vue";
import { getBusDepartureList } from "@/api/modules/service/other";

const rules = reactive({
  parkNo: [{ required: true, message: t("main.inputError", { msg: "车牌号" }) }]
});
interface DrawerProps {
  title: string;
  isView: boolean;
  rowData?: BusCar.ResBusCar;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  languageOptions?: DictOptions[];
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  rowData: {} as BusCar.ResBusCar
});

// 获取总时刻表
const busDepartureList = ref<BusDeparture.ResBusDeparture[]>([]);
const getBusDeparture = () => {
  getBusDepartureList({ pageNum: 1, pageSize: 1000 }).then(res => {
    console.log(res);
    busDepartureList.value = res.rows;
  });
};
getBusDeparture();

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
      await drawerProps.value.api!({
        ...drawerProps.value.rowData,
        type: "0"
      });
      ElMessage.success({
        message: t("main.successMsg", { title: "车辆", method: `${drawerProps.value.title}` })
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
