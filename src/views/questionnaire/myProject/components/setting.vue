<template>
  <div class="setting-page">
    <div class="content-card">
      <div class="survey-container">
        <!-- 卡片头部：统一使用 Element Plus 组件样式 -->
        <div class="card-header">
          <h3 class="header-title">问卷属性设置</h3>
          <p class="header-desc">配置问卷答卷时的收集规则</p>
        </div>
        <!-- 表单：补充校验、优化布局结构 -->
        <el-form ref="settingFormRef" :model="form" label-width="120px" class="setting-form">
          <!-- 提交设置区域 -->
          <el-divider border-style="dashed" content-position="left">
            <h4>提交设置</h4>
          </el-divider>
          <div class="submit-setting-layout">
            <!-- 左侧表单组 -->
            <div class="submit-setting-left">
              <!-- 显示提示文字 -->
              <el-form-item class="checkbox-input-group">
                <el-checkbox v-model="setting.showPromptText" label="显示提示文字">
                  <el-text>显示提示文字</el-text>
                  <el-input
                    v-model="form.submitPromptText"
                    placeholder="请填写提交成功反馈文字"
                    :disabled="!setting.showPromptText"
                    class="inline-input"
                    maxlength="100"
                    show-word-limit
                  />
                </el-checkbox>
              </el-form-item>

              <!-- 跳转网页地址 -->
              <el-form-item class="checkbox-input-group">
                <el-checkbox v-model="setting.showSubmitJumpUrl" label="跳转网页地址">
                  <el-text>跳转网页地址</el-text>
                  <el-input
                    v-model="form.submitJumpUrl"
                    placeholder="请输入提交后跳转的网页地址"
                    :disabled="!setting.showSubmitJumpUrl"
                    class="inline-input"
                    maxlength="255"
                    show-word-limit
                    :rules="[{ type: 'url', message: '请输入合法的URL', trigger: 'blur' }]"
                  />
                </el-checkbox>
              </el-form-item>

              <!-- 校验工号姓名 -->
              <el-form-item class="checkbox-input-group">
                <el-checkbox v-model="form.isValidEmployeeNo" label="校验工号姓名">
                  <el-text>校验工号姓名</el-text>
                  <el-input
                    v-model="form.validEmployeeNoPromptText"
                    placeholder="请输入工号姓名验证失败提示"
                    :disabled="!form.isValidEmployeeNo"
                    class="inline-input"
                    maxlength="100"
                    show-word-limit
                  />
                </el-checkbox>
              </el-form-item>
            </div>

            <!-- 右侧表单组 -->
            <div class="submit-setting-right">
              <el-form-item>
                <el-checkbox v-model="form.isPublicResult" label="公开反馈结果" />
              </el-form-item>
              <el-form-item>
                <el-checkbox v-model="form.isEveryoneWriteOnce" label="每人限填写一次" />
              </el-form-item>
              <el-form-item>
                <el-checkbox v-model="form.isEveryoneDayWriteOnce" label="每人每天限填写一次" />
              </el-form-item>
            </div>
          </div>

          <!-- 回收设置区域 -->
          <el-divider border-style="dashed" content-position="left">
            <h4>回收设置</h4>
          </el-divider>
          <el-form-item>
            <div class="recycle-setting">
              <!-- 定时收集开关 -->
              <el-checkbox v-model="setting.timingCollectForm" label="定时/定量收集表单" class="timing-switch" />
              <!-- 定时收集配置（条件渲染） -->
              <el-form v-if="setting.timingCollectForm" class="timing-config-form" :model="form">
                <!-- 收集时间范围 -->
                <el-form-item label="收集时间" class="timing-form-item">
                  &nbsp; &nbsp; &nbsp; &nbsp;
                  <el-date-picker
                    v-model="timingTime"
                    type="datetimerange"
                    range-separator="至"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    :disabled="!setting.timingCollectForm"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    required
                  />
                </el-form-item>

                <!-- 未启用提示语 -->
                <el-form-item label="未启用提示语" class="timing-form-item">
                  <el-input
                    v-model="form.timedNotEnabledPromptText"
                    :disabled="!setting.timingCollectForm"
                    maxlength="100"
                    show-word-limit
                  />
                </el-form-item>

                <!-- 停用后提示语 -->
                <el-form-item label="停用后提示语" class="timing-form-item">
                  <el-input
                    v-model="form.timedDeactivatePromptText"
                    :disabled="!setting.timingCollectForm"
                    maxlength="100"
                    show-word-limit
                  />
                </el-form-item>

                <!-- 定量收集开关 -->
                <el-form-item label="定量收集" class="timing-form-item">
                  <el-switch v-model="setting.timingQuantitativeForm" :disabled="!setting.timingCollectForm" />
                </el-form-item>

                <!-- 定量配置（条件渲染） -->
                <el-form-item v-if="setting.timingQuantitativeForm" label="定量填写数量" class="timing-form-item">
                  <el-input-number
                    v-model="form.timedQuantitativeQuantity"
                    :min="0"
                    :max="99999"
                    :disabled="!setting.timingQuantitativeForm"
                    placeholder="请输入数量"
                  />
                </el-form-item>

                <!-- 收集完成提示语 -->
                <el-form-item v-if="setting.timingQuantitativeForm" label="收集完成提示语" class="timing-form-item">
                  <el-input
                    v-model="form.timedEndPromptText"
                    :disabled="!setting.timingQuantitativeForm"
                    maxlength="100"
                    show-word-limit
                  />
                </el-form-item>
              </el-form>
            </div>
          </el-form-item>

          <!-- 提交按钮：统一位置、添加加载状态 -->
          <el-form-item class="form-actions">
            <el-button type="primary" style="width: 120px" :icon="Check" @click="handleUpdateSetting" :loading="isSubmitting">
              保存
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, watch, onMounted, UnwrapRef } from "vue";
import { ElForm, ElMessage } from "element-plus";
import { getSurveySetting, save } from "@/api/modules/questionnaire/surveySetting";
import { Check } from "@element-plus/icons-vue";

