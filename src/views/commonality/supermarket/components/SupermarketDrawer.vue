<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="680" :title="`${drawerProps.title}超市`">
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
          <el-form-item label="超市名称" prop="name">
            <el-input
              v-model="drawerProps.rowData.name"
              :placeholder="`${$t('main.inputError', { msg: '超市名称' })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="超市地址" prop="address">
            <el-input
              v-model="drawerProps.rowData.address"
              :placeholder="`${$t('main.inputError', { msg: '超市地址' })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="营业时间" prop="businessHours">
            <el-input
              v-model="drawerProps.rowData.businessHours"
              :placeholder="`${$t('main.inputError', { msg: '营业时间' })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="超市负责人" prop="principal">
            <el-input
              v-model="drawerProps.rowData.principal"
              :placeholder="`${$t('main.inputError', { msg: '超市负责人' })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="联系电话" prop="tel">
            <el-input
              v-model="drawerProps.rowData.tel"
              :placeholder="`${$t('main.inputError', { msg: '联系电话' })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input type="textarea" v-model="drawerProps.rowData.remark" placeholder=""></el-input>
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

<script setup lang="ts" name="SupermarketDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import { Supermarket } from "@/api/interface/commonality";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  name: [{ required: true, message: t("main.inputError", { msg: "超市名称" }) }],
  address: [{ required: true, message: t("main.inputError", { msg: "超市地址" }) }],
  businessHours: [{ required: true, message: t("main.inputError", { msg: "营业时间" }) }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<Supermarket.ResSupermarket>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
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
    try {
      await drawerProps.value.api!(drawerProps.value.rowData);
      ElMessage.success({
        message: t("main.successMsg", { title: "超市", method: `${drawerProps.value.title}` })
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
