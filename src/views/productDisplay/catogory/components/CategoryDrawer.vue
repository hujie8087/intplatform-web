<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="500" :title="`${drawerProps.title}菜品分类`">
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
          <el-form-item label="菜品分类名称" prop="name">
            <el-input
              v-model="drawerProps.rowData.name"
              :placeholder="`${$t('main.inputError', '菜品分类名称')}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <!-- 所属餐厅 -->
        <el-col :span="24">
          <el-form-item label="所属餐厅" prop="canteenId">
            <el-select v-model="drawerProps.rowData.canteenId" placeholder="请选择所属餐厅">
              <el-option v-for="item in drawerProps.canteenOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <!-- 排序 -->
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="drawerProps.rowData.sort" :min="0" :max="1000000" :step="1" :precision="0" />
          </el-form-item>
        </el-col>
        <!-- 状态 -->
        <el-col :span="24">
          <el-form-item label="状态" prop="status">
            <el-switch v-model="drawerProps.rowData.status" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </el-col>
        <!-- 备注 -->
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input type="textarea" rows="4" v-model="drawerProps.rowData.remark" placeholder="请输入备注" />
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

<script setup lang="ts" name="CategoryDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { Category } from "@/api/interface/productDisplay/catogory";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  name: [{ required: true, message: t("main.inputError", { msg: "分类名称" }) }],
  sort: [{ required: true, message: t("main.inputError", { msg: "排序" }) }],
  canteenId: [{ required: true, message: t("main.inputError", { msg: "所属餐厅" }) }],
  status: [{ required: true, message: t("main.inputError", { msg: "状态" }) }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<Category.ResCategory>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  canteenOptions?: DictOptions[];
  statusOptions?: DictOptions[];
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  rowData: {
    name: ""
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
        message: t("main.successMsg", { title: "菜品分类", method: `${drawerProps.value.title}` })
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
