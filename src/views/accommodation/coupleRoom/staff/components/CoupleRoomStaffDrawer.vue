<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}人员`">
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
          <el-form-item label="账号" prop="username">
            <el-input
              v-model="drawerProps.rowData.username"
              :placeholder="`${$t('main.inputError', '账号')}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="drawerProps.rowData.name" :placeholder="`${$t('main.inputError', '姓名')}`" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" prop="tel">
            <el-input
              v-model="drawerProps.rowData.tel"
              :placeholder="`${$t('main.inputError', '联系电话')}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别" prop="sex">
            <el-radio-group v-model="drawerProps.rowData.sex">
              <el-radio label="男">男</el-radio>
              <el-radio label="女">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部门" prop="dept">
            <el-input v-model="drawerProps.rowData.dept" :placeholder="`${$t('main.inputError', '部门')}`" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="职位" prop="job">
            <el-input v-model="drawerProps.rowData.job" :placeholder="`${$t('main.inputError', '职位')}`" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="绑定账号" prop="bind">
            <el-input
              v-model="drawerProps.rowData.bind"
              :placeholder="`${$t('main.inputError', '绑定账号')}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="可定次数" prop="num">
            <el-input-number
              v-model="drawerProps.rowData.num"
              :placeholder="`${$t('main.inputError', '可定次数')}`"
              :min="0"
              clearable
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="区域" prop="areaType">
            <el-select
              v-model="areaType"
              multiple
              :placeholder="`${$t('main.inputError', '区域')}`"
              clearable
              @change="handleAreaChange"
            >
              <el-option
                v-for="item in drawerProps.coupleRoomAreaOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input
              type="textarea"
              :rows="4"
              v-model="drawerProps.rowData.remark"
              :placeholder="`${$t('main.inputError', '备注')}`"
              clearable
            ></el-input>
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

<script setup lang="ts" name="CoupleRoomStaffDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { CoupleRoom } from "@/api/interface/service/coupleRoom";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
const { t } = useI18n(); // 解构出t方法
const rules = reactive({
  name: [{ required: true, message: t("main.inputError", "姓名"), trigger: "blur" }],
  username: [{ required: true, message: t("main.inputError", "账号"), trigger: "blur" }],
  tel: [{ required: true, message: t("main.inputError", "联系电话"), trigger: "blur" }],
  areaType: [{ required: true, message: t("main.inputError", "区域"), trigger: "blur" }],
  num: [{ required: true, message: t("main.inputError", "可定次数"), trigger: "blur" }],
  sex: [{ required: true, message: t("main.inputError", "性别"), trigger: "blur" }],
  dept: [{ required: true, message: t("main.inputError", "部门"), trigger: "blur" }],
  job: [{ required: true, message: t("main.inputError", "职位"), trigger: "blur" }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<CoupleRoom.ResStaff>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  coupleRoomAreaOptions?: DictOptions[];
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  rowData: {}
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
  areaType.value = drawerProps.value.rowData.areaType?.split(",").map(Number) || [];
};

const areaType = ref<number[]>([]);

const handleAreaChange = (value: number[]) => {
  drawerProps.value.rowData.areaType = value.join(",");
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await drawerProps.value.api!({ ...drawerProps.value.rowData });
      ElMessage.success({
        message: t("main.successMsg", { title: "人员", method: `${drawerProps.value.title}` })
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
