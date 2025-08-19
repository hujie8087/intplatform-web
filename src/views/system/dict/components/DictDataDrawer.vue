<template>
  <el-dialog
    v-model="drawerVisible"
    :destroy-on-close="true"
    width="680"
    :title="`${drawerProps.title}${$t('system.dict.dictData')}`"
  >
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
          <el-form-item :label="`${$t('system.dict.dictType')}`" prop="dictType">
            <el-input
              v-model="drawerProps.rowData.dictType"
              :disabled="true"
              :placeholder="`${$t('main.inputError', { msg: $t('system.dict.dictType') })}`"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('system.dict.dictLabel')}`" prop="dictLabel">
            <el-input
              v-model="drawerProps.rowData.dictLabel"
              :placeholder="`${$t('main.inputError', { msg: $t('system.dict.dictLabel') })}`"
              clearable
            >
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('system.dict.dictLabelEn')}`" prop="dictLabelEn">
            <el-input
              v-model="drawerProps.rowData.dictLabelEn"
              :placeholder="`${$t('main.inputError', { msg: $t('system.dict.dictLabelEn') })}`"
              clearable
            >
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('system.dict.dictLabelId')}`" prop="dictLabelId">
            <el-input
              v-model="drawerProps.rowData.dictLabelId"
              :placeholder="`${$t('main.inputError', { msg: $t('system.dict.dictLabelId') })}`"
              clearable
            >
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('system.dict.dictValue')}`" prop="dictValue">
            <el-input
              v-model="drawerProps.rowData.dictValue"
              :placeholder="`${$t('main.inputError', { msg: $t('system.dict.dictValue') })}`"
              clearable
            >
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('system.dict.dictCssClass')}`" prop="cssClass">
            <el-input
              v-model="drawerProps.rowData.cssClass"
              :placeholder="`${$t('main.inputError', { msg: $t('system.dict.dictCssClass') })}`"
              clearable
            >
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('system.dict.dictSort')}`" prop="dictSort">
            <el-input-number
              v-model="drawerProps.rowData.dictSort"
              :placeholder="`${$t('main.inputError', { msg: $t('system.dict.dictSort') })}`"
              :min="0"
              clearable
            >
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('system.dict.dictListClass')}`" prop="listClass">
            <el-select
              v-model="drawerProps.rowData.listClass"
              :placeholder="`${$t('main.selectError', { msg: $t('system.dict.dictListClass') })}`"
            >
              <el-option
                v-for="item in listClassOptions"
                :key="item.value"
                :label="item.label + '(' + item.value + ')'"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('system.dict.status')}`" prop="status">
            <el-radio-group
              v-model="drawerProps.rowData.status"
              :placeholder="`${$t('main.inputError', { msg: $t('system.dict.status') })}`"
            >
              <el-radio label="0">{{ $t("dict.enable") }}</el-radio>
              <el-radio label="1">{{ $t("dict.disable") }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('system.dict.remark')}`" prop="remark">
            <el-input
              v-model="drawerProps.rowData.remark"
              type="textarea"
              :placeholder="`${$t('main.inputError', { msg: $t('system.dict.remark') })}`"
            >
            </el-input>
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

<script setup lang="ts" name="DictDataDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import { Dict } from "@/api/interface/system";
import { listClassOptions } from "@/utils/serviceDict";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  dictType: [{ required: true, message: t("main.inputError", { msg: t("system.dict.dictType") }) }],
  dictLabel: [{ required: true, message: t("main.inputError", { msg: t("system.dict.dataLabel") }) }],
  dictValue: [{ required: true, message: t("main.inputError", { msg: t("system.dict.dataValue") }) }],
  dictSort: [{ required: true, message: t("main.inputError", { msg: t("system.dict.dictSort") }) }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<Dict.ResDictData>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  dictOptions?: Dict.ResDict[];
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  rowData: {
    dictType: "",
    dictLabel: "",
    dictValue: "",
    cssClass: "",
    dictSort: 0,
    listClass: "",
    status: "0",
    remark: ""
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
        message: t("main.successMsg", { title: t("system.dict.dictName"), method: `${drawerProps.value.title}` })
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
