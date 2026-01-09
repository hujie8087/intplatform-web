<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="800" :title="`${drawerProps.title}菜品`">
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
          <el-form-item label="名称" prop="name">
            <el-input v-model="drawerProps.rowData.name" :placeholder="`${$t('main.inputError', '名称')}`" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="餐食类型" prop="dishType">
            <el-select v-model="drawerProps.rowData.dishType" placeholder="请选择餐食类型" clearable>
              <el-option
                v-for="item in drawerProps.mealTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 状态 -->
        <el-col :span="24">
          <el-form-item label="状态" prop="status">
            <el-switch v-model="drawerProps.rowData.status" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </el-col>
        <!-- 商品图片 -->
        <el-col :span="24">
          <el-form-item label="图片" prop="imageUrl">
            <UploadImg v-model:image-url="drawerProps.rowData.imageUrl" :file-size="5" width="100px" height="100px">
              <template #tip> 上传图片最大为 5M </template>
            </UploadImg>
          </el-form-item>
        </el-col>
        <!-- 描述 -->
        <el-col :span="24">
          <el-form-item label="描述" prop="description">
            <el-input type="textarea" :rows="4" v-model="drawerProps.rowData.description" placeholder="请输入描述" />
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

<script setup lang="ts" name="DailyRecipeDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { Dish } from "@/api/interface/productDisplay/dailyRecipe";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import UploadImg from "@/components/Upload/Img.vue";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  name: [{ required: true, message: t("main.inputError", { msg: "菜品名称" }) }],
  status: [{ required: true, message: t("main.inputError", { msg: "状态" }) }],
  imageUrl: [{ required: true, message: t("main.inputError", { msg: "图片" }) }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<Dish.ResDish>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  statusOptions?: DictOptions[];
  mealTypeOptions?: DictOptions[];
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
        message: t("main.successMsg", { title: "菜品信息", method: `${drawerProps.value.title}` })
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
<style scoped lang="scss">
.param-form-item {
  :deep(.el-form-item__content) {
    display: block;
    width: 100%;
  }
}
</style>