// -------------------------- 1. 类型定义（提升类型安全） --------------------------
/** 后端返回的问卷设置类型 */
interface SurveySettingResponse {
  submitPromptText?: string;
  submitJumpUrl?: string;
  isValidEmployeeNo?: boolean;
  validEmployeeNoPromptText?: string;
  isPublicResult?: boolean;
  isEveryoneWriteOnce?: boolean;
  isEveryoneDayWriteOnce?: boolean;
  timedNotEnabledPromptText?: string;
  timedDeactivatePromptText?: string;
  timedQuantitativeQuantity?: number;
  timedEndPromptText?: string;
  timedCollectionBeginTime?: string; // 后端时间格式（如：YYYY-MM-DD HH:mm:ss）
  timedCollectionEndTime?: string;
}

/** 表单数据类型 */
interface FormData {
  submitPromptText: string;
  submitJumpUrl: string;
  isValidEmployeeNo: boolean;
  validEmployeeNoPromptText: string;
  isPublicResult: boolean;
  isEveryoneWriteOnce: boolean;
  isEveryoneDayWriteOnce: boolean;
  timedNotEnabledPromptText: string;
  timedDeactivatePromptText: string;
  timedQuantitativeQuantity: number | null;
  timedEndPromptText: string;
}

/** 开关控制项类型 */
interface SettingSwitch {
  showPromptText: boolean;
  showSubmitJumpUrl: boolean;
  timingCollectForm: boolean;
  timingQuantitativeForm: boolean;
}

/** 表单数据（reactive 用于复杂对象，初始化默认值） */
const form: UnwrapRef<FormData> = reactive({
  submitPromptText: "提交成功",
  submitJumpUrl: "",
  isValidEmployeeNo: false,
  validEmployeeNoPromptText: "",
  isPublicResult: false,
  isEveryoneWriteOnce: false,
  isEveryoneDayWriteOnce: false,
  timedNotEnabledPromptText: "",
  timedDeactivatePromptText: "",
  timedQuantitativeQuantity: null,
  timedEndPromptText: ""
});

/** 开关控制（ref 用于简单对象，便于解构） */
const setting = ref<SettingSwitch>({
  showPromptText: false,
  showSubmitJumpUrl: false,
  timingCollectForm: false,
  timingQuantitativeForm: false
});

/** 时间范围（日期选择器专用） */
const timingTime = ref<string[]>([]);

/** 表单引用（用于校验） */
const settingFormRef = ref<InstanceType<typeof ElForm> | null>(null);

/** 提交加载状态 */
const isSubmitting = ref(false);

// -------------------------- 3. 业务逻辑（拆分函数、捕获异常） --------------------------
/** 重置表单字段（泛型约束，避免非法字段） */
const resetFormField = <T extends keyof FormData>(fieldName: T): void => {
  const field = form[fieldName];
  // 根据字段类型设置默认值（更精准）
  form[fieldName] = typeof field === "number" ? 0 : "";
};

/** 获取问卷设置（添加错误处理、类型断言优化） */
const getSurveySettingData = async (surveyId: string = "4406777d0a3d407ab0a5ec9a41afb5e9") => {
  try {
    const res = await getSurveySetting(surveyId);
    const data = res.data as SurveySettingResponse; // 明确类型断言，避免 any
    if (data) {
      // 1. 合并表单数据（保留响应式）
      Object.assign(form, data);
      // 2. 初始化开关状态（基于后端数据）
      setting.value = {
        showPromptText: !!data.submitPromptText,
        showSubmitJumpUrl: !!data.submitJumpUrl,
        timingCollectForm: !!data.timedCollectionBeginTime && !!data.timedCollectionEndTime,
        timingQuantitativeForm: !!data.timedQuantitativeQuantity
      };
      // 3. 初始化时间范围
      timingTime.value = [data.timedCollectionBeginTime || "", data.timedCollectionEndTime || ""];
    }
  } catch (error) {
    ElMessage.error("获取问卷设置失败，请重试");
    console.error("Get survey setting error:", error);
  }
};

