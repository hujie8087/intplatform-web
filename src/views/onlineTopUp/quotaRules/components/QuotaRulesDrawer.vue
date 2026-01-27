<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="500" :title="`${drawerProps.title}额度规则`">
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
          <el-form-item label="组织名称" prop="organizeFormatName">
            <el-tree-select
              v-model="drawerProps.rowData.formatOrganizeName"
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
        <el-col :span="24">
          <el-form-item label="天额度" prop="dayQuota">
            <el-input v-model="drawerProps.rowData.dayQuota" :min="0" :max="1000000" :step="1" :precision="0" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="月额度" prop="monthQuota">
            <el-input v-model="drawerProps.rowData.monthQuota" :min="0" :max="1000000" :step="1" :precision="0" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="是否计算新员工" prop="enableNewUser">
            <el-switch v-model="drawerProps.rowData.enableNewUser" />
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

<script setup lang="ts" name="QuotaRulesDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { QuotaRules } from "@/api/interface/onlineTopUp";
import { useI18n } from "vue-i18n";
import { getOrganizeChildren } from "@/api/modules/organize";
const { t } = useI18n(); // 解构出t方法
const rules = reactive({
  formatOrganizeName: [{ required: true, message: t("main.inputError", { msg: "组织名称" }) }],
  dayQuota: [{ required: true, message: t("main.inputError", { msg: "天额度" }) }],
  monthQuota: [{ required: true, message: t("main.inputError", { msg: "月额度" }) }],
  enableNewUser: [{ required: true, message: t("main.inputError", { msg: "是否计算新员工" }) }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<QuotaRules.ResQuotaRules>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  organizeTreeList?: { label: string; value: number; isLeaf: boolean; children?: any[] }[];
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  rowData: {
    formatOrganizeName: "",
    dayQuota: "",
    monthQuota: ""
  }
});

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

// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  if (treeSelectRef.value!.getCurrentNode()) {
    drawerProps.value.rowData.formatOrganizeName = treeSelectRef.value!.getCurrentNode().formatName;
    console.log(drawerProps.value.rowData, treeSelectRef.value!.getCurrentNode());
  }
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await drawerProps.value.api!(drawerProps.value.rowData);
      ElMessage.success({
        message: t("main.successMsg", { title: "额度规则", method: `${drawerProps.value.title}` })
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
