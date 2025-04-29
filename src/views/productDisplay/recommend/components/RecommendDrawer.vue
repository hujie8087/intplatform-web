<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="1000" :title="`${drawerProps.title}推荐菜品`">
    <el-form
      ref="ruleFormRef"
      label-width="120px"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="form"
      :hide-required-asterisk="drawerProps.isView"
    >
      <el-row>
        <el-col :span="24">
          <el-form-item label="菜品名称" prop="foodName">
            <el-input v-model="form.foodName" :placeholder="`${$t('main.inputError', '菜品名称')}`" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="地点" prop="rdLocation">
            <el-select v-model="form.rdLocation" multiple :placeholder="`${$t('main.inputError', '地点')}`">
              <el-option
                v-for="item in drawerProps.canteenOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value + ''"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="推荐日期" prop="rdDate">
            <el-date-picker
              v-model="form.rdDate"
              type="date"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
              :placeholder="`${$t('main.inputError', '推荐日期')}`"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="推荐时间" prop="rdTime">
            <el-time-picker v-model="form.rdTime" range-separator="至" format="HH:mm:ss" value-format="HH:mm:ss" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="菜品图片" prop="photoUrl">
            <UploadImg v-model:image-url="form.photoUrl" :file-size="5" width="100px" height="100px">
              <template #tip> 上传图片最大为 5M </template>
            </UploadImg>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="推荐人" prop="recommendedBy">
            <el-input v-model="form.recommendedBy" :placeholder="`${$t('main.inputError', '推荐人')}`" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="推荐理由" prop="rdReason">
            <el-input
              type="textarea"
              :rows="4"
              v-model="form.rdReason"
              :placeholder="`${$t('main.inputError', '推荐理由')}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="状态" prop="status">
            <el-switch v-model="form.status" active-value="0" inactive-value="1" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" :placeholder="`${$t('main.inputError', '备注')}`" clearable></el-input>
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

<script setup lang="ts" name="RecommendDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { Recommend } from "@/api/interface/productDisplay/recommend";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import UploadImg from "@/components/Upload/Img.vue";
const { t } = useI18n(); // 解构出t方法

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<Recommend.ResRecommend>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  canteenOptions?: DictOptions[];
  statusOptions?: DictOptions[];
}

interface Form {
  foodName: string;
  rdLocation: string[];
  rdDate: string;
  rdTime: string;
  photoUrl: string;
  recommendedBy: string;
  rdReason: string;
  status: string;
  remark: string;
}

const form = ref<Form>({
  foodName: "",
  rdLocation: [],
  rdDate: "",
  rdTime: "",
  photoUrl: "",
  recommendedBy: "",
  rdReason: "",
  status: "0",
  remark: ""
});

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
  if (params.rowData.rdId) {
    form.value = {
      foodName: params.rowData?.foodName || "",
      rdLocation: params.rowData?.rdLocation?.split(",") || [],
      rdDate: params.rowData?.rdDate || "",
      rdTime: params.rowData?.rdTime || "",
      photoUrl: params.rowData?.photoUrl || "",
      recommendedBy: params.rowData?.recommendedBy || "",
      rdReason: params.rowData?.rdReason || "",
      status: params.rowData?.status || "",
      remark: params.rowData?.remark || ""
    };
  } else {
    resetForm();
  }
  drawerVisible.value = true;
};

const resetForm = () => {
  form.value = {
    foodName: "",
    rdLocation: [],
    rdDate: "",
    rdTime: "",
    photoUrl: "",
    recommendedBy: "",
    rdReason: "",
    status: "0",
    remark: ""
  };
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const rules = reactive({
  foodName: [{ required: true, message: t("main.inputError", { msg: "菜品名称" }) }],
  rdReason: [{ required: true, message: t("main.inputError", { msg: "推荐理由" }) }],
  rdLocation: [{ required: true, message: t("main.inputError", { msg: "地点" }) }],
  rdDate: [{ required: true, message: t("main.inputError", { msg: "推荐日期" }) }],
  photoUrl: [{ required: true, message: t("main.inputError", { msg: "菜品图片" }) }],
  status: [{ required: true, message: t("main.inputError", { msg: "状态" }) }],
  recommendedBy: [{ required: true, message: t("main.inputError", { msg: "推荐人" }) }]
});
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      const params = {
        foodName: form.value.foodName,
        rdLocation: form.value.rdLocation.join(","),
        rdDate: form.value.rdDate,
        rdTime: form.value.rdTime,
        photoUrl: form.value.photoUrl,
        recommendedBy: form.value.recommendedBy,
        rdReason: form.value.rdReason,
        status: form.value.status
      };
      await drawerProps.value.api!({ ...drawerProps.value.rowData, ...params });
      ElMessage.success({
        message: t("main.successMsg", { title: "推荐", method: `${drawerProps.value.title}` })
      });
      resetForm();
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
