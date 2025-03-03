<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}菜单`">
    <el-form ref="ruleFormRef" label-width="120px" label-suffix=" :" :rules="rules" :model="drawerProps.rowData">
      <el-row>
        <el-col :span="12">
          <el-form-item label="菜单类型" prop="typeId">
            <el-select v-model="drawerProps.rowData.typeId" placeholder="请选择">
              <el-option v-for="item in drawerProps.guideTypeOptions" :label="item.label" :value="item.value" :key="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="菜单中文名称" prop="cname">
            <!-- 选择报修人 -->
            <el-input v-model="drawerProps.rowData.cname" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="菜单英文名称" prop="uname">
            <!-- 选择报修人 -->
            <el-input v-model="drawerProps.rowData.uname" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="菜单印尼名称" prop="yname">
            <!-- 选择报修人 -->
            <el-input v-model="drawerProps.rowData.yname" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="菜单图标" prop="icon">
            <SelectMaterialIcon v-model:icon-value="drawerProps.rowData.icon" /> </el-form-item
        ></el-col>
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
          <el-form-item label="菜单路由" prop="router">
            <el-input v-model="drawerProps.rowData.router" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="菜单权限" prop="permissions">
            <!-- 去掉前后空格 -->
            <el-input v-model="drawerProps.rowData.permissions" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="菜单排序" prop="sort">
            <el-input-number v-model="drawerProps.rowData.sort" :min="0" :max="9999" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否Badge" prop="isMic">
            <el-switch
              v-model="drawerProps.rowData.isMic"
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
          <el-form-item label="菜单参数" prop="remark">
            <el-input v-model="drawerProps.rowData.remark" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" @click="handleSubmit">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="AppMenuDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import { AppMenu } from "@/api/interface/system";
import { DictOptions } from "@/api/interface";
import SelectMaterialIcon from "@/components/SelectMaterialIcon/index.vue";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  cname: [{ required: true, message: t("main.inputError", { msg: "菜单中文名称" }) }],
  uname: [{ required: true, message: t("main.inputError", { msg: "菜单英文名称" }) }],
  yname: [{ required: true, message: t("main.inputError", { msg: "菜单印尼名称" }) }],
  // typeId: [{ required: true, message: t("main.selectError", { msg: "菜单类型" }) }],
  icon: [{ required: true, message: t("main.inputError", { msg: "菜单图标" }) }],
  isLogin: [{ required: true, message: t("main.inputError", { msg: "需要登录" }) }],
  router: [{ required: true, message: t("main.inputError", { msg: "菜单路由" }) }],
  sort: [{ required: true, message: t("main.inputError", { msg: "菜单排序" }) }],
  status: [{ required: true, message: t("main.inputError", { msg: "菜单状态" }) }]
});

interface DrawerProps {
  title: string;
  rowData: Partial<AppMenu.ResAppMenu>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  guideTypeOptions?: DictOptions[];
}
// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: "",
  rowData: {}
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    const formData = {
      ...drawerProps.value.rowData,
      permissions: drawerProps.value.rowData.permissions?.trim() !== "" ? drawerProps.value.rowData.permissions?.trim() : null
    };
    try {
      await drawerProps.value.api!(formData);
      ElMessage.success({
        message: t("main.successMsg", { title: "App菜单", method: `${drawerProps.value.title}` })
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
