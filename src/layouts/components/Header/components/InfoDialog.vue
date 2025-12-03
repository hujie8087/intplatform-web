<template>
  <el-dialog v-model="dialogVisible" title="个人信息" width="700px" draggable>
    <div>
      <el-form ref="ruleFormRef" label-width="120px" label-suffix=" :" :model="userInfo" :disabled="true">
        <el-row>
          <el-col :span="24">
            <el-form-item label="用户头像" prop="avatar">
              <UploadImg v-model:image-url="userInfo.avatar" height="100px" width="100px" :drag="false" border-radius="50%">
                <template #empty>
                  <el-icon><Avatar /></el-icon>
                  <span>请上传头像</span>
                </template>
              </UploadImg>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="`${$t('system.user.username')}`" prop="userName">
              <el-input
                v-model="userInfo.account"
                disabled
                :placeholder="`${$t('main.inputError', { msg: $t('system.user.username') })}`"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="`${$t('system.user.name')}`" prop="nickName">
              <el-input
                v-model="userInfo.name"
                disabled
                :placeholder="`${$t('main.inputError', { msg: $t('system.user.name') })}`"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="`${$t('system.user.mobile')}`" prop="phonenumber">
              <el-input
                v-model="userInfo.tel"
                :placeholder="`${$t('main.inputError', { msg: $t('system.user.mobile') })}`"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="`${$t('system.user.sex')}`" prop="sex">
              <el-select
                v-model="userInfo.sex"
                :placeholder="`${$t('main.selectError', { msg: $t('system.user.sex') })}`"
                clearable
                style="width: 100%"
              >
                <el-option v-for="item in sexType" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="`${$t('system.user.card')}`" prop="card">
              <el-input
                v-model="userInfo.card"
                disabled
                :placeholder="`${$t('main.inputError', { msg: $t('system.user.card') })}`"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="`${$t('system.user.postName')}`" prop="postName">
              <el-input
                v-model="userInfo.postName"
                :placeholder="`${$t('main.inputError', { msg: $t('system.user.postName') })}`"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="`${$t('system.user.formatOrganizeName')}`" prop="formatOrganizeName">
              <el-input
                v-model="userInfo.formatOrganizeName"
                :placeholder="`${$t('main.inputError', { msg: $t('system.user.formatOrganizeName') })}`"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores/modules/user";
import { ref } from "vue";
import UploadImg from "@/components/Upload/Img.vue";
import { Login } from "@/api/interface";
import { sexType } from "@/utils/serviceDict";
const userStore = useUserStore();
// const filePath = import.meta.env.VITE_APP_BASE_FILE;
const userInfo = ref<Login.ResThirdUserInfo>(userStore.thirdUserInfo);
const dialogVisible = ref(false);

const openDialog = () => {
  dialogVisible.value = true;
};
defineExpose({ openDialog });
</script>
