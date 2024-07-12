<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="1080" :title="`${drawerProps.title}报修类型`">
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
        <el-col :span="12">
          <el-form-item label="报修类型" prop="name">
            <el-input v-model="drawerProps.rowData.name" placeholder="请填写报修类型" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="状态" prop="status">
            <el-radio-group
              v-model="drawerProps.rowData.status"
              :placeholder="`${$t('main.inputError', { msg: $t('system.notice.status') })}`"
            >
              <el-radio v-for="item in drawerProps.repairTypeStatusOptions" :key="item.value" :label="item.value">{{
                item.label
              }}</el-radio>
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

<script setup lang="ts" name="RepairTypeDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { Repair } from "@/api/interface/service/repair";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  name: [{ required: true, message: t("main.inputError", { msg: "报修类型名称" }) }],
  status: [{ required: true, message: t("main.selectError", { msg: "报修类型状态" }) }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<Repair.ResRepairType>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  noticeTypeOptions?: DictOptions[];
  repairTypeStatusOptions?: DictOptions[];
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
        message: t("main.successMsg", { title: "报修类型", method: `${drawerProps.value.title}` })
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
