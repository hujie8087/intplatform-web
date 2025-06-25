<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="800" :title="`${drawerProps.title}订桌/货架`">
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
          <el-form-item label="订桌/货架名称" prop="name">
            <el-input v-model="drawerProps.rowData!.name" placeholder="请输入订桌/货架名称" clearable></el-input>
          </el-form-item>
        </el-col>
        <!-- 配送区域 -->
        <el-col :span="12">
          <el-form-item label="商店" prop="canteenId">
            <el-select v-model="drawerProps.rowData!.canteenId" placeholder="请选择商店">
              <el-option v-for="item in drawerProps.canteenList" :key="item.value" :label="item.label" :value="item.value">
                {{ item.label }}
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 排序 -->
        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="drawerProps.rowData!.sort" placeholder="请输入排序" :min="0" />
          </el-form-item>
        </el-col>
        <!-- 状态 -->
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-switch v-model="drawerProps.rowData!.status" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </el-col>
        <!-- 状态 -->
        <el-col :span="12">
          <el-form-item label="订桌状态" prop="fullStatus">
            <el-switch v-model="drawerProps.rowData!.fullStatus" :active-value="1" :inactive-value="0" />
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

<script setup lang="ts" name="CanteenDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { OrderPickup } from "@/api/interface/productDisplay/orderPickup";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";

const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  name: [{ required: true, message: t("main.inputError", "订桌/货架名称") }],
  canteenId: [{ required: true, message: t("main.selectError", "商店") }],
  status: [{ required: true, message: t("main.inputError", "状态") }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData?: Partial<OrderPickup.ResOrderPickup>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  canteenList?: DictOptions[];
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
        message: t("main.successMsg", { title: "餐厅", method: `${drawerProps.value.title}` })
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
