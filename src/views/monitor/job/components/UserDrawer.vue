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
          <el-form-item :label="`${$t('system.user.username')}`" prop="userName">
            <el-input
              v-model="drawerProps.rowData!.userName"
              :placeholder="`${$t('main.inputError', { msg: $t('system.user.username') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="drawerProps.rowData?.userId === undefined">
          <el-form-item :label="`${$t('system.user.password')}`" prop="password">
            <el-input
              v-model="drawerProps.rowData!.password"
              type="password"
              :placeholder="`${$t('main.inputError', { msg: $t('system.user.password') })}`"
              clearable
            ></el-input>
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
              <el-option v-for="item in genderType" :key="item.value" :label="item.label.value" :value="item.value" />
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
import { genderType } from "@/utils/serviceDict";
import { ElMessage, FormInstance } from "element-plus";
import { Account } from "@/api/interface/system";
import { useI18n } from "vue-i18n";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  userName: [{ required: true, message: t("main.inputError", { msg: t("system.user.username") }) }],
  nickName: [{ required: true, message: t("main.inputError", { msg: t("system.user.name") }) }],
  password: [{ required: true, message: t("main.inputError", { msg: t("system.user.password") }) }],
  phonenumber: [{ required: true, message: t("main.inputError", { msg: t("system.user.mobile") }) }],
  email: [{ required: true, message: t("main.inputError", { msg: t("system.user.email") }) }],
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
}

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

defineExpose({
  acceptParams
});
</script>
