<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="680" :title="`${drawerProps.title}${$t('company.company')}`">
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
          <el-form-item :label="`${$t('company.companyName')}`" prop="companyName">
            <el-input
              v-model="drawerProps.rowData!.companyName"
              :placeholder="`${$t('main.inputError', { msg: $t('company.companyName') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('company.companyCode')}`" prop="companyCode">
            <el-input
              v-model="drawerProps.rowData!.companyCode"
              :placeholder="`${$t('main.inputError', { msg: $t('company.companyCode') })}`"
              clearable
            >
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('company.status')}`" prop="status">
            <el-radio-group
              v-model="drawerProps.rowData!.status"
              :placeholder="`${$t('main.inputError', { msg: $t('company.status') })}`"
            >
              <el-radio label="0">{{ $t("dict.enable") }}</el-radio>
              <el-radio label="1">{{ $t("dict.disable") }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('company.remark')}`" prop="remark">
            <el-input
              v-model="drawerProps.rowData!.remark"
              type="textarea"
              :placeholder="`${$t('main.inputError', { msg: $t('company.remark') })}`"
            >
            </el-input>
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

<script setup lang="ts" name="CompanyDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import { Company } from "@/api/interface/mealDelivery/system/company";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  companyCode: [{ required: true, message: t("main.selectError", { msg: t("company.companyCode") }) }],
  companyName: [{ required: true, message: t("main.inputError", { msg: t("company.companyName") }) }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData?: Partial<Company.ResCompany>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  companyOptions?: Company.ResCompany[];
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
  console.log(drawerProps.value);
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await drawerProps.value.api!(drawerProps.value.rowData);
      ElMessage.success({
        message: t("main.successMsg", { title: t("company.company"), method: `${drawerProps.value.title}` })
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
