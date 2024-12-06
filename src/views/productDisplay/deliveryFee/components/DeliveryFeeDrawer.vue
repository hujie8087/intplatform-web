<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="500" :title="`${drawerProps.title}配送费`">
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
          <el-form-item label="配送费名称" prop="name">
            <el-input
              v-model="drawerProps.rowData.name"
              :placeholder="`${$t('main.inputError', '配送费名称')}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="配送费价格" prop="price">
            <el-input-number
              v-model="drawerProps.rowData.price"
              :placeholder="`${$t('main.inputError', '配送费价格')}`"
              clearable
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="计费条件" prop="billingConditions">
            <el-input
              v-model="drawerProps.rowData.billingConditions"
              :placeholder="`${$t('main.inputError', '计费条件')}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input
              type="textarea"
              rows="4"
              v-model="drawerProps.rowData.remark"
              :placeholder="`${$t('main.inputError', '备注')}`"
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

<script setup lang="ts" name="DeliveryFeeDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { DeliveryFee } from "@/api/interface/productDisplay/deliveryFee";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  name: [{ required: true, message: t("main.inputError", { msg: "配送费名称" }) }],
  price: [{ required: true, message: t("main.inputError", { msg: "配送费价格" }) }],
  billingConditions: [{ required: true, message: t("main.inputError", { msg: "计费条件" }) }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<DeliveryFee.ResDeliveryFee>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  noticeTypeOptions?: DictOptions[];
  noticeStatusOptions?: DictOptions[];
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  rowData: {
    name: "",
    price: 0,
    billingConditions: ""
  }
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
        message: t("main.successMsg", { title: "配送费", method: `${drawerProps.value.title}` })
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
