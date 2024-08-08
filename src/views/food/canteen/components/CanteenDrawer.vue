<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="1080" :title="`${drawerProps.title}餐厅`">
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
          <el-form-item :label="`${$t('system.notice.noticeTitle')}`" prop="noticeTitle">
            <el-input
              v-model="drawerProps.rowData.name"
              :placeholder="`${$t('main.inputError', { msg: $t('system.notice.noticeTitle') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('system.notice.status')}`" prop="status">
            <el-radio-group
              v-model="drawerProps.rowData!.status"
              :placeholder="`${$t('main.inputError', { msg: $t('system.notice.status') })}`"
            >
              <el-radio v-for="item in drawerProps.noticeStatusOptions" :key="item.value" :label="item.value">{{
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

<script setup lang="ts" name="CanteenDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { Canteen } from "@/api/interface/food/canteen";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  noticeName: [{ required: true, message: t("main.inputError", { msg: t("system.notice.noticeName") }) }],
  noticeKey: [{ required: true, message: t("main.inputError", { msg: t("system.notice.noticeKey") }) }],
  noticeValue: [{ required: true, message: t("main.inputError", { msg: t("system.notice.noticeValue") }) }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<Canteen.ResCanteen>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  noticeTypeOptions?: DictOptions[];
  noticeStatusOptions?: DictOptions[];
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  rowData: {
    name: "",
    status: 0,
    createBy: ""
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
        message: t("main.successMsg", { title: t("system.notice.noticeName"), method: `${drawerProps.value.title}` })
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
