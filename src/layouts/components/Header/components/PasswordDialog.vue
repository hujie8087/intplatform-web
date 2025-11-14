<template>
  <el-dialog v-model="dialogVisible" title="修改密码" width="500px" draggable>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input v-model="form.oldPassword" type="password" />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="form.newPassword" type="password" />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="form.confirmPassword" type="password" />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElForm, ElFormItem, ElInput, ElMessage } from "element-plus";
import { changePassword, logoutApi } from "@/api/modules/login";
import { useUserStore } from "@/stores/modules/user";
import { useRouter } from "vue-router";
import { LOGIN_URL } from "@/config";
const router = useRouter();
const userStore = useUserStore();

const dialogVisible = ref(false);
const openDialog = () => {
  dialogVisible.value = true;
};
const form = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
});

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value !== form.value.newPassword) {
    callback(new Error("两次密码不一致"));
  } else {
    callback();
  }
};
const rules = ref({
  oldPassword: [{ required: true, message: "请输入旧密码", trigger: "blur" }],
  newPassword: [{ required: true, message: "请输入新密码", trigger: "blur" }],
  confirmPassword: [
    { required: true, message: "请确认密码", trigger: "blur" },
    { validator: validateConfirmPassword, trigger: "blur" }
  ]
});

const formRef = ref();

const handleSubmit = async () => {
  formRef.value.validate(valid => {
    if (valid) {
      changePassword({
        oldPassword: form.value.oldPassword,
        newPassword: form.value.newPassword,
        confirmPassword: form.value.confirmPassword
      }).then(async res => {
        if (+res.code === 200) {
          dialogVisible.value = false;
          ElMessage.success("修改密码成功");
          form.value.oldPassword = "";
          form.value.newPassword = "";
          form.value.confirmPassword = "";
          formRef.value.resetFields();
          // 重新登录
          // 1.执行退出登录接口
          await logoutApi();

          // 2.清除 Token
          userStore.setToken("");

          // 3.重定向到登陆页
          router.replace(LOGIN_URL);
        }
      });
    }
  });
};

defineExpose({ openDialog });
</script>
