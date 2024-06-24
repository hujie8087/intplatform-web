<template>
  <el-dialog
    v-model="drawerVisible"
    :destroy-on-close="true"
    width="680"
    :title="`${drawerProps.title}${$t('system.menu.menu')}`"
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
          <el-form-item :label="`${$t('system.menu.pid')}`" prop="parentId">
            <el-tree-select
              v-model="drawerProps.rowData!.parentId"
              :data="drawerProps.menuOptions"
              :props="{ value: 'menuId', label: 'menuName', children: 'children' }"
              value-key="id"
              :placeholder="`${$t('main.selectError', { msg: $t('system.menu.pid') })}`"
              :render-after-expand="false"
              :check-strictly="true"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('system.menu.type')}`" prop="menuType">
            <el-radio-group
              v-model="drawerProps.rowData!.menuType"
              :placeholder="`${$t('main.inputError', { msg: $t('system.menu.type') })}`"
            >
              <el-radio label="M">{{ $t("system.menu.list") }}</el-radio>
              <el-radio label="C">{{ $t("system.menu.menu") }}</el-radio>
              <el-radio label="F">{{ $t("system.menu.button") }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="drawerProps.rowData!.menuType !== 'F'">
          <el-form-item :label="`${$t('system.menu.icon')}`" prop="icon">
            <SelectIcon v-model:iconValue="drawerProps.rowData!.icon" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('system.menu.title')}`" prop="menuName">
            <el-input
              v-model="drawerProps.rowData!.menuName"
              :placeholder="`${$t('main.inputError', { msg: $t('system.menu.title') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('system.menu.sort')}`" prop="orderNum">
            <el-input-number
              v-model="drawerProps.rowData!.orderNum"
              :placeholder="`${$t('main.inputError', { msg: $t('system.menu.sort') })}`"
              :min="0"
              clearable
            >
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="drawerProps.rowData!.menuType !== 'F'">
          <el-form-item :label="`${$t('system.menu.isFrame')}`" prop="isFrame">
            <template #label>
              <el-space :size="4">
                <el-tooltip effect="dark" content="选择是外链则路由地址需要以`http(s)://`开头" placement="top">
                  <i :class="'iconfont icon-yiwen'"></i>
                </el-tooltip>
                <span>{{ $t("system.menu.isFrame") }}</span>
              </el-space>
              <span>&nbsp;:</span>
            </template>
            <el-radio-group
              v-model="drawerProps.rowData!.isFrame"
              :placeholder="`${$t('main.inputError', { msg: $t('system.menu.isFrame') })}`"
            >
              <el-radio label="0">{{ $t("dict.yes") }}</el-radio>
              <el-radio label="1">{{ $t("dict.no") }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="drawerProps.rowData!.menuType !== 'F'">
          <el-form-item :label="`${$t('system.menu.path')}`" prop="path">
            <el-input
              v-model="drawerProps.rowData!.path"
              :placeholder="`${$t('main.inputError', { msg: $t('system.menu.path') })}`"
              clearable
            >
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="drawerProps.rowData!.menuType === 'C'">
          <el-form-item :label="`${$t('system.menu.routing')}`" prop="component">
            <el-input
              v-model="drawerProps.rowData!.component"
              :placeholder="`${$t('main.inputError', { msg: $t('system.menu.routing') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="drawerProps.rowData!.menuType !== 'M'">
          <el-form-item :label="`${$t('system.menu.auth')}`" prop="perms">
            <el-input
              v-model="drawerProps.rowData!.perms"
              :placeholder="`${$t('main.inputError', { msg: $t('system.menu.auth') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="drawerProps.rowData!.menuType !== 'F'">
          <el-form-item :label="`${$t('system.menu.visible')}`" prop="visible">
            <template #label>
              <el-space :size="4">
                <el-tooltip effect="dark" content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问" placement="top">
                  <i :class="'iconfont icon-yiwen'"></i>
                </el-tooltip>
                <span>{{ $t("system.menu.visible") }}</span>
              </el-space>
              <span>&nbsp;:</span>
            </template>
            <el-radio-group
              v-model="drawerProps.rowData!.visible"
              :placeholder="`${$t('main.inputError', { msg: $t('system.menu.visible') })}`"
            >
              <el-radio label="0">{{ $t("dict.visible") }}</el-radio>
              <el-radio label="1">{{ $t("dict.hidden") }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('system.menu.status')}`" prop="status">
            <el-radio-group
              v-model="drawerProps.rowData!.status"
              :placeholder="`${$t('main.inputError', { msg: $t('system.menu.status') })}`"
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
import SelectIcon from "@/components/SelectIcon/index.vue";
import { Menu } from "@/api/interface/system";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  title: [{ required: true, message: t("main.inputError", { msg: t("system.menu.title") }) }],
  name: [{ required: true, message: t("main.inputError", { msg: t("system.menu.name") }) }],
  sort: [{ required: true, message: t("main.selectError", { msg: t("system.menu.sort") }) }],
  path: [{ required: true, message: t("main.selectError", { msg: t("system.menu.path") }) }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData?: Menu.ResMenu;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  menuOptions?: () => Menu.ResMenu[];
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
