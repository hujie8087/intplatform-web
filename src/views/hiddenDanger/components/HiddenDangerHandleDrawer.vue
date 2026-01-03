<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}隐患`">
    <el-form ref="ruleFormRef" label-width="120px" label-suffix=" :" :rules="rules" :model="drawerProps.rowData">
      <el-row>
        <el-col :span="12">
          <el-form-item label="隐患名称" prop="name">
            <!-- 选择报修房间 -->
            <el-input v-model="drawerProps.rowData.name" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="隐患地点" prop="location">
            <!-- 选择报修区域 -->
            <el-input v-model="drawerProps.rowData.location" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发现时间" prop="findTime">
            <!-- 选择报修人 -->
            <el-input v-model="drawerProps.rowData.findTime" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发现人" prop="reportPerson">
            <el-input v-model="drawerProps.rowData!.reportPerson" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" prop="tel">
            <el-input v-model="drawerProps.rowData!.tel" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="隐患描述" prop="describes">
            <el-input v-model="drawerProps.rowData!.describes" type="textarea" :rows="3" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="隐患照片" prop="url">
            <div v-if="drawerProps.rowData.url">
              <el-image
                v-for="url in drawerProps.rowData.url?.split(',')"
                style="width: 100px; height: 100px; margin-right: 10px"
                :key="url"
                :src="`${fileUrl}${url}`"
                :preview-src-list="drawerProps.rowData.url?.split(',').map(item => `${fileUrl}${item}`)"
              />
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="处理人" prop="handleBy">
            <el-input v-model="drawerProps.rowData!.handleBy" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="处理时间" prop="handleTime">
            <el-date-picker
              v-model="drawerProps.rowData.handleTime"
              type="datetime"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="请选择处理时间"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="处理进度" prop="progress">
            <el-radio-group v-model="drawerProps.rowData!.progress">
              <el-radio-button v-for="item in drawerProps.hiddenDangerStatusOptions" :key="item.label" :label="item.value">{{
                item.label
              }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <!-- 上传处理完照片 -->
        <el-col :span="24">
          <el-form-item label="处理完照片" prop="handlePhoto">
            <UploadImgs v-model:file-list="fileList" width="100px" height="100px">
              <template #tip> 上传图片最大为 5M </template>
            </UploadImgs>
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="处理结果" prop="handleResult">
            <el-input
              v-model="drawerProps.rowData!.handleResult"
              type="textarea"
              :rows="3"
              :placeholder="`${$t('main.inputError', { msg: '请填写维修类型' })}`"
              clearable
            />
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

<script setup lang="ts" name="HiddenDangerHandleDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance, UploadUserFile } from "element-plus";
import { useI18n } from "vue-i18n";
import { DictOptions, Login } from "@/api/interface";
import { HiddenDanger } from "@/api/interface/hiddenDanger";
import UploadImgs from "@/components/Upload/Imgs.vue";
import { useUserStore } from "@/stores/modules/user";

const userStore = useUserStore();
const userInfo = ref<Login.ResThirdUserInfo>(userStore.thirdUserInfo);
const { t } = useI18n(); // 解构出t方法

const fileUrl = import.meta.env.VITE_APP_BASE_FILE;

const rules = reactive({
  handleBy: [{ required: true, message: t("main.selectError", { msg: "处理人" }) }],
  handleTime: [{ required: true, message: t("main.selectError", { msg: "处理时间" }) }],
  progress: [{ required: true, message: t("main.selectError", { msg: "处理进度" }) }],
  handleResult: [{ required: true, message: t("main.inputError", { msg: "处理结果" }) }]
});

interface DrawerProps {
  title: string;
  rowData: Partial<HiddenDanger.ResHiddenDanger>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  hiddenDangerStatusOptions?: DictOptions[];
}

const fileList = ref<UploadUserFile[]>([]);

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
  drawerProps.value.rowData.handleBy = userInfo.value.name ?? "";
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    console.log(fileList.value);
    if (fileList.value.length !== 0) {
      drawerProps.value.rowData!.handlePhoto = fileList.value.map(item => item.url).join(",");
    }
    const formData = { ...drawerProps.value.rowData, isRead: 1 };
    try {
      await drawerProps.value.api!(formData);
      ElMessage.success({
        message: t("main.successMsg", { title: "隐患", method: `${drawerProps.value.title}` })
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
