<template>
  <el-dialog v-model="drawerVisible" width="680" destroy-on-close :title="`${drawerProps.title}生物类型`">
    <el-form
      ref="ruleFormRef"
      label-width="120px"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="drawerProps.rowData"
      :hide-required-asterisk="drawerProps.isView"
    >
      <el-form-item label="类型名称" prop="name">
        <el-input v-model="drawerProps.rowData!.name" :placeholder="`${$t('main.inputError', { msg: '类型名称' })}`"></el-input>
      </el-form-item>
      <el-form-item label="编码" prop="code">
        <el-input v-model="drawerProps.rowData!.code" :placeholder="`${$t('main.inputError', { msg: '编码' })}`"></el-input>
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="drawerProps.rowData!.type" :placeholder="`${$t('main.inputError', { msg: '类型' })}`">
          <el-option
            v-for="item in drawerProps.typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-switch
          v-model="drawerProps.rowData!.status"
          inline-prompt
          active-value="0"
          inactive-value="1"
          :active-text="`${$t('dict.enable')}`"
          :inactive-text="`${$t('dict.disable')}`"
        />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number
          v-model="drawerProps.rowData!.sort"
          :placeholder="`${$t('main.inputError', { msg: '排序' })}`"
        ></el-input-number>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" v-show="!drawerProps.isView" @click="handleSubmit">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="OrganismTypeDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import { OrganismType } from "@/api/interface/science/animals";
import { DictOptions } from "@/api/interface";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  name: [{ required: true, message: t("main.inputError", { msg: "类型名称" }) }],
  type: [{ required: true, message: t("main.inputError", { msg: "类型" }) }],
  code: [{ required: true, message: t("main.inputError", { msg: "编码" }) }]
});
interface DrawerProps {
  title: string;
  isView: boolean;
  rowData?: OrganismType.ResOrganismType;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  typeOptions?: DictOptions[];
  statusOptions?: DictOptions[];
}
// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  rowData: {} as OrganismType.ResOrganismType
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
        message: t("main.successMsg", { title: "生物类型", method: `${drawerProps.value.title}` })
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
