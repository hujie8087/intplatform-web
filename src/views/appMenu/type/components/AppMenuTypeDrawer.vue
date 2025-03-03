<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}app菜单类型`">
    <el-form
      ref="ruleFormRef"
      label-width="120px"
      label-suffix=" :"
      :rules="rules"
      :model="drawerProps.rowData"
      :disabled="drawerProps.isView"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="中文名称" prop="cname">
            <el-input v-model="drawerProps.rowData.cname" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="英文名称" prop="uname">
            <el-input v-model="drawerProps.rowData.uname" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="印尼语名称" prop="yname">
            <el-input v-model="drawerProps.rowData.yname" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="权限标识" prop="permissions">
            <el-input v-model="drawerProps.rowData.permissions" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="类型图标" prop="repairPhoto">
            <SelectMaterialIcon v-model:icon-value="iconValue" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="需要登录" prop="isLogin">
            <el-switch
              v-model="drawerProps.rowData.isLogin"
              :active-value="1"
              :inactive-value="0"
              active-color="#13ce66"
              inactive-color="#ff4949"
            >
            </el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-switch
              v-model="drawerProps.rowData.status"
              :active-value="0"
              :inactive-value="1"
              active-color="#13ce66"
              inactive-color="#ff4949"
            >
            </el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="drawerProps.rowData.sort" :min="0" :max="9999" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" @click="handleSubmit" v-if="!drawerProps.isView">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="AppMenuTypeDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { AppMenuType } from "@/api/interface/system";
import { useI18n } from "vue-i18n";
import SelectMaterialIcon from "@/components/SelectMaterialIcon/index.vue";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  cname: [{ required: true, message: t("main.inputError", { msg: "中文名称" }) }],
  uname: [{ required: true, message: t("main.inputError", { msg: "英文名称" }) }],
  yname: [{ required: true, message: t("main.inputError", { msg: "印尼语名称" }) }],
  icon: [{ required: true, message: t("main.inputError", { msg: "类型图标" }) }],
  sort: [{ required: true, message: t("main.inputError", { msg: "排序" }) }]
});
const iconValue = ref("");

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<AppMenuType.ResAppMenuType>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  treeData?: {
    [key: string]: any;
  }[];
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: "",
  isView: false,
  rowData: {}
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
  iconValue.value = params.rowData.icon || "";
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  drawerProps.value.rowData.icon = iconValue.value;

  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await drawerProps.value.api!({
        ...drawerProps.value.rowData,
        permissions: drawerProps.value.rowData.permissions?.trim() !== "" ? drawerProps.value.rowData.permissions?.trim() : null
      });
      ElMessage.success({
        message: t("main.successMsg", { title: "App菜单类型", method: `${drawerProps.value.title}` })
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
