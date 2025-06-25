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
          <el-form-item :label="`${$t('system.user.username')}`" prop="userName">
            <el-input
              v-model="drawerProps.rowData!.userName"
              :placeholder="`${$t('main.inputError', { msg: $t('system.user.username') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('system.user.name')}`" prop="nickName">
            <el-input
              v-model="drawerProps.rowData!.nickName"
              :placeholder="`${$t('main.inputError', { msg: $t('system.user.name') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('system.user.userType')}`" prop="userType">
            <el-select
              v-model="drawerProps.rowData!.userType"
              :placeholder="`${$t('main.selectError', { msg: $t('system.user.userType') })}`"
              clearable
              style="width: 100%"
            >
              <el-option v-for="item in userType" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('system.user.mobile')}`" prop="phonenumber">
            <el-input
              v-model="drawerProps.rowData!.phonenumber"
              :placeholder="`${$t('main.inputError', { msg: $t('system.user.mobile') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('system.user.card')}`" prop="card">
            <el-input
              v-model="drawerProps.rowData!.card"
              :placeholder="`${$t('main.inputError', { msg: $t('system.user.card') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('system.user.email')}`" prop="email">
            <el-input
              v-model="drawerProps.rowData!.email"
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
              v-model="drawerProps.rowData!.deptId"
              :data="drawerProps.deptList"
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
          <el-form-item :label="`${$t('system.user.role')}`" prop="roleIds">
            <el-select
              v-model="drawerProps.rowData!.roleIds"
              :placeholder="`${$t('main.selectError', { msg: $t('system.user.role') })}`"
              multiple
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="3"
              clearable
              style="width: 100%"
            >
              <el-option v-for="item in drawerProps.roleList" :key="item.roleId" :label="item.roleName" :value="item.roleId" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('system.user.canteen')}`" prop="canteenId">
            <el-select
              v-model="canteenIds"
              :placeholder="`${$t('main.selectError', { msg: $t('system.user.canteen') })}`"
              clearable
              multiple
              style="width: 100%"
            >
              <el-option v-for="item in drawerProps.canteenList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('main.remark')}`" prop="remark">
            <el-input
              v-model="drawerProps.rowData!.remark"
              :placeholder="`${$t('main.inputError', { msg: $t('main.remark') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('system.user.status')}`" prop="status">
            <el-switch
              v-model="drawerProps.rowData!.status"
              inline-prompt
              active-value="0"
              inactive-value="1"
              :active-text="`${$t('dict.enable')}`"
              :inactive-text="`${$t('dict.disable')}`"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" v-show="!drawerProps.isView" @click="handleSubmit">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="UserDrawer">
import { ref, reactive } from "vue";
import { genderType, userType } from "@/utils/serviceDict";
import { ElMessage, FormInstance } from "element-plus";
import { Account, Role } from "@/api/interface/system";
import { useI18n } from "vue-i18n";
import UploadImg from "@/components/Upload/Img.vue";
import { updateRole } from "@/api/modules/system/user";
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
  rowData?: Partial<Account.ResAccountList>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  deptList?: {
    [key: string]: any;
  }[];
  roleList?: Role.ResRole[];
  canteenList?: DictOptions[];
}
const canteenIds = ref<number[]>([]);
// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  deptList: []
});
const deptListOptions = ref<{ label: string; value: string }[]>([]);
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
  if (drawerProps.value.rowData?.roles) {
    drawerProps.value.rowData.roleIds = drawerProps.value.rowData.roles.map(item => item.roleId);
  }
  if (drawerProps.value.rowData?.canteenId) {
    canteenIds.value = drawerProps.value.rowData.canteenId.split(",").map(Number);
  }
  deptListOptions.value = drawerProps.value.deptList!.map(item => {
    return {
      label: item.deptName,
      value: item.deptId
    };
  });
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await drawerProps.value.api!({ ...drawerProps.value.rowData, canteenId: canteenIds.value.join(",") });
      ElMessage.success({
        message: t("main.successMsg", { title: t("system.user.user"), method: `${drawerProps.value.title}` })
      });
      // 如果用户有角色，更新用户角色
      if (drawerProps.value.rowData?.roles && drawerProps.value.rowData.roleIds && drawerProps.value.rowData.roleIds.length > 0) {
        await updateRole({ userId: drawerProps.value.rowData.userId, roleIds: drawerProps.value.rowData.roleIds });
      }
      drawerProps.value.getTableList!();
      drawerVisible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};

defineExpose({
  acceptParams
});
</script>
