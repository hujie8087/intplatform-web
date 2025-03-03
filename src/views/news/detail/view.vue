<template>
  <div class="main-box">
    <div class="table-box">
      <div class="card" style="padding-top: 0px; height: 100%">
        <el-form ref="ruleFormRef" v-if="formData?.noticeId" :model="formData" label-width="120px" label-suffix=" :">
          <el-row :gutter="80">
            <el-col :span="12">
              <h3 style="position: sticky; top: 0px; background-color: #fff; z-index: 100; margin: 0; line-height: 60px">
                内容详情
              </h3>
              <el-row>
                <el-col :span="24">
                  <el-form-item :label="`${$t('system.notice.noticeType')}`" prop="noticeType">
                    <el-select
                      v-model="formData!.noticeType"
                      :placeholder="`${$t('main.selectError', { msg: $t('system.notice.noticeType') })}`"
                      disabled
                    >
                      <el-option v-for="item in noticeTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item :label="`${$t('system.notice.noticeTitle')}`" prop="noticeTitle">
                    <el-input
                      v-model="formData!.noticeTitle"
                      :placeholder="`${$t('main.inputError', { msg: $t('system.notice.noticeTitle') })}`"
                      disabled
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item :label="`${$t('system.notice.noticeDept')}`" prop="createDept">
                    <el-input
                      v-model="formData!.createDept"
                      :placeholder="`${$t('main.inputError', { msg: $t('system.notice.noticeDept') })}`"
                      disabled
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="图片" prop="img">
                    <el-image
                      :src="baseUrl + formData!.img"
                      style="height: 150px; width: auto; min-width: 150px"
                      :preview-src-list="[baseUrl + formData!.img]"
                    >
                      <template #error>
                        <div class="image-slot">
                          <el-icon><Picture /></el-icon>
                          <div style="color: #909399; font-size: 14px">暂无图片</div>
                        </div>
                      </template>
                    </el-image>
                  </el-form-item>
                </el-col>
                <!-- 上传视频 -->
                <el-col :span="24">
                  <el-form-item label="视频" prop="video" style="width: 500px">
                    <div v-if="formData.video">
                      <video
                        :src="baseUrl + formData.video"
                        controls
                        style="width: 100%; height: 100%; object-fit: cover"
                      ></video>
                    </div>
                    <div v-else>暂无视频</div>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="附件" prop="file">
                    <div v-if="formData!.file">
                      <el-link type="primary" :href="baseUrl + formData!.file" target="_blank">{{
                        formData!.noticeTitle
                      }}</el-link>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item :label="`${$t('system.notice.status')}`" prop="status">
                    <el-radio-group
                      v-model="formData!.status"
                      :placeholder="`${$t('main.inputError', { msg: $t('system.notice.status') })}`"
                      disabled
                    >
                      <el-radio v-for="item in noticeStatusOptions" :key="item.value" :label="item.value">{{
                        item.label
                      }}</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item :label="`${$t('system.notice.noticeContent')}`" prop="noticeContent">
                    <WangEditor v-model:value="noticeContent" disabled />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-col>
            <el-col :span="12" v-if="formData.approvalStatus !== 0">
              <el-row style="position: sticky; top: 0; z-index: 1000">
                <h3>审核意见</h3>
                <el-col :span="24" v-if="formData.approvalStatus === -1">
                  <el-form-item label="驳回原因" prop="approvalMessage">
                    <span style="color: #ff4949">{{ formData.approvalMessage }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="24" v-if="formData.approvalStatus > 0">
                  <el-form-item label="一级审核意见" prop="approvalFirstMessage">
                    <el-input type="textarea" v-model="formData.approvalFirstMessage" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="24" v-if="formData.approvalStatus > 1">
                  <el-form-item label="二级审核意见" prop="approvalSecondMessage">
                    <el-input type="textarea" v-model="formData.approvalSecondMessage" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="24" v-if="formData.approvalStatus > 2">
                  <el-form-item label="三级审核意见" prop="approvalThirdMessage">
                    <el-input type="textarea" v-model="formData.approvalThirdMessage" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="24" v-if="isAudit">
                  <el-form-item label="审核意见" prop="auditOpinion">
                    <el-input :rows="4" type="textarea" v-model="approvalMessage" />
                  </el-form-item>
                </el-col>
                <el-col :span="24" style="margin-left: 120px">
                  <el-button type="primary" @click="handleSubmit" v-if="isAudit">审核通过</el-button>
                  <el-button type="danger" @click="handleReject" v-if="isAudit">审核驳回</el-button>
                  <el-button @click="handleCancel">关闭</el-button>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="NewsDetailAudit">
import { useI18n } from "vue-i18n";

const { t } = useI18n(); // 解构出t方法
import { useRoute } from "vue-router";
import { useTabsStore } from "@/stores/modules/tabs";
import { ref } from "vue";
import { DictOptions } from "@/api/interface";
import { useDict } from "@/hooks/useDict";
import { editNotice, getNoticeById } from "@/api/modules/system/notice";
import { ElMessage, FormInstance } from "element-plus";
import WangEditor from "@/components/WangEditor/index.vue";
import { Notice } from "@/api/interface/system";
const route = useRoute();
const tabStore = useTabsStore();

const baseUrl = import.meta.env.VITE_APP_BASE_FILE;
// const baseFileUrl = import.meta.env.VITE_APP_BASE_FILE_URL;

const noticeId = +route.params.id;
const isAudit = route.query.isAudit === "true";
const noticeStatusOptions = ref<DictOptions[]>([]);
const noticeTypeOptions = ref<DictOptions[]>([]);
useDict("sys_notice_status", "sys_notice_type").then(res => {
  noticeStatusOptions.value = res.sys_notice_status;
  noticeTypeOptions.value = res.sys_notice_type;
});
const noticeContent = ref<string>("");
const getNoticeInfo = async () => {
  const res = await getNoticeById(noticeId);
  formData.value = res.data;
  noticeContent.value = res.data.noticeContent;
};
getNoticeInfo();
const approvalMessage = ref<string>("");
const ruleFormRef = ref<FormInstance>();
const formData = ref<Notice.ResNotice>();

// 提交数据（新增/编辑）
const handleSubmit = async () => {
  if (formData.value!.approvalStatus === 0) {
    formData.value!.approvalStatus = 1;
    formData.value!.approvalFirstMessage = approvalMessage.value;
  } else if (formData.value!.approvalStatus === 1) {
    formData.value!.approvalStatus = 2;
    formData.value!.approvalSecondMessage = approvalMessage.value;
  } else if (formData.value!.approvalStatus === 2) {
    formData.value!.approvalStatus = 3;
    formData.value!.approvalThirdMessage = approvalMessage.value;
  }
  try {
    await editNotice(formData.value!);
    ElMessage.success({
      message: t("main.successMsg", { title: "内容", method: "审核" })
    });
    // 关闭当前页
    handleCancel();
  } catch (error) {
    console.log(error);
  }
};
const handleReject = async () => {
  formData.value!.approvalStatus = -1;
  formData.value!.approvalMessage = approvalMessage.value;
  try {
    await editNotice(formData.value!);
    ElMessage.success({
      message: t("main.successMsg", { title: "内容", method: "审核" })
    });
    approvalMessage.value = "";
    handleCancel();
  } catch (error) {
    console.log(error);
  }
  approvalMessage.value = "";
  handleCancel();
};
const handleCancel = () => {
  // 关闭当前页
  if (route.meta.isAffix) return;
  tabStore.removeTabs(route.fullPath);
};
</script>
<style scoped>
.block {
  padding: 30px 0;
  text-align: center;
  border-right: solid 1px var(--el-border-color);
  display: inline-block;
  width: 49%;
  box-sizing: border-box;
  vertical-align: top;
}
.demonstration {
  display: block;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin-bottom: 20px;
}
.el-image {
  padding: 0 5px;
  max-width: 300px;
  max-height: 200px;
  width: 100%;
  height: 200px;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 30px;
}
.image-slot .el-icon {
  font-size: 30px;
}
</style>
