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
              disabled
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('system.user.username')}`" prop="userName">
            <el-input
              v-model="drawerProps.rowData!.userName"
              :placeholder="`${$t('main.inputError', { msg: $t('system.user.username') })}`"
              clearable
              disabled
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('system.user.role')}`" prop="role">
            <el-select
              v-model="roleForm.roleIds"
              placeholder="请选择角色"
              clearable
              multiple
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="2"
            >
              <el-option
                v-for="item in drawerProps.roleList"
                :key="item.roleId"
                :label="item.roleName"
                :value="item.roleId"
              ></el-option>
            </el-select>
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

<script setup lang="ts" name="RoleDrawer">
import { ref } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import { Role } from "@/api/interface/mealDelivery/system/role";
import { User } from "@/api/interface/mealDelivery/system/user";
const { t } = useI18n(); // 解构出t方法

interface DrawerProps {
  title: string;
  isView: boolean;
  api?: (params: any) => Promise<any>;
  rowData?: User.ResUser;
  roleList?: Role.ResRole[];
}
// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: ""
});
const roleForm = ref<{ userId: number; roleIds: number[] }>({
  userId: 0,
  roleIds: []
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
  roleForm.value.userId = params.rowData!.userId;
  roleForm.value.roleIds = params.rowData!.roles.map(item => item.roleId);
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await drawerProps.value.api!({ userId: roleForm.value.userId, roleIds: roleForm.value.roleIds.join(",") });
      ElMessage.success({
        message: t("main.successMsg", { method: `${drawerProps.value.title}` })
      });
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
