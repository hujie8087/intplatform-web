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
                      v-if="formData!.img"
                      :src="baseFileUrl + formData!.img"
                      style="height: 100px"
                      :preview-src-list="[baseFileUrl + formData!.img]"
                    />
                    <div v-else>暂无图片</div>
                  </el-form-item>
                </el-col>
                <!-- 上传视频 -->
                <el-col :span="24">
                  <el-form-item label="视频" prop="video" style="width: 800px">
                    <div v-if="formData.video">
                      <video
                        :src="baseFileUrl + formData.video"
                        controls
                        style="width: 100%; height: 100%; object-fit: cover"
                      ></video>
                    </div>
                    <div v-else>暂无视频</div>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="附件" prop="file">
                    <div v-if="formData.file">
                      <el-link type="primary" :href="baseUrl + formData.file" target="_blank">{{ formData.noticeTitle }}</el-link>
                    </div>
                    <div v-else>暂无附件</div>
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
            <el-col :span="12">
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
                <el-col :span="24" v-if="formData.approvalStatus > 2 && formData.approvalDeptId">
                  <el-form-item :label="`${deptName}审核意见`" prop="approvalDeptMessage">
                    <el-input type="textarea" v-model="formData.approvalDeptMessage" disabled />
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
                <!-- 是否需要下一级审核 -->
                <el-col :span="24" v-if="formData.approvalStatus !== 2">
                  <el-form-item label="是否下一级审核" prop="isNextAudit">
                    <el-switch v-model="nextApprovalFlag" :active-value="0" :inactive-value="1" />
                  </el-form-item>
                </el-col>
                <el-col :span="24" v-if="formData.approvalStatus == 1">
                  <el-form-item label="是否其他部门审核" prop="approvalDeptId">
                    <el-switch v-model="isDeptAudit" :active-value="1" :inactive-value="0" />
                    <el-select
                      v-model="formData.approvalDeptId"
                      placeholder="请选择"
                      filterable
                      v-if="isDeptAudit === 1"
                      style="margin-left: 10px; display: inline-block; width: 200px"
                    >
                      <el-option v-for="item in deptList" :key="item.deptId" :label="item.deptName" :value="item.deptId" />
                    </el-select>
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
import { Dept, Notice } from "@/api/interface/system";
import { getDeptList } from "@/api/modules/system/dept";
const route = useRoute();
const tabStore = useTabsStore();

const baseUrl = import.meta.env.VITE_APP_BASE_URL;
const baseFileUrl = import.meta.env.VITE_APP_BASE_FILE;
const noticeId = +route.params.id;
const isAudit = route.query.isAudit === "true";
const noticeStatusOptions = ref<DictOptions[]>([]);
const noticeTypeOptions = ref<DictOptions[]>([]);
const isDeptAudit = ref(0);
useDict("sys_notice_status", "sys_notice_type").then(res => {
  noticeStatusOptions.value = res.sys_notice_status;
  noticeTypeOptions.value = res.sys_notice_type;
});
const deptList = ref<Dept.ResDept[]>([]);
const deptName = ref<string>("");
// 获取部门列表
const getDeptDataList = async () => {
  const res = await getDeptList({ pageNum: 1, pageSize: 10000 });
  deptList.value = res.data;
  if (formData.value?.approvalDeptId) {
    deptName.value = deptList.value.find(item => item.deptId === formData.value?.approvalDeptId)?.deptName ?? "";
  }
};
getDeptDataList();
const nextApprovalFlag = ref(0);
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
  // 一级审核
  if (formData.value!.approvalStatus === 0) {
    formData.value!.approvalStatus = 1;
    formData.value!.approvalFirstMessage = approvalMessage.value;
  }
  // 二级审核，可以选择是否其他部门审核
  else if (formData.value!.approvalStatus === 1) {
    if (isDeptAudit.value === 1 && formData.value?.approvalDeptId) {
      formData.value!.approvalStatus = 2;
    } else {
      formData.value!.approvalStatus = 3;
    }
    formData.value!.approvalSecondMessage = approvalMessage.value;
  }
  // 其他部门审核
  else if (formData.value!.approvalStatus === 2) {
    formData.value!.approvalStatus = 3;
    formData.value!.approvalDeptMessage = approvalMessage.value;
  }
  // 三级审核
  else if (formData.value!.approvalStatus === 3) {
    formData.value!.approvalStatus = 4;
    formData.value!.approvalThirdMessage = approvalMessage.value;
  }
  if (nextApprovalFlag.value === 1) {
    formData.value!.approvalStatus = 4;
  }
  if (nextApprovalFlag.value === 1) {
    formData.value!.approvalStatus = 3;
  }
  try {
    await editNotice({ ...formData.value!, nextApprovalFlag: nextApprovalFlag.value });
    ElMessage.success({
      message: t("main.successMsg", { title: "内容", method: "审核" })
    });
    // 关闭当前页
    handleCancel();
  } catch (error) {
    console.log(error);
  }
};
// 驳回
const handleReject = async () => {
  formData.value!.approvalStatus = -1;
  formData.value!.approvalMessage = approvalMessage.value;
  try {
    await editNotice({ ...formData.value!, nextApprovalFlag: 1 });
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
