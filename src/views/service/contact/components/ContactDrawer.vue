<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}联系人`">
    <el-form ref="ruleFormRef" label-width="120px" label-suffix=" :" :rules="rules" :model="drawerProps.rowData">
      <el-row>
        <!-- 类型 -->
        <el-col :span="12">
          <el-form-item label="类型" prop="souceType">
            <el-select v-model="drawerProps.rowData.souceType" placeholder="请选择类型" clearable>
              <el-option v-for="item in drawerProps.souceTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="负责范围" prop="def1">
            <el-input v-model="drawerProps.rowData.def1" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="drawerProps.rowData.name" />
          </el-form-item>
        </el-col>
        <!-- 联系电话 -->
        <el-col :span="12">
          <el-form-item label="联系电话" prop="tel">
            <el-input v-model="drawerProps.rowData.tel" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input type="email" v-model="drawerProps.rowData.email" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="办公地点" prop="def2">
            <el-input v-model="drawerProps.rowData.def2" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="工作时间" prop="workTime">
            <el-input v-model="drawerProps.rowData.workTime" />
          </el-form-item>
        </el-col>
        <!-- 详情 -->
        <el-col :span="24">
          <el-form-item label="详情" prop="details">
            <el-input type="textarea" :rows="4" v-model="drawerProps.rowData.details" />
          </el-form-item>
        </el-col>
        <!-- 备注 -->
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input type="textarea" :rows="4" v-model="drawerProps.rowData.remark" />
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

<script setup lang="ts" name="ContactDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { Contact } from "@/api/interface/service/contact";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  name: [{ required: true, message: t("main.inputError", { msg: "请填写姓名" }) }],
  tel: [{ required: true, message: t("main.inputError", { msg: "请填写联系电话" }) }]
});

interface DrawerProps {
  title: string;
  rowData: Partial<Contact.ResContact>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  souceTypeOptions?: DictOptions[];
}
// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: "",
  rowData: {},
  souceTypeOptions: []
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  console.log(drawerProps.value.rowData, ruleFormRef.value);
  ruleFormRef.value?.validate(async valid => {
    console.log(drawerProps.value.rowData, valid);
    if (!valid) return;
    const formData = { ...drawerProps.value.rowData };
    try {
      await drawerProps.value.api!(formData);
      ElMessage.success({
        message: t("main.successMsg", { title: "联系人", method: `${drawerProps.value.title}` })
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
