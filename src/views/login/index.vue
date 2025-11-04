<template>
  <div class="login-container flx-center">
    <div class="login-box">
      <SwitchDark class="dark" />
      <div class="login-left">
        <img class="login-left-img" src="@/assets/images/login_left.png" alt="login" />
      </div>
      <div class="login-form">
        <div class="login-logo">
          <img class="login-icon" src="@/assets/images/logo.png" alt="" />
          <h2 class="logo-text">{{ title }}</h2>
        </div>
        <LoginForm @first-login-change-password="handleFirstLoginChangePassword" />
      </div>
    </div>
    <el-dialog v-model="firstLoginChangePasswordDialog" title="首次登录修改密码" width="30%">
      <el-form
        ref="firstLoginChangePasswordFormRef"
        :model="firstLoginChangePasswordForm"
        :rules="firstLoginChangePasswordRules"
        label-width="100px"
      >
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="firstLoginChangePasswordForm.newPassword" type="password" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="firstLoginChangePasswordForm.confirmPassword" type="password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="handleFirstLoginChangePasswordSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="login">
import { ref } from "vue";
import LoginForm from "./components/LoginForm.vue";
import SwitchDark from "@/components/SwitchDark/index.vue";
import { ElMessage, FormInstance } from "element-plus";
import { firstLoginChangePassword } from "@/api/modules/login";
import { useRouter } from "vue-router";
import { LOGIN_URL } from "@/config";
const title = import.meta.env.VITE_GLOB_APP_TITLE;
const router = useRouter();
const firstLoginChangePasswordDialog = ref(false);
const firstLoginChangePasswordForm = ref({
  newPassword: "",
  confirmPassword: "",
  code: "",
  account: ""
});

const firstLoginChangePasswordRules = ref({
  newPassword: [{ required: true, message: "请输入新密码", trigger: "blur" }],
  confirmPassword: [{ required: true, message: "请确认密码", trigger: "blur" }]
});
const firstLoginChangePasswordFormRef = ref<FormInstance>();
const handleFirstLoginChangePasswordSubmit = () => {
  firstLoginChangePasswordFormRef.value?.validate(valid => {
    if (valid) {
      firstLoginChangePassword(firstLoginChangePasswordForm.value).then(res => {
        if (res.code === 200) {
          firstLoginChangePasswordDialog.value = false;
          ElMessage.success("修改密码成功");
          router.push(LOGIN_URL);
        }
      });
    } else {
      console.log("error submit!!!");
    }
  });
};

const handleFirstLoginChangePassword = (params: { code: string; account: string }) => {
  firstLoginChangePasswordForm.value = {
    ...firstLoginChangePasswordForm.value,
    code: params.code,
    account: params.account
  };
  firstLoginChangePasswordDialog.value = true;
};
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
