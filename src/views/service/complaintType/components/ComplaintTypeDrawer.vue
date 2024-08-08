<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}投诉与建议类型`">
    <el-form ref="ruleFormRef" label-width="120px" label-suffix=" :" :rules="rules" :model="drawerProps.rowData">
      <el-row>
        <el-col :span="24">
          <el-form-item label="类型名称" prop="name">
            <!-- 类型名称 -->
            <el-input v-model="drawerProps.rowData.name" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="状态" prop="status">
            <el-radio-group
              v-model="drawerProps.rowData.status"
              :placeholder="`${$t('main.inputError', { msg: $t('system.notice.status') })}`"
            >
              <el-radio v-for="item in drawerProps.complaintTypeStatusOptions" :key="item.value" :label="item.value">{{
                item.label
              }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input type="textarea" :rows="4" v-model="drawerProps.rowData.remark" clearable />
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

<script setup lang="ts" name="ComplaintDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { Complaint } from "@/api/interface/service/complaint";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  name: [{ required: true, message: t("main.inputError", { msg: "请填写类型名称" }) }]
});

interface DrawerProps {
  title: string;
  rowData: Partial<Complaint.ResComplaintType>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  complaintTypeStatusOptions?: DictOptions[];
}

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
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    const formData = { ...drawerProps.value.rowData };
    try {
      await drawerProps.value.api!(formData);
      ElMessage.success({
        message: t("main.successMsg", { title: "投诉与建议类型", method: `${drawerProps.value.title}` })
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
