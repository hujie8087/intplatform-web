<template>
  <el-dialog
    v-model="drawerVisible"
    :destroy-on-close="true"
    width="680"
    :title="`${drawerProps.title}${$t('system.user.user')}`"
  >
    <el-form
      ref="ruleFormRef"
      label-width="120px"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="drawerProps.rowData"
      :hide-required-asterisk="drawerProps.isView"
    >
      <el-row>
        <el-col :span="24">
          <el-form-item label="用户头像" prop="avatar">
            <UploadImg
              v-model:image-url="drawerProps.rowData!.avatar"
              height="100px"
              width="100px"
              :drag="false"
              border-radius="50%"
            >
              <template #empty>
                <el-icon><Avatar /></el-icon>
                <span>请上传头像</span>
              </template>
            </UploadImg>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('system.user.username')}`" prop="account">
            <el-input
              v-model="drawerProps.rowData!.account"
              :placeholder="`${$t('main.inputError', { msg: $t('system.user.username') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('system.user.name')}`" prop="nickName">
            <el-input
              v-model="drawerProps.rowData!.name"
              :placeholder="`${$t('main.inputError', { msg: $t('system.user.name') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('system.user.mobile')}`" prop="tel">
            <el-input
              v-model="drawerProps.rowData!.tel"
              :placeholder="`${$t('main.inputError', { msg: $t('system.user.mobile') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('system.user.postName')}`" prop="postName">
            <el-input
              v-model="drawerProps.rowData!.postName"
              :placeholder="`${$t('main.inputError', { msg: $t('system.user.postName') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('system.user.formatOrganizeName')}`" prop="formatOrganizeName">
            <el-input
              v-model="drawerProps.rowData!.formatOrganizeName"
              :placeholder="`${$t('main.inputError', { msg: $t('system.user.formatOrganizeName') })}`"
              clearable
            >
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('system.user.sex')}`" prop="sex">
            <el-select
              v-model="drawerProps.rowData!.sex"
              :placeholder="`${$t('main.selectError', { msg: $t('system.user.sex') })}`"
              clearable
              style="width: 100%"
            >
              <el-option v-for="item in genderType" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('system.user.status')}`" prop="status">
            <el-tag :type="drawerProps.rowData!.status === 1 ? 'success' : 'danger'">{{
              drawerProps.rowData!.status === 1 ? "正常" : "禁用"
            }}</el-tag>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button type="primary" v-show="!drawerProps.isView" @click="drawerVisible = false">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="UserDrawer">
import { ref, reactive } from "vue";
import { genderType } from "@/utils/serviceDict";
import { Account } from "@/api/interface/system";
import { useI18n } from "vue-i18n";
import UploadImg from "@/components/Upload/Img.vue";
import { DictOptions } from "@/api/interface";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  userName: [{ required: true, message: t("main.inputError", { msg: t("system.user.username") }) }],
  nickName: [{ required: true, message: t("main.inputError", { msg: t("system.user.name") }) }],
  userType: [{ required: true, message: t("main.selectError", { msg: t("system.user.userType") }) }],
  sex: [{ required: true, message: t("main.selectError", { msg: t("system.user.sex") }) }],
  deptId: [{ required: true, message: t("main.selectError", { msg: t("system.user.dept") }) }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData?: Partial<Account.ResThirdUser>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  userStatus?: DictOptions[];
}
// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: ""
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
};

defineExpose({
  acceptParams
});
</script>
