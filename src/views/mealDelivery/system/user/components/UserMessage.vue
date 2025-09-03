<template>
  <el-dialog
    v-model="drawerVisible"
    :destroy-on-close="true"
    width="680"
    :title="`${drawerProps.title}${$t('system.user.user')}`"
  >
    <el-form
      ref="ruleFormRef"
      label-width="110px"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="drawerProps.rowData"
      :hide-required-asterisk="drawerProps.isView"
    >
      <el-row>
        <!-- <el-col :span="24">
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
        </el-col> -->
        <el-col :span="12" v-if="drawerProps.title == '新增'">
          <el-form-item :label="`${$t('system.user.username')}`" prop="userName">
            <el-input
              v-model="drawerProps.rowData!.userName"
              :placeholder="`${$t('main.inputError', { msg: $t('system.user.username') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <!-- 姓名+拼音 -->
        <el-col :span="12">
          <el-form-item :label="`${$t('system.user.userChinaseEnglish')}`" prop="nickName">
            <el-input
              v-model="drawerProps.rowData!.nickName"
              :placeholder="`${$t('main.inputError', { msg: $t('system.user.name') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <!-- 部门 -->
        <el-col :span="24">
          <el-form-item :label="`${$t('system.user.dept')}`" prop="deptId">
            <el-tree-select
              v-model="drawerProps.rowData!.deptId"
              :data="drawerProps.deptList"
              :props="{ value: 'id', label: 'label', children: 'children' }"
              value-key="id"
              :filterable="true"
              placeholder="请选择部门"
              check-strictly
            >
              <template #default="{ data }">
                {{ data.shortLabel }}
              </template>
            </el-tree-select>
          </el-form-item>
        </el-col>
        <!-- 账号类别 -->
        <el-col :span="12">
          <el-form-item :label="`${$t('system.user.accountType')}`" prop="accountType">
            <el-select
              v-model="drawerProps.rowData!.accountType"
              :placeholder="`${$t('main.selectError', { msg: $t('system.user.accountType') })}`"
            >
              <el-option
                v-for="dict in drawerProps.accountTypeOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 角色 -->
        <el-col :span="12">
          <el-form-item :label="`${$t('system.user.role')}`" prop="roleIds">
            <el-select
              v-model="drawerProps.rowData!.roleIds"
              collapse-tags
              collapse-tags-tooltip
              multiple
              @change="handleRoleChange"
              :placeholder="`${$t('main.selectError', { msg: $t('system.user.role') })}`"
            >
              <el-option
                v-for="item in drawerProps.roleOptions"
                :key="item.roleId"
                :label="item.roleName"
                :value="item.roleId"
                :disabled="item.status == 1"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 国籍 -->
        <el-col :span="12">
          <el-form-item :label="`${$t('employee.nationType')}`" prop="nationality">
            <el-select
              v-model="drawerProps.rowData!.nationality"
              :placeholder="`${$t('main.selectError', { msg: $t('employee.nationType') })}`"
            >
              <el-option
                v-for="dict in drawerProps.nationOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 密码 -->
        <el-col :span="12" v-if="drawerProps.rowData!.userId == undefined">
          <el-form-item :label="`${$t('system.user.password')}`" prop="password">
            <el-input
              v-model="drawerProps.rowData!.password"
              :placeholder="`${$t('main.inputError', { msg: $t('system.user.password') })}`"
              type="password"
              maxlength="20"
              show-password
            />
          </el-form-item>
        </el-col>
        <!-- 岗位 -->
        <el-col :span="12">
          <el-form-item :label="$t('employee.post')" prop="postIds">
            <el-select
              v-model="drawerProps.rowData!.postIds"
              :placeholder="`${$t('main.selectError', { msg: $t('employee.post') })}`"
            >
              <el-option
                v-for="item in drawerProps.postOptions"
                :key="item.postId"
                :label="item.postName"
                :value="item.postId"
                :disabled="item.status == 1"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 性别 -->
        <el-col :span="12">
          <el-form-item :label="`${$t('system.user.sex')}`">
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
        <!-- 手机号 -->
        <el-col :span="12">
          <el-form-item :label="`${$t('system.user.mobile')}`" prop="phonenumber">
            <el-input
              v-model="drawerProps.rowData!.phonenumber"
              :placeholder="`${$t('main.inputError', { msg: $t('system.user.mobile') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <!-- 邮箱 -->
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
        <!-- 状态 -->
        <el-col :span="24">
          <el-form-item :label="`${$t('system.user.status')}`">
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
        <!-- 备注 -->
        <el-col :span="24">
          <el-form-item :label="`${$t('main.remark')}`" prop="remark">
            <el-input
              v-model="drawerProps.rowData!.remark"
              type="textarea"
              :placeholder="`${$t('main.inputError', { msg: $t('main.remark') })}`"
              clearable
            ></el-input>
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
import { genderType } from "@/utils/serviceDict";
import { ElMessage, FormInstance } from "element-plus";
import { User } from "@/api/interface/mealDelivery/system/user";
import { useI18n } from "vue-i18n";
// import UploadImg from "@/components/Upload/Img.vue";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  userName: [{ required: true, message: t("main.inputError", { msg: t("employee.jobNumber") }) }],
  nickName: [{ required: true, message: t("main.inputError", { msg: t("system.user.name") }) }],
  deptId: [{ required: true, message: t("main.selectError", { msg: t("system.user.dept") }) }],
  accountType: [{ required: true, message: t("main.selectError", { msg: t("system.user.accountType") }) }],
  roleIds: [{ required: true, message: t("main.selectError", { msg: t("system.user.role") }) }],
  nationality: [{ required: true, message: t("main.selectError", { msg: t("employee.nationType") }) }],
  password: [{ required: true, message: t("main.inputError", { msg: t("system.user.password") }) }],
  userType: [{ required: true, message: t("main.selectError", { msg: t("system.user.userType") }) }],
  phonenumber: [{ required: true, message: t("main.inputError", { msg: t("system.user.mobile") }) }]
});
interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<User.ResUser>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  deptList?: {
    [key: string]: any;
  }[];
  accountTypeOptions: {
    [key: string]: any;
  }[];
  roleOptions: {
    [key: string]: any;
  }[];
  nationOptions: {
    [key: string]: any;
  }[];
  postOptions: {
    [key: string]: any;
  }[];
  userSexOptions: {
    [key: string]: any;
  }[];
}
// const canteenIds = ref<number[]>([]);
// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  deptList: [],
  accountTypeOptions: [],
  roleOptions: [],
  nationOptions: [],
  postOptions: [],
  userSexOptions: []
});
const deptListOptions = ref<{ label: string; value: string }[]>([]);
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
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
      if (typeof drawerProps.value.rowData?.postIds === "undefined") {
        drawerProps.value.rowData.postIds = [];
      } else if (drawerProps.value.rowData.postIds + "" && !Array.isArray(drawerProps.value.rowData.postIds)) {
        drawerProps.value.rowData.postIds = [drawerProps.value.rowData.postIds];
      } else if (!Array.isArray(drawerProps.value.rowData.postIds)) {
        drawerProps.value.rowData.postIds = [];
      }
      await drawerProps.value.api!(drawerProps.value.rowData);
      ElMessage.success({
        message: t("main.successMsg", { title: t("system.user.user"), method: `${drawerProps.value.title}` })
      });
      drawerProps.value.getTableList!();
      drawerVisible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};
const handleRoleChange = roleIds => {
  if ((roleIds || []).includes(2) && (roleIds || []).includes(106)) {
    ElMessage.warning({
      message: "部门报餐管理员 与 车间/班组报餐员 建议只选择一个"
    });
  }
};

defineExpose({
  acceptParams
});
</script>