/** 提交问卷设置（添加表单校验、加载状态） */
const handleUpdateSetting = async () => {
  // 1. 表单校验
  if (!settingFormRef.value) return;
  const isValid = await settingFormRef.value.validate();
  if (!isValid) return;
  // 2. 构造提交数据（补充时间范围）
  const submitData = {
    ...form,
    projectKey: "4406777d0a3d407ab0a5ec9a41afb5e9",
    timedCollectionBeginTime: timingTime.value[0] || undefined,
    timedCollectionEndTime: timingTime.value[1] || undefined
  };
  // 3. 提交请求
  try {
    isSubmitting.value = true;
    await save(submitData); // 假设后端更新接口
    ElMessage.success("问卷设置更新成功");
  } catch (error) {
    ElMessage.error("更新失败，请重试");
    console.error("Update survey setting error:", error);
  } finally {
    isSubmitting.value = false; // 无论成功失败，关闭加载
  }
};

// -------------------------- 4. 监听逻辑（优化依赖、减少冗余） --------------------------
/** 监听表单：工号校验开关关闭时清空提示 */
watch(
  () => form.isValidEmployeeNo,
  isEnabled => {
    if (!isEnabled) {
      resetFormField("validEmployeeNoPromptText");
    }
  },
  { immediate: false } // 初始化时不触发（避免覆盖后端数据）
);

/** 监听时间范围：清空时关闭定时开关 */
watch(
  () => timingTime.value,
  timeRange => {
    // 时间范围为空（两个值都为空）时关闭定时开关
    if (!timeRange) {
      setting.value.timingCollectForm = false;
    }
  }
);

/** 监听开关：控制字段清空逻辑 */
watch(
  () => setting.value,
  ({ showPromptText, showSubmitJumpUrl, timingCollectForm, timingQuantitativeForm }) => {
    // 1. 提示文字开关
    if (!showPromptText) resetFormField("submitPromptText");
    // 2. 跳转地址开关
    if (!showSubmitJumpUrl) resetFormField("submitJumpUrl");
    // 3. 定时收集开关
    if (!timingCollectForm) {
      resetFormField("timedNotEnabledPromptText");
      resetFormField("timedDeactivatePromptText");
      setting.value.timingQuantitativeForm = false; // 联动关闭定量开关
    }
    // 4. 定量收集开关
    if (!timingQuantitativeForm) {
      resetFormField("timedQuantitativeQuantity");
      resetFormField("timedEndPromptText");
    }
  },
  { deep: true } // 监听开关对象内部属性变更
);

// -------------------------- 5. 生命周期（初始化数据） --------------------------
onMounted(() => {
  getSurveySettingData();
});
</script>

<style scoped lang="scss">
// 统一变量：便于维护
$card-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
.setting-page {
  display: flex;
  align-items: flex-start; // 改为顶部对齐，避免内容过长时垂直居中异常
  justify-content: center;
  min-height: 100%; // 使用最小高度，避免内容不足时背景异常
  margin: 0;
  overflow: hidden;
  background-image: url("./images/bg.jpg");
  background-repeat: round;
}
.content-card {
  width: 94%;
  min-height: 80%;
  margin-top: $spacing-lg;
  overflow: hidden;
  background: #ffffff;
}
.survey-container {
  max-width: 1200px;
  padding: 10px 40px;
  .address-group,
  .qr-code-group {
    margin-bottom: 30px;
  }
  h3 {
    font-size: 18px;
    color: #333333;
  }
  p {
    font-size: 14px;
    color: #666666;
  }
}

// 卡片头部样式
.card-header {
  .header-desc {
    margin: 0;
    font-size: 14px;
    color: #606266;
  }
}

// 表单样式
.setting-form {
  padding: 0 $spacing-md; // 补充内边距，避免内容贴边
  margin-top: $spacing-lg;
}

// 提交设置布局
.submit-setting-layout {
  display: flex;
  gap: $spacing-lg; // 使用 gap 替代 margin，布局更清晰
  margin-bottom: $spacing-lg;
}
.submit-setting-left,
.submit-setting-right {
  flex: 1;
}

// 复选框+输入框组合样式
.checkbox-input-group {
  display: flex;
  align-items: center;
  .inline-input {
    width: 260px;
    margin-left: $spacing-md;
  }
}

// 回收设置样式
.recycle-setting {
  margin-top: $spacing-sm;
}
.timing-config-form {
  margin-top: $spacing-md;
}
.timing-form-item {
  margin-bottom: $spacing-md;
}
</style>
