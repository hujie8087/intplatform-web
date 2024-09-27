<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}指南类型`">
    <el-form ref="ruleFormRef" label-width="120px" label-suffix=" :" :rules="rules" :model="drawerProps.rowData">
      <el-row>
        <el-col :span="24">
          <el-form-item label="类型名称" prop="title">
            <!-- 选择报修人 -->
            <el-select v-model="drawerProps.rowData.title" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="类型说明" prop="content">
            <WangEditor v-model:value="content" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="类型图标" prop="repairPhoto">
            <SelectMaterialIcon v-model:icon-value="iconValue" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="需要登录" prop="isLogin">
            <el-switch
              v-model="drawerProps.rowData.isLogin"
              :active-value="1"
              :inactive-value="0"
              active-color="#13ce66"
              inactive-color="#ff4949"
            >
            </el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="状态" prop="status">
            <el-switch
              v-model="drawerProps.rowData.status"
              active-value="0"
              inactive-value="1"
              active-color="#13ce66"
              inactive-color="#ff4949"
            >
            </el-switch>
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

<script setup lang="ts" name="RepairHandleDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance, UploadUserFile } from "element-plus";
import { GuideType } from "@/api/interface/serviceGuide";
import { useI18n } from "vue-i18n";
import WangEditor from "@/components/WangEditor/index.vue";
import SelectMaterialIcon from "@/components/SelectMaterialIcon/index.vue";
const { t } = useI18n(); // 解构出t方法

const fileList = ref<UploadUserFile[]>([]);
const content = ref("");
const rules = reactive({
  title: [{ required: true, message: t("main.inputError", { msg: "类型名称" }) }],
  content: [{ required: true, message: t("main.selectError", { msg: "类型内容" }) }]
});
const iconValue = ref("");
interface DrawerProps {
  title: string;
  rowData: Partial<GuideType.ResGuideType>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  treeData?: {
    [key: string]: any;
  }[];
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: "",
  rowData: {}
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
  fileList.value = [];
  content.value = params.rowData.content ?? "";
  iconValue.value = params.rowData.img || "";
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  drawerProps.value.rowData.content = content.value;
  drawerProps.value.rowData.img = iconValue.value;
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await drawerProps.value.api!(drawerProps.value.rowData);
      ElMessage.success({
        message: t("main.successMsg", { title: "报修单", method: `${drawerProps.value.title}` })
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
