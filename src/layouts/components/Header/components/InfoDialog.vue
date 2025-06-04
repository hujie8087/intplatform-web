<template>
  <el-dialog v-model="dialogVisible" title="个人信息" width="700px" draggable>
    <div>
      <el-form ref="ruleFormRef" label-width="120px" label-suffix=" :" :model="userInfo">
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
                v-model="userInfo.userName"
                disabled
                :placeholder="`${$t('main.inputError', { msg: $t('system.user.username') })}`"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="`${$t('system.user.name')}`" prop="nickName">
              <el-input
                v-model="userInfo.nickName"
                :placeholder="`${$t('main.inputError', { msg: $t('system.user.name') })}`"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="`${$t('system.user.mobile')}`" prop="phonenumber">
              <el-input
                v-model="userInfo.phonenumber"
                :placeholder="`${$t('main.inputError', { msg: $t('system.user.mobile') })}`"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="`${$t('system.user.card')}`" prop="card">
              <el-input
                v-model="userInfo.card"
                :placeholder="`${$t('main.inputError', { msg: $t('system.user.card') })}`"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="`${$t('system.user.email')}`" prop="email">
              <el-input
                v-model="userInfo.email"
                :placeholder="`${$t('main.inputError', { msg: $t('system.user.email') })}`"
                clearable
              >
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="`${$t('system.user.dept')}`" prop="deptId">
              <el-tree-select
                ref="deptTreeRef"
                v-model="userInfo.deptId"
                :data="deptList"
                check-strictly
                value-key="id"
                :render-after-expand="false"
                :placeholder="`${$t('main.selectError', { msg: $t('system.user.dept') })}`"
                filterable
                style="width: 100%"
              />
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
                <el-option v-for="item in genderType" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="`${$t('main.remark')}`" prop="remark">
              <el-input
                v-model="userInfo.remark"
                :placeholder="`${$t('main.inputError', { msg: $t('main.remark') })}`"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores/modules/user";
import { ref } from "vue";
import UploadImg from "@/components/Upload/Img.vue";
import { Login, User } from "@/api/interface";
import { genderType } from "@/utils/serviceDict";
import { getUserDepartment } from "@/api/modules/user";
const userStore = useUserStore();
const deptList = ref<User.ResDepartment[]>([]);
// const filePath = import.meta.env.VITE_APP_BASE_FILE;
const userInfo = ref<Login.ResUserInfo["user"]>({ ...userStore.userInfo.user });
const dialogVisible = ref(false);

const getDeptList = async () => {
  const res = await getUserDepartment();
  deptList.value = res.data;
};
getDeptList();
const openDialog = () => {
  dialogVisible.value = true;
};
const handleSubmit = () => {
  console.log(userInfo.value);
};
defineExpose({ openDialog });
</script>
