<template>
  <el-dialog v-model="drawerVisible" width="680" destroy-on-close :title="`${drawerProps.title}${$t('system.role.role')}`">
    <el-form
      ref="ruleFormRef"
      label-width="120px"
      label-suffix=" :"
      :disabled="drawerProps.isView"
      :model="drawerProps.rowData"
      :hide-required-asterisk="drawerProps.isView"
    >
      <el-form-item :label="`${$t('system.role.name')}`" prop="name">
        <el-input
          v-model="drawerProps.rowData.roleName"
          :placeholder="`${$t('main.inputError', { msg: $t('system.role.name') })}`"
        ></el-input>
      </el-form-item>
      <el-form-item :label="`${$t('system.role.roleKey')}`" prop="roleKey">
        <el-input
          v-model="drawerProps.rowData.roleKey"
          :placeholder="`${$t('main.inputError', { msg: $t('system.role.roleKey') })}`"
        ></el-input>
      </el-form-item>
      <el-form-item :label="`${$t('system.role.roleKey')}`" prop="roleKey">
        <el-input
          v-model="drawerProps.rowData.roleKey"
          :placeholder="`${$t('main.inputError', { msg: $t('system.role.roleKey') })}`"
        ></el-input>
      </el-form-item>
      <el-form-item label="权限范围" prop="dataScope">
        <el-select v-model="drawerProps.rowData.dataScope" placeholder="请选择数据范围">
          <el-option v-for="item in dataScopeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="数据权限" v-show="drawerProps.rowData.dataScope === '2'">
        <el-checkbox label="展开/折叠" @change="val => expandAll(!!val)"></el-checkbox>
        <el-checkbox label="全选/全不选" v-model="checkAll" @change="val => treeAll(!!val)"></el-checkbox>
        <el-checkbox label="父子联动" v-model="checkStrictly"></el-checkbox>
        <el-tree
          ref="treeRef"
          :data="drawerProps.deptOptions"
          show-checkbox
          node-key="id"
          :props="{ label: 'label', children: 'children' }"
          :check-strictly="!checkStrictly"
          style="width: 100%; padding: 10px 0; border-radius: 4px; box-shadow: 0 0 0 1px #dcdfe6"
        />
      </el-form-item>
      <el-form-item label="数据权限" v-show="drawerProps.rowData.dataScope == '6'">
        <el-table
          ref="messHall"
          :data="drawerProps.messHallOptions"
          style="width: 100%"
          max-height="250"
          @selection-change="handleMessHallSelectionChange"
        >
          <el-table-column type="selection" width="80" align="center" />
          <el-table-column property="fdName" label="食堂名称" align="center" />
        </el-table>
      </el-form-item>
      <el-form-item label="数据权限" v-show="drawerProps.rowData.dataScope == '7'">
        <el-table
          ref="car"
          :data="drawerProps.carOptions"
          style="width: 100%"
          max-height="250"
          @selection-change="handleCarSelectionChange"
        >
          <el-table-column type="selection" width="80" align="center" />
          <el-table-column property="fcName" label="车号名称" align="center" />
        </el-table>
      </el-form-item>
      <el-form-item label="数据权限" v-show="drawerProps.rowData.dataScope == '8'">
        <el-table
          ref="site"
          :data="drawerProps.siteOptions"
          style="width: 100%"
          max-height="250"
          @selection-change="handleSiteSelectionChange"
        >
          <el-table-column type="selection" width="80" align="center" />
          <el-table-column property="fsName" label="站点名称" align="center" />
        </el-table>
      </el-form-item>
      <el-form-item label="数据权限" v-show="drawerProps.rowData.dataScope == '9'">
        <el-table
          ref="company"
          :data="drawerProps.companyOptions"
          style="width: 100%"
          max-height="250"
          @selection-change="handleCompanySelectionChange"
        >
          <el-table-column type="selection" width="80" align="center" />
          <el-table-column property="companyName" label="公司名称" align="center" />
        </el-table>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" v-show="!drawerProps.isView" @click="handleSubmit">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="DataRoleDrawer">
import { ref } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import { Role } from "@/api/interface/system";
import { Dept } from "@/api/interface/mealDelivery/system/dept";
const { t } = useI18n(); // 解构出t方法

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Role.ResRole;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  deptOptions?: Dept.ResDept[];
  messHallOptions?: any[];
  carOptions?: any[];
  siteOptions?: any[];
  companyOptions?: any[];
}

const dataScopeOptions = [
  {
    value: "1",
    label: "全部数据权限"
  },
  {
    value: "2",
    label: "自定数据权限"
  },
  {
    value: "3",
    label: "本部门数据权限"
  },
  {
    value: "4",
    label: "本部门及以下数据权限"
  },
  {
    value: "5",
    label: "仅本人数据权限"
  },
  {
    value: "6",
    label: "食堂数据权限"
  },
  {
    value: "7",
    label: "车号数据权限"
  },
  {
    value: "8",
    label: "站点数据权限"
  },
  {
    value: "9",
    label: "公司数据权限"
  }
];
// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  rowData: {
    remark: "",
    roleId: 0,
    roleName: "",
    roleKey: "",
    roleSort: 0,
    status: "0",
    menuIds: []
  }
});

const checkStrictly = ref(true);
const checkAll = ref(false);
const treeRef = ref<any>();
const expandAll = (val: boolean) => {
  let nodes = treeRef.value?.store._getAllNodes() || [];
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].expanded = val;
  }
};
const treeAll = (val: boolean) => {
  if (val) {
    treeRef.value!.setCheckedNodes(drawerProps.value.deptOptions, false);
  } else {
    treeRef.value!.setCheckedNodes([], false);
  }
};
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
};

const fdIds = ref<number[]>([]);
const handleMessHallSelectionChange = (val: any) => {
  fdIds.value = val.map((item: any) => item.fdId);
};

const fcIds = ref<number[]>([]);
const handleCarSelectionChange = (val: any) => {
  fcIds.value = val.map((item: any) => item.fcId);
};

const fsIds = ref<number[]>([]);
const handleSiteSelectionChange = (val: any) => {
  fsIds.value = val.map((item: any) => item.fsId);
};

const companyIds = ref<number[]>([]);
const handleCompanySelectionChange = (val: any) => {
  companyIds.value = val.map((item: any) => item.companyId);
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await drawerProps.value.api!({
        ...drawerProps.value.rowData
      });
      ElMessage.success({
        message: t("main.successMsg", { title: t("system.role.role"), method: `${drawerProps.value.title}` })
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
