<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}服务指南`">
    <el-form
      ref="ruleFormRef"
      label-width="120px"
      label-suffix=" :"
      :rules="rules"
      :model="drawerProps.rowData"
      :disabled="drawerProps.isView"
    >
      <el-row>
        <el-col :span="24">
          <el-form-item label="指南名称" prop="title">
            <el-input v-model="drawerProps.rowData.title" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="指南说明" prop="content">
            <WangEditor v-model:value="content" height="300px" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="指南图标" prop="iconValue">
            <SelectMaterialIcon v-model:icon-value="iconValue" />
          </el-form-item>
        </el-col>
        <!-- 附件 -->
        <el-col :span="24">
          <el-form-item label="附件" prop="file" style="width: 800px">
            <el-upload
              v-model:file-list="fileList"
              class="upload-demo"
              :action="baseUrl + 'file/upload'"
              :headers="{
                Authorization: 'Bearer ' + userStore.token
              }"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              :limit="10"
              multiple
              name="files"
              :on-success="handleSuccess"
              style="display: inline-block; margin-right: 10px; vertical-align: middle"
            >
              <el-button type="primary" :loading="progress !== 0 && progress !== 100" :icon="CirclePlus">上传文件</el-button>
            </el-upload>
            <div v-if="drawerProps.rowData.file">
              <span style="margin-right: 10px" v-for="(item, index) in drawerProps.rowData.file.split(',')" :key="index">
                <!-- 带删除按钮 -->
                <el-link :href="baseUrl + item" target="_blank">
                  {{ item.split("/").pop() }}
                </el-link>
                <el-button
                  type="text"
                  style="color: red; padding: 0 2px"
                  size="small"
                  :icon="Close"
                  @click="handleDelete(index)"
                />
              </span>
            </div>
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
        <el-col :span="24">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="drawerProps.rowData.sort" :min="0" :max="9999" />
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="drawerProps.rowData.approvalStatus && drawerProps.rowData.approvalStatus > 0">
          <el-form-item label="一级审核意见" prop="approvalFirstMessage">
            <el-input type="textarea" v-model="drawerProps.rowData.approvalFirstMessage" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="drawerProps.rowData.approvalStatus && drawerProps.rowData.approvalStatus > 1">
          <el-form-item label="二级审核意见" prop="approvalSecondMessage">
            <el-input type="textarea" v-model="drawerProps.rowData.approvalSecondMessage" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="drawerProps.rowData.approvalStatus && drawerProps.rowData.approvalStatus > 2">
          <el-form-item label="三级审核意见" prop="approvalThirdMessage">
            <el-input type="textarea" v-model="drawerProps.rowData.approvalThirdMessage" disabled />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" @click="handleSubmit" v-if="!drawerProps.isView">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="GuideTypeDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance, UploadUserFile } from "element-plus";
import { GuideType } from "@/api/interface/serviceGuide";
import { useI18n } from "vue-i18n";
import WangEditor from "@/components/WangEditor/index.vue";
import SelectMaterialIcon from "@/components/SelectMaterialIcon/index.vue";
import { useUserStore } from "@/stores/modules/user";
import { CirclePlus, Close } from "@element-plus/icons-vue";
const { t } = useI18n(); // 解构出t方法
const baseUrl = import.meta.env.VITE_API_URL;
const userStore = useUserStore();
const fileList = ref<UploadUserFile[]>([]);
const content = ref("");
const rules = reactive({
  title: [{ required: true, message: t("main.inputError", { msg: "类型名称" }) }]
});
const iconValue = ref("");
const progress = ref(0);
interface DrawerProps {
  title: string;
  isView: boolean;
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
const handleSubmit = () => {
  drawerProps.value.rowData.content = content.value;
  drawerProps.value.rowData.img = iconValue.value;
  if (drawerProps.value.rowData.approvalStatus === -1) {
    drawerProps.value.rowData.approvalStatus = 0;
  }
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await drawerProps.value.api!({ ...drawerProps.value.rowData, nextApprovalFlag: 0 });
      ElMessage.success({
        message: t("main.successMsg", { title: "服务指南", method: `${drawerProps.value.title}` })
      });
      drawerProps.value.getTableList!();
      drawerVisible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};

const handleSuccess = async (response: any, _, uploadFileList) => {
  console.log(uploadFileList);
  let fileString = uploadFileList.map(item => item.response.data[0].url).join(",");
  console.log(fileString);
  if (drawerProps.value.rowData.file) {
    drawerProps.value.rowData.file = drawerProps.value.rowData.file + "," + fileString;
  } else {
    drawerProps.value.rowData.file = fileString;
  }

  fileList.value = [];
};

const handleDelete = (index: number) => {
  drawerProps.value.rowData.file = drawerProps.value
    .rowData!.file!.split(",")
    .filter((item, i) => i !== index)
    .join(",");
};

defineExpose({
  acceptParams
});
</script>
