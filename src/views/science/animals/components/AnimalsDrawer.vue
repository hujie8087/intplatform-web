<template>
  <el-dialog v-model="drawerVisible" width="680" destroy-on-close :title="`${drawerProps.title}动物科普`">
    <el-form
      ref="ruleFormRef"
      label-width="120px"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="drawerProps.rowData"
      :hide-required-asterisk="drawerProps.isView"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="drawerProps.rowData!.name" :placeholder="`${$t('main.inputError', { msg: '名称' })}`"></el-input>
      </el-form-item>
      <el-form-item label="科属" prop="oId">
        <el-select v-model="drawerProps.rowData!.oId" :placeholder="`${$t('main.inputError', { msg: '科属' })}`">
          <el-option
            v-for="item in drawerProps.organismTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="图片" prop="picture">
        <UploadImg
          v-model:image-url="drawerProps.rowData!.picture"
          :file-size="5"
          width="100px"
          height="100px"
          :api="uploadFlora"
          file-label="file"
        >
          <template #tip> 上传图片最大为 5M </template>
        </UploadImg>
      </el-form-item>
      <el-form-item label="产地" prop="origin">
        <el-input
          type="textarea"
          :rows="5"
          v-model="drawerProps.rowData!.origin"
          :placeholder="`${$t('main.inputError', { msg: '产地' })}`"
        ></el-input>
      </el-form-item>
      <el-form-item label="习性" prop="habit">
        <el-input
          type="textarea"
          :rows="5"
          v-model="drawerProps.rowData!.habit"
          :placeholder="`${$t('main.inputError', { msg: '习性' })}`"
        ></el-input>
      </el-form-item>
      <el-form-item label="食物" prop="food">
        <el-input
          type="textarea"
          :rows="5"
          v-model="drawerProps.rowData!.food"
          :placeholder="`${$t('main.inputError', { msg: '食物' })}`"
        ></el-input>
      </el-form-item>
      <el-form-item label="繁殖" prop="reproduce">
        <el-input
          type="textarea"
          :rows="5"
          v-model="drawerProps.rowData!.reproduce"
          :placeholder="`${$t('main.inputError', { msg: '繁殖' })}`"
        ></el-input>
      </el-form-item>
      <el-form-item label="语言版本" prop="language">
        <el-radio-group v-model="drawerProps.rowData!.language">
          <el-radio
            v-for="item in drawerProps.languageOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-radio>
        </el-radio-group>
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
      <el-form-item label="备注" prop="remark">
        <el-input
          type="textarea"
          :rows="5"
          v-model="drawerProps.rowData!.remark"
          :placeholder="`${$t('main.inputError', { msg: '备注' })}`"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" v-show="!drawerProps.isView" @click="handleSubmit">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="AnimalsDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import { Animals } from "@/api/interface/science/animals";
import { DictOptions } from "@/api/interface";
import { uploadFlora } from "@/api/modules/upload";
const { t } = useI18n(); // 解构出t方法
import UploadImg from "@/components/Upload/Img.vue";

const rules = reactive({
  name: [{ required: true, message: t("main.inputError", { msg: "名称" }) }],
  picture: [{ required: true, message: t("main.inputError", { msg: "图片" }) }],
  language: [{ required: true, message: t("main.inputError", { msg: "语言版本" }) }],
  status: [{ required: true, message: t("main.inputError", { msg: "状态" }) }]
});
interface DrawerProps {
  title: string;
  isView: boolean;
  rowData?: Animals.ResAnimals;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  languageOptions?: DictOptions[];
  organismTypeOptions?: DictOptions[];
}
// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  rowData: {} as Animals.ResAnimals
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
      await drawerProps.value.api!({
        ...drawerProps.value.rowData,
        type: "0"
      });
      ElMessage.success({
        message: t("main.successMsg", { title: "动物科普", method: `${drawerProps.value.title}` })
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
