<template>
  <el-dialog
    v-model="drawerVisible"
    :destroy-on-close="true"
    width="680"
    :title="`${drawerProps.title}${$t('employee.employee')}`"
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
        <el-col :span="12">
          <el-form-item :label="`${$t('employee.jobNumber')}`" prop="jobNumber">
            <el-input
              v-model="drawerProps.rowData!.jobNumber"
              :placeholder="`${$t('main.inputError', { msg: $t('employee.jobNumber') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('employee.username')}`" prop="username">
            <el-input
              v-model="drawerProps.rowData!.username"
              :placeholder="`${$t('main.inputError', { msg: $t('employee.username') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('employee.dept')}`" prop="deptId">
            <el-tree-select
              v-model="deptId"
              :data="drawerProps.deptList"
              :props="{ value: 'id', label: 'label', children: 'children' }"
              value-key="id"
              :filterable="true"
              placeholder="请选择部门"
              check-strictly
            >
              <template #default="{ data }">
                {{ data.shortLabel }}
              </template>
            </el-tree-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('employee.company')}`" prop="companyId">
            <el-select
              v-model="drawerProps.rowData!.companyId"
              :placeholder="`${$t('main.selectError', { msg: $t('employee.company') })}`"
              clearable
              filterable
              style="width: 100%"
            >
              <el-option v-for="item in drawerProps.companyOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('employee.nationType')}`" prop="nationType">
            <el-select
              v-model="drawerProps.rowData!.nationType"
              :placeholder="`${$t('main.selectError', { msg: $t('employee.nationType') })}`"
              clearable
              style="width: 100%"
            >
              <el-option v-for="item in drawerProps.nationOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('employee.postName')}`" prop="postId">
            <el-select
              v-model="drawerProps.rowData!.postId"
              :placeholder="`${$t('main.selectError', { msg: $t('employee.postName') })}`"
              clearable
              style="width: 100%"
            >
              <el-option v-for="item in drawerProps.postOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('employee.sex')}`" prop="sex">
            <el-select
              v-model="drawerProps.rowData!.sex"
              :placeholder="`${$t('main.selectError', { msg: $t('employee.sex') })}`"
              clearable
              style="width: 100%"
            >
              <el-option v-for="item in genderType" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('employee.phone')}`" prop="phone">
            <el-input
              v-model="drawerProps.rowData!.phone"
              :placeholder="`${$t('main.inputError', { msg: $t('employee.phone') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('employee.status')}`" prop="status">
            <el-radio-group v-model="drawerProps.rowData!.status">
              <el-radio value="0">{{ $t("dict.enable") }}</el-radio>
              <el-radio value="1">{{ $t("dict.disable") }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('employee.religion')}`" prop="religion">
            <el-select
              v-model="drawerProps.rowData!.religion"
              :placeholder="`${$t('main.selectError', { msg: $t('employee.religion') })}`"
              clearable
              style="width: 100%"
            >
              <el-option v-for="item in religionOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('main.remark')}`" prop="remark">
            <el-input
              type="textarea"
              :rows="3"
              v-model="drawerProps.rowData!.remark"
              :placeholder="`${$t('main.inputError', { msg: $t('main.remark') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="closeDrawer">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" v-show="!drawerProps.isView" @click="handleSubmit">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="EmployeeDrawer">
import { ref, reactive } from "vue";
import { genderType, religionOptions } from "@/utils/serviceDict";
import { ElMessage, FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import { Employee } from "@/api/interface/mealDelivery/system/employee";
import { DictOptions } from "@/api/interface";

const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  jobNumber: [{ required: true, message: t("main.inputError", { msg: t("employee.jobNumber") }) }],
  username: [{ required: true, message: t("main.inputError", { msg: t("employee.username") }) }],
  companyName: [{ required: true, message: t("main.selectError", { msg: t("employee.company") }) }],
  nationType: [{ required: true, message: t("main.selectError", { msg: t("employee.nationType") }) }],
  religion: [{ required: true, message: t("main.selectError", { msg: t("employee.religion") }) }],
  deptId: [{ required: true, message: t("main.selectError", { msg: t("employee.dept") }) }]
});

const deptId = ref<number>(0);
// 性能优化：部门数据缓存
const deptCache = ref<Map<string, any>>(new Map());

// 性能优化：计算属性，优化部门数据渲染
// const optimizedDeptList = computed(() => {
//   if (!drawerProps.value.deptList) return [];

//   // 对于中等数据量，只返回顶级部门
//   const deptList = drawerProps.value.deptList;
//   if (deptList.length > 50) {
//     return deptList.filter(dept => !dept.parentId || dept.parentId === 0);
//   }

//   return deptList;
// });

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData?: Partial<Employee.ResEmployee>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  deptList?: {
    [key: string]: any;
  }[];
  nationOptions?: DictOptions[];
  companyOptions?: DictOptions[];
  postOptions?: DictOptions[];
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  deptList: []
});

// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
  deptId.value = drawerProps.value.rowData!.deptId ? +drawerProps.value.rowData!.deptId : 0;

  // 性能优化：缓存部门数据
  if (params.deptList && params.deptList.length > 0) {
    const cacheKey = JSON.stringify(params.deptList.map(dept => ({ id: dept.deptId, name: dept.deptName })));
    if (!deptCache.value.has(cacheKey)) {
      deptCache.value.set(cacheKey, params.deptList);
    }
  }
};
const closeDrawer = () => {
  drawerVisible.value = false;
  deptId.value = 0;
};
// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await drawerProps.value.api!({ ...drawerProps.value.rowData, deptId: deptId.value });
      ElMessage.success({
        message: t("main.successMsg", { title: t("system.user.user"), method: `${drawerProps.value.title}` })
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

<style scoped>
.tree-option {
  display: flex;
  align-items: center;
}
.tree-icon {
  display: inline-block;
  width: 1em;
  margin-right: 4px;
  text-align: center;
}

/* 性能优化：限制下拉框最大高度 */
:deep(.el-select-dropdown) {
  max-height: 300px;
}
</style>
