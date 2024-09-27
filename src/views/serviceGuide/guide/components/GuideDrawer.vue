<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}服务指南`">
    <el-form ref="ruleFormRef" label-width="120px" label-suffix=" :" :rules="rules" :model="drawerProps.rowData">
      <el-row>
        <el-col :span="24">
          <el-form-item label="服务指南类型" prop="typeId">
            <!-- 选择报修人 -->
            <!-- <el-select v-model="drawerProps.rowData.typeId" /> -->
            <el-select v-model="drawerProps.rowData.typeId" placeholder="请选择">
              <el-option v-for="item in drawerProps.guideTypeOptions" :label="item.label" :value="item.value" :key="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="服务指南标题" prop="title">
            <!-- 选择报修人 -->
            <el-input v-model="drawerProps.rowData.title" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="服务指南说明" prop="content">
            <WangEditor v-model:value="content" />
          </el-form-item>
        </el-col>
        <el-form-item label="服务指南图标" prop="img">
          <SelectMaterialIcon v-model:icon-value="iconValue" />
        </el-form-item>
        <el-col :span="24">
          <el-form-item label="需要登录" prop="isLogin">
            <el-switch
              v-model="drawerProps.rowData.isLogin"
              :active-value="1"
              :inactive-value="0"
              active-color="#13ce66"
              inactive-color="#ff4949"
            >
            </el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="状态" prop="status">
            <el-switch
              v-model="drawerProps.rowData.status"
              active-value="0"
              inactive-value="1"
              active-color="#13ce66"
              inactive-color="#ff4949"
            >
            </el-switch>
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

<script setup lang="ts" name="RepairHandleDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import { Guide } from "@/api/interface/serviceGuide";
import WangEditor from "@/components/WangEditor/index.vue";
import { DictOptions } from "@/api/interface";
import SelectMaterialIcon from "@/components/SelectMaterialIcon/index.vue";
const { t } = useI18n(); // 解构出t方法

const iconValue = ref("");
const rules = reactive({
  repairArea: [{ required: true, message: t("main.inputError", { msg: "报修区域" }) }],
  repairPerson: [{ required: true, message: t("main.selectError", { msg: "报修说明" }) }],
  tel: [{ required: true, message: t("main.selectError", { msg: "报修联系电话" }) }]
});

interface DrawerProps {
  title: string;
  rowData: Partial<Guide.ResGuide>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  guideTypeOptions?: DictOptions[];
}
const content = ref("");
// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: "",
  rowData: {}
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
  content.value = params.rowData.content || "";
  iconValue.value = params.rowData.img || "";
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    const formData = { ...drawerProps.value.rowData, content: content.value, img: iconValue.value };
    try {
      await drawerProps.value.api!(formData);
      ElMessage.success({
        message: t("main.successMsg", { title: "服务指南", method: `${drawerProps.value.title}` })
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
