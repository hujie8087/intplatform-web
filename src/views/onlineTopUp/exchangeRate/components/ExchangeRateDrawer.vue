<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="500" :title="`${drawerProps.title}汇率`">
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
          <el-form-item label="汇率月份" prop="yearMonth">
            <el-date-picker
              v-model="drawerProps.rowData.yearMonth"
              format="YYYY-MM"
              value-format="YYYY-MM"
              type="month"
              placeholder="选择月份"
            />
          </el-form-item>
        </el-col>
        <!-- 币种 -->
        <el-col :span="24">
          <el-form-item label="币种" prop="currency">
            <el-input v-model="drawerProps.rowData.currency" placeholder="请输入币种" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <!-- 汇率 -->
          <el-form-item label="汇率" prop="exchangeRate">
            <el-input v-model="drawerProps.rowData.exchangeRate" :min="0" :max="1000000" :step="1" :precision="0" />
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

<script setup lang="ts" name="ExchangeRateDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { ExchangeRate } from "@/api/interface/onlineTopUp";
import { useI18n } from "vue-i18n";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  yearMonth: [{ required: true, message: t("main.inputError", { msg: "汇率月份" }) }],
  currency: [{ required: true, message: t("main.inputError", { msg: "币种" }) }],
  exchangeRate: [{ required: true, message: t("main.inputError", { msg: "汇率" }) }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<ExchangeRate.ResExchangeRate>;
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
        message: t("main.successMsg", { title: "汇率", method: `${drawerProps.value.title}` })
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
