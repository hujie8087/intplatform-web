<template>
  <div class="main-box">
    <div class="table-box">
      <div class="card" style="padding-top: 0px; height: 100%">
        <h3 style="position: sticky; top: 0px; background-color: #fff; z-index: 100; margin: 0; line-height: 60px">新增内容</h3>
        <el-form ref="ruleFormRef" :model="formData" label-width="120px" label-suffix=" :" :rules="rules">
          <el-row>
            <el-col :span="24">
              <el-form-item :label="`${$t('system.notice.noticeType')}`" prop="noticeType" style="width: 800px">
                <el-select
                  v-model="formData.noticeType"
                  :placeholder="`${$t('main.selectError', { msg: $t('system.notice.noticeType') })}`"
                  disabled
                >
                  <el-option v-for="item in noticeTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item :label="`${$t('system.notice.noticeTitle')}`" prop="noticeTitle" style="width: 800px">
                <el-input
                  v-model="formData.noticeTitle"
                  :placeholder="`${$t('main.inputError', { msg: $t('system.notice.noticeTitle') })}`"
                  clearable
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item :label="`${$t('system.notice.noticeDept')}`" prop="createDept" style="width: 800px">
                <el-input
                  v-model="formData.createDept"
                  :placeholder="`${$t('main.inputError', { msg: $t('system.notice.noticeDept') })}`"
                  clearable
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="图片" prop="img" style="width: 800px">
                <UploadImg v-model:image-url="formData.img" :file-size="5" width="100px" height="100px">
                  <template #tip> 上传图片最大为 5M </template>
                </UploadImg>
              </el-form-item>
            </el-col>
            <!-- 上传视频 -->
            <el-col :span="24">
              <el-form-item label="视频" prop="video" style="width: 800px">
                <el-upload
                  v-if="videoFileList.length === 0"
                  v-model:file-list="videoFileList"
                  class="upload-demo"
                  :action="baseUrl + 'file/uploadVideo'"
                  :headers="{
                    Authorization: 'Bearer ' + userStore.token
                  }"
                  accept=".mp4,.avi,.mov,.wmv,.flv,.mkv"
                  :limit="1"
                  :show-file-list="false"
                  :on-success="handleVideoSuccess"
                  style="display: inline-block; margin-right: 10px; vertical-align: middle"
                >
                  <el-button type="primary" :loading="progress !== 0 && progress !== 100" :icon="CirclePlus">上传视频</el-button>
                </el-upload>
                <div v-else>
                  <video
                    :src="baseFileUrl + formData.video"
                    controls
                    style="width: 100%; height: 100%; object-fit: cover"
                  ></video>
                  <el-button type="danger" @click="handleDeleteVideo">删除视频</el-button>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="附件" prop="file" style="width: 800px">
                <el-upload
                  v-model:file-list="fileList"
                  class="upload-demo"
                  :action="baseUrl + 'file/uploadVideo'"
                  :headers="{
                    Authorization: 'Bearer ' + userStore.token
                  }"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  :limit="1"
                  :on-success="handleSuccess"
                  style="display: inline-block; margin-right: 10px; vertical-align: middle"
                >
                  <el-button type="primary" :loading="progress !== 0 && progress !== 100" :icon="CirclePlus">上传文件</el-button>
                </el-upload>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item :label="`${$t('system.notice.status')}`" prop="status" style="width: 800px">
                <el-radio-group
                  v-model="formData!.status"
                  :placeholder="`${$t('main.inputError', { msg: $t('system.notice.status') })}`"
                >
                  <el-radio v-for="item in noticeStatusOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item :label="`${$t('system.notice.noticeContent')}`" prop="noticeContent" style="width: 1200px">
                <WangEditor v-model:value="noticeContent" />
              </el-form-item>
            </el-col>
            <el-col :span="24" style="margin-left: 120px">
              <el-button type="primary" @click="handleSubmit">提交</el-button>
              <el-button type="danger" @click="handleCancel">关闭</el-button>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="NewsDetailAdd">
import { useI18n } from "vue-i18n";

const { t } = useI18n(); // 解构出t方法
import { useRoute } from "vue-router";
import { useTabsStore } from "@/stores/modules/tabs";
import { reactive } from "vue";
import { ref } from "vue";
import { DictOptions } from "@/api/interface";
import { useDict } from "@/hooks/useDict";
import { addNotice } from "@/api/modules/system/notice";
import { ElMessage, FormInstance, UploadUserFile } from "element-plus";
import WangEditor from "@/components/WangEditor/index.vue";
import { Notice } from "@/api/interface/system";
import UploadImg from "@/components/Upload/Img.vue";
import { useUserStore } from "@/stores/modules/user";
import { CirclePlus } from "@element-plus/icons-vue";
const route = useRoute();
const tabStore = useTabsStore();

const baseUrl = import.meta.env.VITE_API_URL;
const baseFileUrl = import.meta.env.VITE_APP_BASE_FILE;
const type = route.query.type;

const noticeStatusOptions = ref<DictOptions[]>([]);
const noticeTypeOptions = ref<DictOptions[]>([]);
const videoFileList = ref<UploadUserFile[]>([]);
useDict("sys_notice_status", "sys_notice_type").then(res => {
  noticeStatusOptions.value = res.sys_notice_status;
  noticeTypeOptions.value = res.sys_notice_type;
});
const userStore = useUserStore();
const fileList = ref<UploadUserFile[]>([]);
const progress = ref(0);
const noticeContent = ref<string>("");

const rules = reactive({
  noticeTitle: [{ required: true, message: "请输入标题", trigger: "blur" }],
  createDept: [{ required: true, message: "请输入部门", trigger: "blur" }]
});
const ruleFormRef = ref<FormInstance>();
const formData = reactive<Notice.ReqCreateNoticeParams>({
  noticeTitle: "",
  noticeContent: "",
  noticeType: type?.toString() ?? "1",
  createDept: "",
  status: "0",
  img: "",
  file: "",
  video: ""
});

// 提交数据（新增/编辑）
const handleSubmit = async () => {
  formData.noticeContent = noticeContent.value;
  ruleFormRef.value?.validate(async valid => {
    if (!valid) return;

    try {
      await addNotice({ ...formData, noticeContent: noticeContent.value });
      ElMessage.success({
        message: t("main.successMsg", { title: "公告", method: "新增" })
      });
      // 关闭当前页
      handleCancel();
    } catch (error) {
      console.log(error);
    }
  });
};
const handleSuccess = (response: any) => {
  formData.file = response.data.url;
};
const handleVideoSuccess = (response: any) => {
  formData.video = response.data.url;
};
const handleDeleteVideo = () => {
  formData.video = "";
  videoFileList.value = [];
};
const handleCancel = () => {
  // 关闭当前页
  if (route.meta.isAffix) return;
  tabStore.removeTabs(route.fullPath);
};
</script>
