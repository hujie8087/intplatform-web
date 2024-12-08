<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="800" :title="`${drawerProps.title}菜品分类`">
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
        <el-col :span="8">
          <el-form-item label="商品编码" prop="code">
            <el-input
              v-model="drawerProps.rowData.code"
              :placeholder="`${$t('main.inputError', '商品编码')}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="商品名称" prop="name">
            <el-input
              v-model="drawerProps.rowData.name"
              :placeholder="`${$t('main.inputError', '商品名称')}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <!-- 状态 -->
        <el-col :span="8">
          <el-form-item label="状态" prop="status">
            <el-switch v-model="drawerProps.rowData.status" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="价格" prop="price">
            <el-input-number v-model="drawerProps.rowData.price" :placeholder="`${$t('main.inputError', '价格')}`" clearable />
          </el-form-item>
        </el-col>
        <!-- 库存 -->
        <el-col :span="8">
          <el-form-item label="库存" prop="stock">
            <el-input-number v-model="drawerProps.rowData.stock" :placeholder="`${$t('main.inputError', '库存')}`" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <!-- 排序 -->
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="drawerProps.rowData.sort" :min="0" :max="1000000" :step="1" :precision="0" />
          </el-form-item>
        </el-col>
        <!-- 所属餐厅 -->
        <el-col :span="8">
          <el-form-item label="所属商店" prop="canteenId">
            <el-select
              v-model="drawerProps.rowData.canteenId"
              placeholder="请选择所属商店"
              @change="val => handleCanteenChange(val)"
            >
              <el-option v-for="item in drawerProps.canteenOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 商品分类 -->
        <el-col :span="8">
          <el-form-item label="商品分类" prop="categoryId">
            <el-select
              v-model="drawerProps.rowData.categoryId"
              placeholder="请选择商品分类"
              clearable
              :disabled="!drawerProps.rowData.canteenId"
            >
              <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 商品图片 -->
        <el-col :span="24">
          <el-form-item label="商品图片" prop="image">
            <UploadImg v-model:image-url="drawerProps.rowData.image" :file-size="5" width="100px" height="100px">
              <template #tip> 上传图片最大为 5M </template>
            </UploadImg>
          </el-form-item>
        </el-col>
        <!-- 商品参数 -->
        <el-col :span="24">
          <el-form-item label="商品参数" prop="params" class="param-form-item">
            <el-button type="primary" @click="handleAddParam" style="margin-bottom: 10px">新增</el-button>
            <el-table :data="drawerProps.rowData.commodityParameterList" border>
              <el-table-column label="名称" prop="name">
                <template #default="scope">
                  <el-input v-model="scope.row.name" placeholder="请输入名称" />
                </template>
              </el-table-column>
              <el-table-column label="价格" prop="price">
                <template #default="scope">
                  <el-input-number v-model="scope.row.price" :disabled="scope.row.type === 2" placeholder="请输入价格" />
                </template>
              </el-table-column>
              <el-table-column label="类型" prop="type">
                <template #default="scope">
                  <el-select v-model="scope.row.type" placeholder="请选择类型" clearable>
                    <el-option label="份量" :value="1" />
                    <el-option label="口味" :value="2" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="操作" prop="action">
                <template #default="scope">
                  <el-button type="danger" size="small" @click="handleDeleteParam(scope.row, scope.$index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
        </el-col>
        <!-- 备注 -->
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input type="textarea" rows="4" v-model="drawerProps.rowData.remark" placeholder="请输入备注" />
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

<script setup lang="ts" name="CommodityDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { Commodity } from "@/api/interface/productDisplay/commodity";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
import UploadImg from "@/components/Upload/Img.vue";
import { getCategoryListOptions } from "@/api/modules/productDisplay/marketCanteen";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  name: [{ required: true, message: t("main.inputError", { msg: "菜品名称" }) }],
  sort: [{ required: true, message: t("main.inputError", { msg: "排序" }) }],
  canteenId: [{ required: true, message: t("main.inputError", { msg: "所属餐厅" }) }],
  status: [{ required: true, message: t("main.inputError", { msg: "状态" }) }]
});

const categoryOptions = ref<DictOptions[]>([]);
const getCategoryList = async (canteenId: number) => {
  const res = await getCategoryListOptions(canteenId);
  categoryOptions.value = res.data.map(item => ({ label: item.name, value: item.id }));
};

const handleCanteenChange = (canteenId: number) => {
  getCategoryList(canteenId);
};
interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<Commodity.ResCommodity>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  canteenOptions?: DictOptions[];
  statusOptions?: DictOptions[];
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  rowData: {
    name: ""
  }
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
  if (params.rowData.canteenId) {
    getCategoryList(params.rowData.canteenId);
  }
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await drawerProps.value.api!(drawerProps.value.rowData);
      ElMessage.success({
        message: t("main.successMsg", { title: "配送费", method: `${drawerProps.value.title}` })
      });
      drawerProps.value.getTableList!();
      drawerVisible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};

// 删除商品参数
const handleDeleteParam = (row: Commodity.CommodityParameter, index: number) => {
  if (!drawerProps.value.rowData.commodityParameterList) return;
  drawerProps.value.rowData.commodityParameterList.splice(index, 1);
};

// 新增商品参数
const handleAddParam = () => {
  if (!drawerProps.value.rowData.commodityParameterList) {
    drawerProps.value.rowData.commodityParameterList = [];
  }
  drawerProps.value.rowData.commodityParameterList.push({
    id: 0,
    name: "",
    price: 0,
    type: 1
  });
};

defineExpose({
  acceptParams
});
</script>
<style scoped lang="scss">
.param-form-item {
  :deep(.el-form-item__content) {
    display: block;
    width: 100%;
  }
}
</style>
