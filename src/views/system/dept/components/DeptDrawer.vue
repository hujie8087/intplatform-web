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
        <el-col :span="24">
          <el-form-item label="上级部门" prop="pid">
            <el-tree-select
              v-model="drawerProps.rowData!.pid"
              ref="treeSelectRef"
              lazy
              :load="loadNode"
              node-key="value"
              check-strictly
              :props="{
                value: 'value',
                label: 'label',
                children: 'children',
                isLeaf: 'isLeaf'
              }"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('system.dept.dept')}`" prop="name">
            <el-input
              v-model="drawerProps.rowData!.name"
              :placeholder="`${$t('main.inputError', { msg: $t('system.dept.dept') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('system.dept.code')}`" prop="code">
            <el-input
              v-model="drawerProps.rowData!.code"
              :placeholder="`${$t('main.inputError', { msg: $t('system.dept.code') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="维度编码" prop="dimensionCode">
            <el-input
              v-model="drawerProps.rowData!.dimensionCode"
              :placeholder="`${$t('main.inputError', { msg: $t('system.dept.dimensionCode') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('system.dept.sort')}`" prop="sort">
            <el-input-number
              v-model="drawerProps.rowData!.sort"
              :placeholder="`${$t('main.inputError', { msg: $t('system.dept.sort') })}`"
              :min="0"
              clearable
            >
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('system.dept.status')}`" prop="status">
            <el-radio-group
              v-model="drawerProps.rowData!.status"
              :placeholder="`${$t('main.inputError', { msg: $t('system.dept.status') })}`"
            >
              <el-radio :label="1">{{ $t("dict.enable") }}</el-radio>
              <el-radio :label="0">{{ $t("dict.disable") }}</el-radio>
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
import { Organize } from "@/api/interface/organize";
import { getOrganizeChildren } from "@/api/modules/organize";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  parentId: [{ required: true, message: t("main.selectError", { msg: t("system.dept.pid") }) }],
  deptName: [{ required: true, message: t("main.inputError", { msg: t("system.dept.dept") }) }],
  orderNum: [{ required: true, message: t("main.inputError", { msg: t("system.dept.sort") }) }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData?: Partial<Organize.ResOrganize>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => any;
  organizeTreeList?: { label: string; value: number; isLeaf: boolean; children?: any[] }[];
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
const treeSelectRef = ref<any>(null);
// 懒加载
const loadNode = (node: any, resolve: any) => {
  // 1. 处理根节点 (第一次加载)
  if (node.level === 0) {
    // 这里必须 resolve 你的第一层数据，否则树是空的
    // 如果你原本传给 :data 的数据就是根节点，可以在这里 resolve 它
    return resolve(drawerProps.value.organizeTreeList);
  } else {
    getOrganizeChildren(node.data.value).then((res: any) => {
      resolve(
        res.data.map(item => {
          return {
            label: item.name,
            value: item.id,
            formatName: item.formatName,
            pid: item.pid,
            isLeaf: item.formatName.indexOf("/") === -1
          };
        })
      );
    });
  }
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
