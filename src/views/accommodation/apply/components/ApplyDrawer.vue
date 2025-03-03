<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}住宿流程`" width="1000px">
    <el-form
      ref="ruleFormRef"
      label-width="120px"
      label-suffix=" :"
      :disabled="drawerProps.isView"
      :rules="rules"
      :model="drawerProps.rowData"
    >
      <el-row>
        <el-col :span="24">
          <el-form-item label="标题" prop="title">
            <el-input v-model="drawerProps.rowData.title" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="流程类型" prop="type">
            <el-select v-model="drawerProps.rowData.type">
              <el-option v-for="item in drawerProps.applyTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="表单id" prop="formId">
            <el-input-number v-model="drawerProps.rowData.formId" :min="0" :max="999999" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="图标" prop="icon">
            <SelectMaterialIcon v-model:icon-value="iconValue" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="图片" prop="img">
            <UploadImg v-model:image-url="drawerProps.rowData.img" :file-size="5" width="100px" height="100px">
              <template #tip> 上传图片最大为 5M </template>
            </UploadImg>
          </el-form-item>
        </el-col>
        <!-- 是否登录 -->
        <el-col :span="24">
          <el-form-item label="是否登录" prop="isLogin">
            <el-switch v-model="drawerProps.rowData.isLogin" active-value="1" inactive-value="0" />
          </el-form-item>
        </el-col>
        <!-- 状态 -->
        <el-col :span="24">
          <el-form-item label="状态" prop="status">
            <el-switch v-model="drawerProps.rowData.status" active-value="0" inactive-value="1" />
          </el-form-item>
        </el-col>
        <!-- 排序 -->
        <el-col :span="24">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="drawerProps.rowData.sort" :min="0" :max="999999" />
          </el-form-item>
        </el-col>
        <!-- 备注 -->
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input type="textarea" :rows="4" v-model="drawerProps.rowData.remark" clearable />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" @click="handleSubmit">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="ApplyDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import UploadImg from "@/components/Upload/Img.vue";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import { Accommodation } from "@/api/interface/service/accommodation";
import SelectMaterialIcon from "@/components/SelectMaterialIcon/index.vue";
const { t } = useI18n(); // 解构出t方法
const rules = reactive({
  title: [{ required: true, message: t("main.inputError", { msg: "请填写标题" }) }],
  isLogin: [{ required: true, message: t("main.inputError", { msg: "请选择是否登录" }) }],
  status: [{ required: true, message: t("main.inputError", { msg: "请选择状态" }) }],
  sort: [{ required: true, message: t("main.inputError", { msg: "请填写排序" }) }]
});
const iconValue = ref("");
interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<Accommodation.ResApply>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  applyTypeOptions?: DictOptions[];
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: "",
  isView: false,
  rowData: {}
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
  iconValue.value = params.rowData.icon ?? "";
  console.log(params.applyTypeOptions);
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    const formData = {
      ...drawerProps.value.rowData,
      icon: iconValue.value
    };
    try {
      await drawerProps.value.api!(formData);
      ElMessage.success({
        message: t("main.successMsg", { title: "住宿申请流程", method: `${drawerProps.value.title}` })
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
