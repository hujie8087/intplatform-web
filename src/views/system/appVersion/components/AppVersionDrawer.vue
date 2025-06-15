<template>
  <el-dialog
    v-model="drawerVisible"
    :destroy-on-close="true"
    width="680"
    :title="`${drawerProps.title}${$t('system.post.post')}`"
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
          <el-form-item :label="`${$t('system.app.system')}`" prop="system">
            <el-select v-model="drawerProps.rowData!.system" placeholder="请选择APP系统">
              <el-option v-for="item in drawerProps.systemOptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('system.app.version')}`" prop="versionCode">
            <el-input-number
              controls-position="right"
              :min="1"
              :step="1"
              v-model="drawerProps.rowData!.versionCode"
              :placeholder="`${$t('main.inputError', { msg: $t('system.app.version') })}`"
              clearable
              style="width: 50%"
            >
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('system.app.name')}`" prop="versionName">
            <el-input
              v-model="drawerProps.rowData!.versionName"
              :placeholder="`${$t('main.inputError', { msg: $t('system.app.name') })}`"
              clearable
            >
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('system.app.updateType')}`" prop="updateType">
            <el-select v-model="drawerProps.rowData!.updateType" placeholder="请选择APP更新方式">
              <el-option
                v-for="item in drawerProps.updateTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('system.app.path')}`" prop="apkUrl">
            <el-input v-model="drawerProps.rowData!.apkUrl" placeholder="请上传APP文件" disabled class="input-with-select">
              <template #append>
                <el-upload
                  v-model:file-list="fileList"
                  class="upload-demo"
                  :action="baseUrl + '/file/uploadAPK'"
                  :headers="{
                    Authorization: 'Bearer ' + userStore.token
                  }"
                  name="files"
                  :limit="1"
                  :show-file-list="false"
                  :on-change="handleChange"
                  :on-success="handleSuccess"
                  :on-progress="handleProgress"
                >
                  <el-button v-if="!progress || progress === 100" :icon="Upload" />
                  <el-progress v-else type="circle" :percentage="progress" :width="20" :stroke-width="2" />
                </el-upload>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('system.app.content')}`" prop="updateLog">
            <el-input
              type="textarea"
              :rows="6"
              v-model="drawerProps.rowData!.updateLog"
              :placeholder="`${$t('main.inputError', { msg: $t('system.app.content') })}`"
              clearable
            >
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('main.remark')}`" prop="remark">
            <el-input
              v-model="drawerProps.rowData!.remark"
              type="textarea"
              :placeholder="`${$t('main.inputError', { msg: $t('main.remark') })}`"
            >
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="AI1" prop="def1">
            <el-input v-model="drawerProps.rowData!.def1" :placeholder="`${$t('main.inputError', { msg: $t('main.remark') })}`">
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="AI2" prop="def2">
            <el-input v-model="drawerProps.rowData!.def2" :placeholder="`${$t('main.inputError', { msg: $t('main.remark') })}`">
            </el-input>
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

<script setup lang="ts" name="AppVersionDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance, UploadFile, UploadUserFile } from "element-plus";
import { useI18n } from "vue-i18n";
import { AppVersion } from "@/api/interface/system";
import { DictOptions } from "@/api/interface";
import { Upload } from "@element-plus/icons-vue";
import { useUserStore } from "@/stores/modules/user";
import SparkMD5 from "spark-md5";

const { t } = useI18n(); // 解构出t方法
const progress = ref(0);
const baseUrl = import.meta.env.VITE_API_URL;
const userStore = useUserStore();
const fileList = ref<UploadUserFile[]>([]);

const handleProgress = event => {
  progress.value = Math.round((event.loaded / event.total) * 100);
};
const rules = reactive({
  name: [{ required: true, message: t("main.inputError", { msg: t("system.app.name") }) }],
  version: [{ required: true, message: t("main.inputError", { msg: t("system.app.version") }) }],
  updateType: [{ required: true, message: t("main.selectError", { msg: t("system.app.updateType") }) }],
  content: [{ required: true, message: t("main.inputError", { msg: t("system.app.content") }) }],
  system: [{ required: true, message: t("main.selectError", { msg: t("system.app.system") }) }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData?: Partial<AppVersion.ResAppVersion>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  updateTypeOptions?: DictOptions[];
  systemOptions?: DictOptions[];
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: ""
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
        message: t("main.successMsg", { title: t("system.app.app"), method: `${drawerProps.value.title}` })
      });
      drawerProps.value.getTableList!();
      drawerVisible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};

const handleSuccess = (response: any, uploadFile: UploadFile) => {
  drawerProps.value.rowData!.apkUrl = response.data[0].url;
  drawerProps.value.rowData!.apkSize = uploadFile?.size ? Math.floor(uploadFile?.size / 1000) : 0;
};

const handleChange = (uploadFile: UploadFile) => {
  const md5 = SparkMD5.ArrayBuffer.hash(uploadFile.raw);
  drawerProps.value.rowData!.apkMd5 = md5;
};

defineExpose({
  acceptParams
});
</script>
