<template>
  <el-dialog
    v-model="drawerVisible"
    :destroy-on-close="true"
    width="680"
    :title="`${drawerProps.title}${$t('system.dept.dept')}`"
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
        <el-col :span="24" v-if="drawerProps.rowData!.deptId !== 100">
          <el-form-item :label="`${$t('system.dept.pid')}`" prop="parentId">
            <el-tree-select
              v-model="drawerProps.rowData!.parentId"
              :data="drawerProps.deptOptions"
              :props="{ value: 'deptId', label: 'deptName', children: 'children' }"
              value-key="deptId"
              :placeholder="`${$t('main.selectError', { msg: $t('system.dept.pid') })}`"
              :render-after-expand="false"
              :check-strictly="true"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('system.dept.dept')}`" prop="deptName">
            <el-input
              v-model="drawerProps.rowData!.deptName"
              :placeholder="`${$t('main.inputError', { msg: $t('system.dept.dept') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('system.dept.sort')}`" prop="orderNum">
            <el-input-number
              v-model="drawerProps.rowData!.orderNum"
              :placeholder="`${$t('main.inputError', { msg: $t('system.dept.sort') })}`"
              :min="0"
              clearable
            >
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('system.dept.leader')}`" prop="leader">
            <el-input
              v-model="drawerProps.rowData!.leader"
              :placeholder="`${$t('main.inputError', { msg: $t('system.dept.leader') })}`"
              clearable
            >
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('system.dept.phone')}`" prop="phone">
            <el-input
              v-model="drawerProps.rowData!.phone"
              :placeholder="`${$t('main.inputError', { msg: $t('system.dept.phone') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('system.dept.email')}`" prop="email">
            <el-input
              v-model="drawerProps.rowData!.email"
              :placeholder="`${$t('main.inputError', { msg: $t('system.dept.auth') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('system.dept.status')}`" prop="status">
            <el-radio-group
              v-model="drawerProps.rowData!.status"
              :placeholder="`${$t('main.inputError', { msg: $t('system.dept.status') })}`"
            >
              <el-radio label="0">{{ $t("dict.enable") }}</el-radio>
              <el-radio label="1">{{ $t("dict.disable") }}</el-radio>
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

<script setup lang="ts" name="MenuDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import { Dept } from "@/api/interface/system";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  parentId: [{ required: true, message: t("main.selectError", { msg: t("system.dept.pid") }) }],
  deptName: [{ required: true, message: t("main.inputError", { msg: t("system.dept.dept") }) }],
  orderNum: [{ required: true, message: t("main.inputError", { msg: t("system.dept.sort") }) }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData?: Partial<Dept.ResDept>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  deptOptions?: Dept.ResDept[];
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: ""
});

// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
  console.log(drawerProps.value);
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await drawerProps.value.api!(drawerProps.value.rowData);
      ElMessage.success({
        message: t("main.successMsg", { title: t("system.menu.menu"), method: `${drawerProps.value.title}` })
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
