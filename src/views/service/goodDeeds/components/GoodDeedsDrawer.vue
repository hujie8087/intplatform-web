<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}好人好事`">
    <el-form ref="ruleFormRef" label-width="120px" label-suffix=" :" :rules="rules" :model="drawerProps.rowData">
      <el-row>
        <el-col :span="24">
          <el-form-item label="标题" prop="title">
            <el-input v-model="drawerProps.rowData.title" :disabled="isReview || isView" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="事件描述" prop="description">
            <el-input type="textarea" :rows="4" v-model="drawerProps.rowData.description" :disabled="isReview || isView" />
          </el-form-item>
        </el-col>
        <!-- 好人姓名 -->
        <el-col :span="12">
          <el-form-item label="好人姓名" prop="personName">
            <el-input v-model="drawerProps.rowData.personName" :disabled="isReview || isView" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系方式" prop="contactInfo">
            <!-- 选择报修人 -->
            <el-input v-model="drawerProps.rowData.contactInfo" :disabled="isReview || isView" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="drawerProps.rowData.status" :disabled="isView || isEdit">
              <el-radio v-for="item in drawerProps.goodDeedsStatusOptions" :key="item.value" :label="item.value">{{
                item.label
              }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="isReview">
          <el-form-item label="审核内容" prop="reviewContent">
            <el-input type="textarea" :rows="4" v-model="drawerProps.rowData.reviewContent" />
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

<script setup lang="ts" name="GoodDeedsDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { GoodDeeds } from "@/api/interface/service/goodDeeds";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
const { t } = useI18n(); // 解构出t方法

const isReview = ref(false);
const isEdit = ref(false);
const isView = ref(false);

const rules = reactive({
  title: [{ required: true, message: t("main.inputError", { msg: "请填写标题" }) }],
  description: [{ required: true, message: t("main.inputError", { msg: "请填写事件描述" }) }],
  personName: [{ required: true, message: t("main.inputError", { msg: "请填写好人姓名" }) }],
  contactInfo: [{ required: true, message: t("main.inputError", { msg: "请填写联系方式" }) }],
  status: [{ required: true, message: t("main.inputError", { msg: "请选择状态" }) }],
  reviewContent: [{ required: true, message: t("main.inputError", { msg: "请填写审核内容" }) }]
});

interface DrawerProps {
  title: string;
  rowData: Partial<GoodDeeds.ResGoodDeeds>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  goodDeedsStatusOptions?: DictOptions[];
}
// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: "",
  rowData: {
    status: 0
  }
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
  isReview.value = params.title === "审核";
  isView.value = params.title === "查看";
  isEdit.value = params.title === "编辑";
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
        message: t("main.successMsg", { title: "好人好事", method: `${drawerProps.value.title}` })
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
