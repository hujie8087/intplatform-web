<template>
  <el-dialog
    v-model="drawerVisible"
    :destroy-on-close="true"
    :title="`${drawerProps.title}服务指南`"
    :disabled="drawerProps.isView"
    :model="drawerProps.rowData"
    :hide-required-asterisk="drawerProps.isView"
  >
    <el-form ref="ruleFormRef" label-width="120px" label-suffix=" :" :rules="rules" :model="drawerProps.rowData">
      <el-row>
        <el-col :span="24">
          <el-form-item label="服务指南类型" prop="typeId">
            <el-select v-model="drawerProps.rowData.typeId" placeholder="请选择" disabled>
              <el-option v-for="item in drawerProps.guideTypeOptions" :label="item.label" :value="item.value" :key="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="服务指南标题" prop="title">
            <el-input v-model="drawerProps.rowData.title" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="服务指南说明" prop="content">
            <WangEditor v-model:value="content" disabled height="300px" />
          </el-form-item>
        </el-col>
        <el-form-item label="服务指南图标" prop="img">
          <SelectMaterialIcon v-model:icon-value="iconValue" disabled />
        </el-form-item>
        <el-col :span="24">
          <el-form-item label="需要登录" prop="isLogin">
            <el-switch
              v-model="drawerProps.rowData.isLogin"
              :active-value="1"
              :inactive-value="0"
              active-color="#13ce66"
              inactive-color="#ff4949"
              disabled
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
              disabled
            >
            </el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="drawerProps.rowData.sort" :min="0" :max="9999" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="drawerProps.rowData.approvalStatus && drawerProps.rowData.approvalStatus > 0">
          <el-form-item label="一级审核意见" prop="approvalFirstMessage">
            <el-input type="textarea" v-model="drawerProps.rowData.approvalFirstMessage" />
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="drawerProps.rowData.approvalStatus && drawerProps.rowData.approvalStatus > 1">
          <el-form-item label="二级审核意见" prop="approvalSecondMessage">
            <el-input type="textarea" v-model="drawerProps.rowData.approvalSecondMessage" />
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="drawerProps.rowData.approvalStatus && drawerProps.rowData.approvalStatus > 2">
          <el-form-item label="三级审核意见" prop="approvalThirdMessage">
            <el-input type="textarea" v-model="drawerProps.rowData.approvalThirdMessage" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="审核意见" prop="auditOpinion">
            <el-input :rows="4" type="textarea" v-model="approvalMessage" />
          </el-form-item>
        </el-col>

        <el-col :span="24" style="padding-left: 120px; margin-bottom: 50px">
          <el-button type="primary" @click="handleSubmit">审核通过</el-button>
          <el-button type="danger" @click="handleReject">审核驳回</el-button>
          <el-button @click="drawerVisible = false">取消</el-button>
        </el-col>
      </el-row>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts" name="AuditDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance, UploadUserFile } from "element-plus";
import { Guide } from "@/api/interface/serviceGuide";
import { useI18n } from "vue-i18n";
import WangEditor from "@/components/WangEditor/index.vue";
import SelectMaterialIcon from "@/components/SelectMaterialIcon/index.vue";
import { DictOptions } from "@/api/interface";
const { t } = useI18n(); // 解构出t方法

const fileList = ref<UploadUserFile[]>([]);
const approvalMessage = ref("");
const content = ref("");
const rules = reactive({
  typeId: [{ required: true, message: t("main.selectError", { msg: "服务指南类型" }) }],
  title: [{ required: true, message: t("main.inputError", { msg: "服务指南标题" }) }],
  content: [{ required: true, message: t("main.inputError", { msg: "服务指南说明" }) }]
});
const iconValue = ref("");
interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<Guide.ResGuide>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  guideTypeOptions?: DictOptions[];
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
  fileList.value = [];
  content.value = params.rowData.content ?? "";
  iconValue.value = params.rowData.img || "";
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = async () => {
  if (drawerProps.value.rowData.approvalStatus === 0) {
    drawerProps.value.rowData.approvalStatus = 1;
    drawerProps.value.rowData.approvalFirstMessage = approvalMessage.value;
  } else if (drawerProps.value.rowData.approvalStatus === 1) {
    drawerProps.value.rowData.approvalStatus = 2;
    drawerProps.value.rowData.approvalSecondMessage = approvalMessage.value;
  } else if (drawerProps.value.rowData.approvalStatus === 2) {
    drawerProps.value.rowData.approvalStatus = 3;
    drawerProps.value.rowData.approvalThirdMessage = approvalMessage.value;
  }

  await drawerProps.value.api!(drawerProps.value.rowData);
  ElMessage.success({
    message: t("main.successMsg", { title: "服务指南", method: `${drawerProps.value.title}` })
  });
  approvalMessage.value = "";
  drawerProps.value.getTableList!();
  drawerVisible.value = false;
};
const handleReject = async () => {
  drawerProps.value.rowData.approvalStatus = -1;
  if (drawerProps.value.rowData.approvalStatus === 0) {
    drawerProps.value.rowData.approvalFirstMessage = approvalMessage.value;
  } else if (drawerProps.value.rowData.approvalStatus === 1) {
    drawerProps.value.rowData.approvalSecondMessage = approvalMessage.value;
  } else if (drawerProps.value.rowData.approvalStatus === 2) {
    drawerProps.value.rowData.approvalThirdMessage = approvalMessage.value;
  }
  await drawerProps.value.api!(drawerProps.value.rowData);
  ElMessage.success({
    message: t("main.successMsg", { title: "服务指南", method: `${drawerProps.value.title}` })
  });
  approvalMessage.value = "";
  drawerProps.value.getTableList!();
  drawerVisible.value = false;
};

defineExpose({
  acceptParams
});
</script>
