<template>
  <div class="main-box">
    <div class="table-box">
      <div class="card" style="height: 100%; padding-top: 0">
        <h3 style="position: sticky; top: 0; z-index: 100; margin: 0; line-height: 60px; background-color: #ffffff">编辑内容</h3>
        <el-form
          ref="ruleFormRef"
          v-if="formData?.noticeId"
          :model="formData"
          label-width="120px"
          label-suffix=" :"
          :rules="rules"
        >
          <el-row>
            <el-col :span="24">
              <el-form-item :label="`${$t('system.notice.noticeType')}`" prop="noticeType" style="width: 800px">
                <el-select
                  v-model="formData!.noticeType"
                  :placeholder="`${$t('main.selectError', { msg: $t('system.notice.noticeType') })}`"
                  disabled
                >
                  <el-option v-for="item in noticeTypeOptions" :key="item.label" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item :label="`${$t('system.notice.noticeTitle')}`" prop="noticeTitle" style="width: 800px">
                <el-input
                  v-model="formData!.noticeTitle"
                  :placeholder="`${$t('main.inputError', { msg: $t('system.notice.noticeTitle') })}`"
                  clearable
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item :label="`${$t('system.notice.noticeDept')}`" prop="createDept" style="width: 800px">
                <el-input
                  v-model="formData!.createDept"
                  :placeholder="`${$t('main.inputError', { msg: $t('system.notice.noticeDept') })}`"
                  clearable
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="图片" prop="img" style="width: 800px">
                <UploadImg v-model:image-url="formData!.img" :file-size="5" width="100px" height="100px">
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
                <el-input v-model="formData!.file" style="max-width: 600px" disabled>
                  <template #append>
                    <el-upload
                      v-model:file-list="fileList"
                      class="upload-demo"
                      :action="baseUrl + 'file/upload'"
                      :headers="{
                        Authorization: 'Bearer ' + userStore.token
                      }"
                      name="files"
                      :limit="1"
                      :show-file-list="false"
                      :on-success="handleSuccess"
                      style="display: inline-block; margin-right: 10px; vertical-align: middle"
                    >
                      <el-button type="primary" :loading="progress !== 0 && progress !== 100" :icon="CirclePlus"
                        >上传文件</el-button
                      >
                    </el-upload></template
                  >
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item :label="`${$t('system.notice.status')}`" prop="status" style="width: 800px">
                <el-radio-group
                  v-model="formData!.status"
                  :placeholder="`${$t('main.inputError', { msg: $t('system.notice.status') })}`"
                >
                  <el-radio v-for="item in noticeStatusOptions" :key="item.label" :label="item.value">{{ item.label }}</el-radio>
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

<script setup lang="ts" name="NewsDetailEdit">
import { useI18n } from "vue-i18n";

const { t } = useI18n(); // 解构出t方法
import { useRoute } from "vue-router";
import { useTabsStore } from "@/stores/modules/tabs";
import { reactive } from "vue";
import { ref } from "vue";
import { DictOptions } from "@/api/interface";
import { useDict } from "@/hooks/useDict";
import { editNotice, getNoticeById } from "@/api/modules/system/notice";
import { ElMessage, FormInstance, UploadUserFile } from "element-plus";
import WangEditor from "@/components/WangEditor/index.vue";
import { Notice } from "@/api/interface/system";
import UploadImg from "@/components/Upload/Img.vue";
import { useUserStore } from "@/stores/modules/user";
import { CirclePlus } from "@element-plus/icons-vue";
const route = useRoute();
const tabStore = useTabsStore();
const baseFileUrl = import.meta.env.VITE_APP_BASE_FILE;
const baseUrl = import.meta.env.VITE_API_URL;
const noticeId = +route.params.id;
const noticeStatusOptions = ref<DictOptions[]>([]);
const noticeTypeOptions = ref<DictOptions[]>([]);
useDict("sys_notice_status", "sys_notice_type").then(res => {
  noticeStatusOptions.value = res.sys_notice_status;
  noticeTypeOptions.value = res.sys_notice_type;
});
const userStore = useUserStore();
const fileList = ref<UploadUserFile[]>([]);
const videoFileList = ref<UploadUserFile[]>([]);
const progress = ref(0);
const noticeContent = ref<string>("");
const getNoticeInfo = async () => {
  const res = await getNoticeById(noticeId);
  formData.value = res.data;
  noticeContent.value = res.data.noticeContent;
  if (res.data.video) {
    videoFileList.value = [{ url: res.data.video, name: res.data.noticeTitle }];
  }
  // if (res.data.file) {
  //   fileList.value = [{ url: res.data.file, name: res.data.noticeTitle }];
  // }
};
getNoticeInfo();

const rules = reactive({
  noticeTitle: [{ required: true, message: "请输入标题", trigger: "blur" }],
  createDept: [{ required: true, message: "请输入部门", trigger: "blur" }]
});
const ruleFormRef = ref<FormInstance>();
const formData = ref<Notice.ResNotice>();

// 提交数据（新增/编辑）
const handleSubmit = async () => {
  formData.value!.noticeContent = removeParentPStyleForImages(noticeContent.value);

  if (formData.value!.approvalStatus === -1) {
    formData.value!.approvalStatus = 0;
  }
  ruleFormRef.value?.validate(async valid => {
    if (!valid) return;
    try {
      await editNotice({ ...formData.value!, nextApprovalFlag: 0 });
      ElMessage.success({
        message: t("main.successMsg", { title: "内容", method: "编辑" })
      });
      // 关闭当前页
      handleCancel();
    } catch (error) {
      console.log(error);
    }
  });
};
const handleSuccess = (response: any) => {
  console.log(response.data);
  formData.value!.file = response.data[0].url;
};
const handleCancel = () => {
  // 关闭当前页
  if (route.meta.isAffix) return;
  tabStore.removeTabs(route.fullPath);
};
const handleDeleteVideo = () => {
  formData.value!.video = "";
  videoFileList.value = [];
};
const handleVideoSuccess = (response: any) => {
  console.log(response.data);
  formData.value!.video = response.data.url;
};
const removeParentPStyleForImages = (html: string) => {
  // 用 DOMParser 将字符串转为 DOM 结构
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // 找所有 img
  const imgs = doc.querySelectorAll("img");

  imgs.forEach(img => {
    const parent = img.parentElement;
    img.removeAttribute("style");
    // 如果父节点是 p，且有 style 属性，则删除 style
    if (parent && parent.tagName.toLowerCase() === "p") {
      parent.removeAttribute("style");
      const style = parent.getAttribute("style");
      if (style) {
        // 删除 text-indent: xxx; 支持各种单位与空格写法
        const newStyle = style
          .replace(/text-indent\s*:\s*[^;]+;?/gi, "") // 删除属性
          .trim();

        if (newStyle) {
          parent.setAttribute("style", newStyle); // 保留其他 style
        } else {
          parent.removeAttribute("style"); // 如果空了就直接删掉
        }
      }
    }
  });

  // 返回更新后的 HTML
  return doc.body.innerHTML;
};
</script>
