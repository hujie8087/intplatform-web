<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="800" :title="`${drawerProps.title}站点`">
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
        <!-- 来源类型 -->
        <el-col :span="12">
          <el-form-item label="车号" prop="fcName">
            <el-input v-model="drawerProps.rowData.fcName" :placeholder="`${$t('main.inputError', '车号')}`" clearable></el-input>
          </el-form-item>
        </el-col>
        <!-- 状态 -->
        <el-col :span="24">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="drawerProps.rowData.status">
              <el-radio label="0">启用</el-radio>
              <el-radio label="1">禁用</el-radio>
            </el-radio-group>
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

<script setup lang="ts" name="BasicCarInfoDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { BasicCarInfo } from "@/api/interface/mealDelivery/basic/carInfo";
import { useI18n } from "vue-i18n";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  fcId: [{ required: true, message: t("main.inputError", { msg: "车号" }) }],
  status: [{ required: true, message: t("main.selectError", { msg: "状态" }) }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<BasicCarInfo.ResBasicCarInfo>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  rowData: {
    fcName: "",
    fcId: 0,
    status: ""
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
        message: t("main.successMsg", { title: "车辆", method: `${drawerProps.value.title}` })
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
<style scoped>
#map {
  width: 100%;
  height: 600px;
}
</style>
