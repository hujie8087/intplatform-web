<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}失物招领`">
    <el-form ref="ruleFormRef" label-width="120px" label-suffix=" :" :rules="rules" :model="drawerProps.rowData">
      <el-row>
        <el-col :span="24">
          <el-form-item label="类型" prop="def2">
            <el-select v-model="drawerProps.rowData.def2" placeholder="请选择失物类型" disabled>
              <el-option v-for="item in drawerProps.foundTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="失物名称" prop="lostName">
            <el-input v-model="drawerProps.rowData.lostName" disabled />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="图片" prop="photo">
            <el-image
              v-for="item in drawerProps.rowData.photo?.split(',').map(item => `${fileUrl}${item}`)"
              :key="item"
              :src="item"
              style="width: 100px; height: 100px; margin-right: 10px"
              :preview-teleported="true"
              :preview-src-list="drawerProps.rowData.photo?.split(',').map(item => `${fileUrl}${item}`)"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="drawerProps.rowData.def2 === '0' ? '丢失地点' : '拾取地点'" prop="foundPlace">
            <el-input v-model="drawerProps.rowData.foundPlace" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="拾取人" prop="receiveName">
            <el-input v-model="drawerProps.rowData.receiveName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="drawerProps.rowData.def2 === '0'">
          <el-form-item label="丢失时间" prop="foundTime">
            <el-date-picker v-model="drawerProps.rowData.foundTime" type="datetime" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="drawerProps.rowData.def2 === '1'">
          <el-form-item label="拾取时间" prop="foundTime">
            <el-date-picker v-model="drawerProps.rowData.foundTime" type="datetime" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="drawerProps.rowData.def2 === '0'">
          <el-form-item label="失物联系人" prop="foundName">
            <!-- 选择报修人 -->
            <el-input v-model="drawerProps.rowData.foundName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="联系电话" prop="tel">
            <!-- 选择报修人 -->
            <el-input v-model="drawerProps.rowData.tel" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="领取地点" prop="receivePlace">
            <el-input v-model="drawerProps.rowData.receivePlace" disabled />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="失物描述" prop="def1">
            <el-input type="textarea" :rows="4" v-model="drawerProps.rowData.def1" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="审核状态" prop="reviewStatus">
            <el-radio-group v-model="drawerProps.rowData.reviewStatus">
              <el-radio :label="1">通过</el-radio>
              <el-radio :label="2">驳回</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="审核意见" prop="def3" v-if="drawerProps.rowData.reviewStatus === 2">
            <el-input type="textarea" :rows="4" v-model="drawerProps.rowData.def3" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" @click="handleSubmit">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="ReviewDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { Found } from "@/api/interface/service/found";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
const { t } = useI18n(); // 解构出t方法
const fileUrl = import.meta.env.VITE_APP_BASE_FILE;

const rules = reactive({
  lostName: [{ required: true, message: t("main.inputError", { msg: "请填写失物名称" }) }],
  tel: [{ required: true, message: t("main.inputError", { msg: "请填写联系电话" }) }],
  def2: [{ required: true, message: t("main.inputError", { msg: "请选择失物类型" }) }]
});

interface DrawerProps {
  title: string;
  rowData: Partial<Found.ResFound>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  otherTypeOptions?: DictOptions[];
  foundTypeOptions?: DictOptions[];
  treeData?: {
    [key: string]: any;
  }[];
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: "",
  rowData: {}
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
  drawerProps.value.rowData.reviewStatus = 1;
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    const formData = { ...drawerProps.value.rowData };
    try {
      await drawerProps.value.api!(formData);
      ElMessage.success({
        message: t("main.successMsg", { title: "失物招领", method: `${drawerProps.value.title}审核` })
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
