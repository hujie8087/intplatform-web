<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="1000" :title="`${drawerProps.title}配送员`">
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
          <el-form-item label="姓名" prop="nickName">
            <el-input
              v-model="drawerProps.rowData.nickName"
              :placeholder="`${$t('main.inputError', '姓名')}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="工号" prop="userName">
            <el-input
              v-model="drawerProps.rowData.userName"
              :placeholder="`${$t('main.inputError', '工号')}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="联系电话" prop="tel">
            <el-input
              v-model="drawerProps.rowData.tel"
              :placeholder="`${$t('main.inputError', '联系电话')}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="配送站点" prop="sourceMsgIds">
            <el-select
              v-model="drawerProps.rowData.sourceMsgIds"
              :placeholder="`${$t('main.inputError', '配送站点')}`"
              multiple
              clearable
            >
              <el-option
                v-for="item in drawerProps.deliveryStaffTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
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

<script setup lang="ts" name="DeliveryStaffDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { DeliveryStaff } from "@/api/interface/delivery/staff";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import { DeliveryStation } from "@/api/interface/delivery/station";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  nickName: [{ required: true, message: t("main.inputError", "姓名"), trigger: "blur" }],
  userName: [{ required: true, message: t("main.inputError", "工号"), trigger: "blur" }],
  tel: [{ required: true, message: t("main.inputError", "联系电话"), trigger: "blur" }],
  sourceMsgIds: [{ required: true, message: t("main.inputError", "配送站点"), trigger: "blur" }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<DeliveryStaff.ResDeliveryStaff>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  deliveryStaffTypeOptions?: DictOptions[];
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
  if (!params.rowData.id) {
    drawerProps.value.rowData.status = "0";
  }
  params.rowData.sourceMsgIds = params.rowData.sourceMsgs?.map((item: DeliveryStation.ResDeliveryStation) => item.id) || [];
  drawerVisible.value = true;
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await drawerProps.value.api!({ ...drawerProps.value.rowData });
      ElMessage.success({
        message: t("main.successMsg", { title: "配送员", method: `${drawerProps.value.title}` })
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
