<template>
  <el-dialog v-model="drawerVisible" width="800" :title="`${drawerProps.title}货架`">
    <el-form
      ref="ruleFormRef"
      label-width="120px"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="formData"
      :hide-required-asterisk="drawerProps.isView"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="货架名称" prop="pick">
            <el-input v-model="formData.pick" placeholder="请输入货架名称" clearable></el-input>
          </el-form-item>
        </el-col>
        <!-- 配送区域 -->
        <el-col :span="12">
          <el-form-item label="商店" prop="canteenId">
            <el-select v-model="formData.canteenId" placeholder="请选择商店">
              <el-option v-for="item in drawerProps.canteenList" :key="item.label" :label="item.label" :value="item.value">
                {{ item.label }}
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="货架层数" prop="layers">
            <el-input-number v-model="formData.layers" placeholder="请输入货架层数" :min="0" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="每层数量" prop="num">
            <el-input-number v-model="formData.num" placeholder="请输入每层数量" :min="0" />
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

<script setup lang="ts" name="AddPickupCodeDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { PickupCode } from "@/api/interface/productDisplay/orderPickup";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";

const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  pick: [{ required: true, message: t("main.inputError", "货架名称") }],
  canteenId: [{ required: true, message: t("main.selectError", "商店") }],
  layers: [{ required: true, message: t("main.inputError", "货架层数") }],
  num: [{ required: true, message: t("main.inputError", "货架数量") }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  api?: (params: PickupCode.CreatePickupCode) => Promise<any>;
  getTableList?: () => Promise<any>;
  canteenList?: DictOptions[];
}

const formData = ref<PickupCode.CreatePickupCode>({
  num: 0,
  canteenId: undefined,
  pick: "",
  layers: 0
});

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
  formData.value = {
    num: 0,
    canteenId: undefined,
    pick: "",
    layers: 0
  };
};
// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await drawerProps.value.api!(formData.value);
      ElMessage.success({
        message: t("main.successMsg", { title: "货架", method: `${drawerProps.value.title}` })
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
