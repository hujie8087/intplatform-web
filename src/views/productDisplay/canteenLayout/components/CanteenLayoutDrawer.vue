<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="1000" :title="`${drawerProps.title}订桌`">
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
          <el-form-item label="布局名称" prop="canteen">
            <el-input
              v-model="drawerProps.rowData.canteen"
              :placeholder="`${$t('main.inputError', '桌台名称')}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="绑定餐厅" prop="canteenId">
            <el-select v-model="drawerProps.rowData.canteenId" :placeholder="`${$t('main.inputError', '布局ID')}`" clearable>
              <el-option
                v-for="item in drawerProps.canteenOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="宽度" prop="width">
            <el-input-number
              v-model="drawerProps.rowData.width"
              :placeholder="`${$t('main.inputError', '宽度')}`"
              clearable
              :min="1"
              :max="10000"
              :step="1"
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="高度" prop="height">
            <el-input-number
              v-model="drawerProps.rowData.height"
              :placeholder="`${$t('main.inputError', '高度')}`"
              clearable
              :min="1"
              :max="10000"
              :step="1"
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="状态" prop="status">
            <el-switch v-model="drawerProps.rowData.status" :active-value="0" :inactive-value="1" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input
              type="textarea"
              :rows="4"
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

<script setup lang="ts" name="CanteenLayoutDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { CanteenLayout } from "@/api/interface/productDisplay/canteenLayout";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
const { t } = useI18n(); // 解构出t方法

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<CanteenLayout.ResCanteenLayout>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  canteenOptions: DictOptions[];
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  rowData: {},
  canteenOptions: []
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const rules = reactive({
  canteen: [{ required: true, message: t("main.inputError", { msg: "布局名称" }) }],
  canteenId: [{ required: true, message: t("main.selectError", { msg: "绑定餐厅" }) }],
  width: [{ required: true, message: t("main.inputError", { msg: "宽度" }) }],
  height: [{ required: true, message: t("main.inputError", { msg: "高度" }) }],
  status: [{ required: true, message: t("main.inputError", { msg: "状态" }) }]
});
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await drawerProps.value.api!({ ...drawerProps.value.rowData });
      ElMessage.success({
        message: t("main.successMsg", { title: "桌台", method: `${drawerProps.value.title}` })
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
