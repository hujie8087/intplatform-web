<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="500" title="修改工资扣款月份">
    <el-form ref="ruleFormRef" :model="formData" :rules="rules" label-width="120px" label-suffix=" :">
      <el-row>
        <el-col :span="24">
          <el-form-item label="充值开始时间" prop="startTime">
            <el-date-picker
              v-model="formData.startTime"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              :default-time="new Date(2000, 1, 1, 0, 0, 0)"
              type="datetime"
              placeholder="请选择充值开始时间"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="充值结束时间" prop="endTime">
            <el-date-picker
              v-model="formData.endTime"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              :default-time="new Date(2000, 2, 1, 23, 59, 59)"
              type="datetime"
              placeholder="请选择充值结束时间"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="扣款月份" prop="deductedMonths">
            <el-date-picker
              v-model="formData.deductedMonths"
              format="YYYY-MM"
              value-format="YYYY-MM"
              type="month"
              placeholder="请选择扣款月份"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio v-for="item in drawerProps.statusEnum" :key="item.value" :value="item.value">{{ item.label }}</el-radio>
            </el-radio-group>
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

<script setup lang="ts" name="UpdateMonthDrawer">
import { batchUpdateMonth } from "@/api/modules/onlineTopUp";
import { FormInstance } from "element-plus";
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n(); // 解构出t方法

interface DrawerProps {
  title: string;
  isView: boolean;
  getTableList?: () => Promise<any>;
  statusEnum: { label: string; value: number }[];
}

const ruleFormRef = ref<FormInstance>();
const rules = reactive({
  startTime: [{ required: true, message: t("main.inputError", { msg: "充值开始时间" }) }],
  endTime: [{ required: true, message: t("main.inputError", { msg: "充值结束时间" }) }],
  deductedMonths: [{ required: true, message: t("main.inputError", { msg: "扣款月份" }) }],
  status: [{ required: true, message: t("main.inputError", { msg: "状态" }) }]
});

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  statusEnum: []
});
const formData = reactive({
  startTime: "",
  endTime: "",
  deductedMonths: "",
  status: ""
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
};

const handleSubmit = () => {
  ruleFormRef.value!.validate(async (valid: boolean) => {
    if (!valid) return;
    try {
      await batchUpdateMonth(formData);
      drawerVisible.value = false;
      drawerProps.value.getTableList?.();
    } catch (error) {
      console.error(error);
    }
  });
};

defineExpose({
  acceptParams
});
</script>
