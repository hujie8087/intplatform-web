<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="680" :title="`${drawerProps.title}商品类型`">
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
          <el-form-item label="商品名称" prop="name">
            <el-input
              v-model="drawerProps.rowData.name"
              :placeholder="`${$t('main.inputError', { msg: '商品类型名称' })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="商品编码" prop="code">
            <el-input
              v-model="drawerProps.rowData.code"
              :placeholder="`${$t('main.inputError', { msg: '商品编码' })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="商品价格" prop="price">
            <!-- 控制只能填整数数字 -->
            <el-input
              v-model="drawerProps.rowData.price"
              :placeholder="`${$t('main.inputError', { msg: '商品价格' })}`"
              clearable
              @input="handleInput"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="商品规格" prop="spec">
            <el-input
              v-model="drawerProps.rowData.spec"
              :placeholder="`${$t('main.inputError', { msg: '商品规格' })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="商品列表图片" prop="listImage">
            <UploadImg v-model:image-url="drawerProps.rowData.listImage" :file-size="3" width="100px" height="100px">
              <template #tip> 上传图片最大为 3M </template>
            </UploadImg>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="商品详情图片" prop="fileList1">
            <UploadImgs v-model:file-list="fileList1" width="100px" height="100px" @update:file-list="updateImage">
              <template #empty>
                <el-icon><Picture /></el-icon>
                <span>请上传商品详情图片</span>
              </template>
              <template #tip> 长方形组件（可拖拽上传） </template>
            </UploadImgs>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input type="textarea" v-model="drawerProps.rowData.remark" placeholder=""></el-input>
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

<script setup lang="ts" name="GoodsDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import { Goods } from "@/api/interface/commonality";
import UploadImg from "@/components/Upload/Img.vue";
import UploadImgs from "@/components/Upload/Imgs.vue";
import { watch } from "vue";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  name: [{ required: true, message: t("main.inputError", { msg: "商品名称" }) }],
  code: [{ required: true, message: t("main.inputError", { msg: "商品编码" }) }],
  price: [{ required: true, message: t("main.inputError", { msg: "商品价格" }) }]
});
const fileList1 = ref<any[]>([]);
interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<Goods.ResGoods>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  rowData: {}
});

// 监视fileList1变化
watch(fileList1, newVal => {
  console.log(newVal);

  drawerProps.value.rowData.detailImage = newVal.map(item => item.url).join(",");
});

// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
  fileList1.value =
    drawerProps.value.rowData.detailImage?.split(",").map((item, index) => {
      return {
        name: index,
        url: item,
        uid: index,
        status: "done"
      };
    }) || [];
};

const updateImage = value => {
  fileList1.value = value.map(item => {
    return {
      name: item.name,
      url: item.url || item.response.url
    };
  });
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      drawerProps.value.rowData.detailImage = fileList1.value.map(item => item.url).join(",");
      await drawerProps.value.api!(drawerProps.value.rowData);
      ElMessage.success({
        message: t("main.successMsg", { title: "商品", method: `${drawerProps.value.title}` })
      });
      drawerProps.value.getTableList!();
      drawerVisible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};
// 处理输入事件的方法
const handleInput = value => {
  // 只允许输入数字
  const parsedValue = value.replace(/[^0-9]/g, "");
  drawerProps.value.rowData.price = parsedValue;
};
defineExpose({
  acceptParams
});
</script>
