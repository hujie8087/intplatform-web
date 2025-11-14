<template>
  <el-dialog v-model="drawerVisible" width="680" destroy-on-close :title="`${drawerProps.title}${$t('system.role.role')}`">
    <el-form
      ref="ruleFormRef"
      label-width="120px"
      label-suffix=" :"
      :rules="rules"
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
      <el-form-item :label="`${$t('system.role.parentRole')}`" prop="prId">
        <el-tree-select
          v-model="drawerProps.rowData.prId"
          :data="[{ roleId: 0, roleName: 'IWIP后勤综合服务平台', children: drawerProps.roleList }]"
          :placeholder="`${$t('main.inputError', { msg: $t('system.role.parentRole') })}`"
          value-key="roleId"
          :check-strictly="true"
          :props="{ label: 'roleName', children: 'children' }"
        >
        </el-tree-select>
      </el-form-item>
      <el-form-item :label="`${$t('system.role.roleKey')}`" prop="roleKey">
        <el-input
          v-model="drawerProps.rowData.roleKey"
          :placeholder="`${$t('main.inputError', { msg: $t('system.role.roleKey') })}`"
        ></el-input>
      </el-form-item>
      <el-form-item :label="`${$t('system.role.sort')}`" prop="roleSort">
        <el-input-number
          v-model="drawerProps.rowData.roleSort"
          :min="0"
          :placeholder="`${$t('main.inputError', { msg: $t('system.role.sort') })}`"
        ></el-input-number>
      </el-form-item>
      <el-form-item :label="`${$t('system.role.menu')}`" prop="menuIds">
        <el-checkbox label="展开/折叠" @change="val => expandAll(!!val)"></el-checkbox>
        <el-checkbox label="全选/全不选" v-model="checkAll" @change="val => treeAll(!!val)"></el-checkbox>
        <el-checkbox label="父子联动" v-model="checkStrictly"></el-checkbox>
        <el-tree
          ref="treeRef"
          :data="drawerProps.menuList"
          show-checkbox
          node-key="id"
          :default-checked-keys="drawerProps.menuIds"
          :props="{ label: 'label', children: 'children' }"
          :check-strictly="!checkStrictly"
          style="width: 100%; padding: 10px 0; border-radius: 4px; box-shadow: 0 0 0 1px #dcdfe6"
        />
      </el-form-item>
      <el-form-item :label="`${$t('system.role.building')}`" prop="repairAreaId">
        <el-select
          v-model="repairAreaIds"
          multiple
          collapse-tags
          collapse-tags-tooltip
          :max-collapse-tags="5"
          placeholder="请选择"
        >
          <el-option v-for="item in drawerProps.buildingOptions" :label="item.title" :value="item.id" :key="item.id"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="餐厅权限" prop="canteenId">
        <el-select v-model="canteenIds" multiple collapse-tags collapse-tags-tooltip :max-collapse-tags="5" placeholder="请选择">
          <el-option v-for="item in drawerProps.canteenList" :label="item.label" :value="item.value" :key="item.label">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="`${$t('system.role.status')}`" prop="status">
        <el-switch
          v-model="drawerProps.rowData.status"
          inline-prompt
          active-value="0"
          inactive-value="1"
          :active-text="`${$t('dict.enable')}`"
          :inactive-text="`${$t('dict.disable')}`"
        />
      </el-form-item>
      <el-form-item :label="`${$t('system.role.remark')}`" prop="remark">
        <el-input
          v-model="drawerProps.rowData.remark"
          :placeholder="`${$t('main.inputError', { msg: $t('system.role.remark') })}`"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" v-show="!drawerProps.isView" @click="handleSubmit">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="StayDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import { Role } from "@/api/interface/system";
import { Building } from "@/api/interface/productDisplay/building";
import { DictOptions } from "@/api/interface";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  roleSort: [{ required: true, message: t("main.inputError", { msg: t("system.role.sort") }) }],
  roleName: [{ required: true, message: t("main.inputError", { msg: t("system.role.name") }) }],
  roleKey: [{ required: true, message: t("main.inputError", { msg: t("system.role.roleKey") }) }]
});
const repairAreaIds = ref<number[]>([]);
const canteenIds = ref<number[]>([]);
interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Role.ResRole;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  menuList?: Role.ResMenu[];
  menuIds: number[];
  roleList?: Role.ResRole[];
  buildingOptions?: Building.ResBuilding[];
  canteenList?: DictOptions[];
}
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
  },
  menuIds: []
});
const treeRef = ref();

const checkStrictly = ref(false);
const checkAll = ref(false);
const expandAll = (val: boolean) => {
  let nodes = treeRef.value?.store._getAllNodes() || [];
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].expanded = val;
  }
};
const treeAll = (val: boolean) => {
  if (val) {
    treeRef.value!.setCheckedNodes(drawerProps.value.menuList, false);
  } else {
    treeRef.value!.setCheckedNodes([], false);
  }
};

// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  checkStrictly.value = params.rowData.menuCheckStrictly || false; // 父子联动是否勾选
  drawerVisible.value = true;
  repairAreaIds.value = params.rowData.repairAreaId ? params.rowData.repairAreaId?.split("/").map(item => Number(item)) : [];
  drawerProps.value.menuIds = params.menuIds ?? [];
  console.log(drawerProps.value.menuIds);
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    // drawerProps.value.rowData.menuIds = treeRef.value?.getCheckedKeys(false);
    // 2. 获取完全勾选的节点 ID
    const checkedKeys = treeRef.value.getCheckedKeys(false, true);
    const finalKeys = getCheckedWithParents(drawerProps.value.menuList || [], checkedKeys); // 取到父节点id
    try {
      await drawerProps.value.api!({
        ...drawerProps.value.rowData,
        // menuIds: drawerProps.value.rowData.menuIds,
        menuIds: finalKeys,
        menuCheckStrictly: checkStrictly.value ? true : false,
        repairAreaId: repairAreaIds.value.join("/")
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
/**
 * 获取选中的节点和它们所有父节点的 id
 * @param treeData 树形结构数据
 * @param checkedIds 选中的 id 数组
 * @returns 合并后的 id 数组
 */
function getCheckedWithParents(treeData: any[], checkedIds: number[]): number[] {
  const parentMap = new Map<number, number>(); // 子 -> 父 映射

  // 深度遍历树，记录父子关系
  function buildParentMap(nodes: any[], parentId?: number) {
    for (const node of nodes) {
      if (parentId !== undefined) {
        parentMap.set(node.id, parentId);
      }
      if (node.children && node.children.length) {
        buildParentMap(node.children, node.id);
      }
    }
  }
  buildParentMap(treeData);

  const result = new Set<number>();

  // 遍历选中的 id，逐级向上回溯父节点
  checkedIds.forEach(id => {
    let current: number | undefined = id;
    while (current !== undefined) {
      result.add(current);
      current = parentMap.get(current);
    }
  });

  return Array.from(result);
}

defineExpose({
  acceptParams
});
</script>
