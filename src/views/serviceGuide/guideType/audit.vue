<template>
  <div class="main-box">
    <div class="table-box">
      <div class="card" style="padding-top: 0px; height: 100%">
        <el-form ref="ruleFormRef" v-if="formData?.id" :model="formData" label-width="120px" label-suffix=" :">
          <el-row :gutter="80">
            <el-col :span="12">
              <h3 style="position: sticky; top: 0px; background-color: #fff; z-index: 100; margin: 0; line-height: 60px">
                内容详情
              </h3>
              <el-row>
                <el-col :span="24">
                  <el-form-item label="指南名称" prop="title">
                    <el-input v-model="formData.title" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="指南说明" prop="content">
                    <WangEditor v-model:value="content" height="300px" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="指南图标" prop="repairPhoto">
                    <span class="material-icons">{{ iconValue }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="需要登录" prop="isLogin">
                    <el-switch
                      v-model="formData.isLogin"
                      :active-value="1"
                      :inactive-value="0"
                      active-color="#13ce66"
                      inactive-color="#ff4949"
                      disabled
                    >
                    </el-switch>
                  </el-form-item>
                </el-col>
                <!-- 附件 -->
                <el-col :span="24">
                  <el-form-item label="附件" prop="file"> </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="状态" prop="status">
                    <el-switch
                      v-model="formData.status"
                      active-value="0"
                      inactive-value="1"
                      active-color="#13ce66"
                      inactive-color="#ff4949"
                      disabled
                    >
                    </el-switch>
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
                <el-col :span="24" v-if="formData.approvalStatus > 3">
                  <el-form-item label="三级审核意见" prop="approvalThirdMessage">
                    <el-input type="textarea" v-model="formData.approvalThirdMessage" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="审核意见" prop="approvalMessage">
                    <el-input :rows="4" type="textarea" v-model="approvalMessage" />
                  </el-form-item>
                </el-col>
                <!-- 是否需要下一级审核 -->
                <el-col :span="24" v-if="formData.approvalStatus !== 3">
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
                  <el-button type="primary" @click="handleSubmit">审核通过</el-button>
                  <el-button type="danger" @click="handleReject">审核驳回</el-button>
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

<script setup lang="ts" name="GuideTypeAudit">
import { useI18n } from "vue-i18n";

const { t } = useI18n(); // 解构出t方法
import { useRoute } from "vue-router";
import { useTabsStore } from "@/stores/modules/tabs";
import { ref } from "vue";
import { DictOptions } from "@/api/interface";
import { useDict } from "@/hooks/useDict";
import { ElMessage, FormInstance } from "element-plus";
import WangEditor from "@/components/WangEditor/index.vue";
import { GuideType } from "@/api/interface/serviceGuide";
import { editGuideType, getGuideTypeById } from "@/api/modules/serviceGuide/guideType";
import { getDeptList } from "@/api/modules/system/dept";
import { Dept } from "@/api/interface/system";
const route = useRoute();
const tabStore = useTabsStore();

const guideTypeId = +route.params.id;
const iconValue = ref<string>("");
const guideTypeStatusOptions = ref<DictOptions[]>([]);
const guideTypeTypeOptions = ref<DictOptions[]>([]);
const isDeptAudit = ref(0);
useDict("sys_notice_status", "sys_notice_type").then(res => {
  guideTypeStatusOptions.value = res.sys_notice_status;
  guideTypeTypeOptions.value = res.sys_notice_type;
});
const nextApprovalFlag = ref(0);
const content = ref<string>("");
const getGuideTypeInfo = async () => {
  const res = await getGuideTypeById(guideTypeId);
  formData.value = res.data;
  content.value = res.data.content ?? "";
  iconValue.value = res.data.img ?? "";
};
getGuideTypeInfo();

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

const approvalMessage = ref<string>("");
const ruleFormRef = ref<FormInstance>();
const formData = ref<GuideType.ResGuideType>();
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
  try {
    await editGuideType({ ...formData.value!, nextApprovalFlag: nextApprovalFlag.value });
    ElMessage.success({
      message: t("main.successMsg", { title: "服务指南", method: "审核" })
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
    await editGuideType({ ...formData.value!, nextApprovalFlag: 1 });
    ElMessage.success({
      message: t("main.successMsg", { title: "服务指南", method: "审核" })
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
