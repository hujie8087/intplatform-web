<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}图书`">
    <el-form ref="ruleFormRef" label-width="120px" label-suffix=" :" :rules="rules" :model="drawerProps.rowData">
      <el-row>
        <el-col :span="12">
          <el-form-item label="条形码" prop="code">
            <!-- 选择报修人 -->
            <el-input v-model="drawerProps.rowData.code" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="图书名称" prop="bookName">
            <!-- 选择报修人 -->
            <el-input v-model="drawerProps.rowData.bookName" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="图书编号" prop="bookNo">
            <!-- 选择报修人 -->
            <el-input v-model="drawerProps.rowData.bookNo" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="作者" prop="author">
            <el-input v-model="drawerProps.rowData!.author" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="出版社" prop="publisher">
            <el-input v-model="drawerProps.rowData.publisher" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="出版日期" prop="publicationDate">
            <el-date-picker
              v-model="drawerProps.rowData.publicationDate"
              type="month"
              value-format="YYYY-MM"
              placeholder="请选择出版日期"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="版本" prop="edition">
            <el-input v-model="drawerProps.rowData.edition" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="尺寸" prop="size">
            <el-input v-model="drawerProps.rowData.size" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="折扣价" prop="discountedPrice">
            <el-input v-model="drawerProps.rowData.discountedPrice" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="原价" prop="originalPrice">
            <el-input v-model="drawerProps.rowData.originalPrice" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="馆藏日期" prop="museumDate">
            <el-date-picker v-model="drawerProps.rowData.museumDate" type="date" placeholder="请选择馆藏日期" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="类型编号" prop="typeNo">
            <el-input v-model="drawerProps.rowData.typeNo" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="馆藏编号" prop="rCode">
            <el-select v-model="drawerProps.rowData.rCode" placeholder="请选择馆藏编号">
              <el-option
                v-for="item in drawerProps.bookAddressOptions"
                :key="item.value as string"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="批次" prop="batch">
            <el-input v-model="drawerProps.rowData.batch" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input type="textarea" :rows="4" v-model="drawerProps.rowData.remark" clearable />
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

<script setup lang="ts" name="BooksDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { Book } from "@/api/interface/service/book";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  code: [{ required: true, message: t("main.inputError", { msg: "请填写条形码" }) }],
  bookName: [{ required: true, message: t("main.inputError", { msg: "请填写图书名称" }) }],
  bookNo: [{ required: true, message: t("main.inputError", { msg: "请填写标准书号" }) }],
  author: [{ required: true, message: t("main.inputError", { msg: "请填写作者" }) }],
  museumDate: [{ required: true, message: t("main.inputError", { msg: "请选择馆藏日期" }) }],
  typeNo: [{ required: true, message: t("main.inputError", { msg: "请填写类型编号" }) }],
  rCode: [{ required: true, message: t("main.selectError", { msg: "请选择馆藏编号" }) }],
  batch: [{ required: true, message: t("main.inputError", { msg: "请填写批次" }) }]
});

interface DrawerProps {
  title: string;
  rowData: Partial<Book.ResBook>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  bookAddressOptions?: DictOptions[];
}
// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: "",
  rowData: {}
});
const details = ref("");
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
    const formData = { ...drawerProps.value.rowData, details: details.value };
    try {
      await drawerProps.value.api!(formData);
      ElMessage.success({
        message: t("main.successMsg", { title: "图书", method: `${drawerProps.value.title}` })
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
