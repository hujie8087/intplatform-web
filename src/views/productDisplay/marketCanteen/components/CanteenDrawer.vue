<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="800" :title="`${drawerProps.title}餐厅`">
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
        <!-- 餐厅图片 -->
        <el-col :span="24">
          <el-form-item label="餐厅图片" prop="image">
            <UploadImg v-model:image-url="drawerProps.rowData.image" :file-size="5" width="100px" height="100px">
              <template #tip> 上传图片最大为 5M </template>
            </UploadImg>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="餐厅名称" prop="name">
            <el-input
              v-model="drawerProps.rowData.name"
              :placeholder="`${$t('main.inputError', { msg: $t('system.notice.noticeTitle') })}`"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <!-- 开始营业时间 -->
        <el-col :span="12">
          <el-form-item label="开始营业时间" prop="startTime">
            <el-time-picker v-model="drawerProps.rowData.startTime" format="HH:mm" value-format="HH:mm" />
          </el-form-item>
        </el-col>
        <!-- 结束营业时间 -->
        <el-col :span="12">
          <el-form-item label="结束营业时间" prop="endTime">
            <el-time-picker v-model="drawerProps.rowData.endTime" format="HH:mm" value-format="HH:mm" />
          </el-form-item>
        </el-col>
        <!--  取餐类型 -->
        <el-col :span="24">
          <el-form-item label="取餐类型" prop="pickupTypeIds">
            <el-checkbox-group v-model="drawerProps.rowData.pickupTypeIds" multiple @change="handlePickupTypeChange">
              <el-checkbox v-for="item in drawerProps.pickupTypeOptions" :key="item.id" :label="item.name" :value="item.id">{{
                item.name
              }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-col>
        <template v-if="drawerProps.rowData.pickupTypeIds && drawerProps.rowData.pickupTypeIds.includes(3)">
          <!-- 配送费选项 -->
          <el-col :span="12">
            <el-form-item label="配送费" prop="deliveryFeeIds">
              <el-select v-model="drawerProps.rowData.deliveryFeeIds" multiple placeholder="请选择配送费">
                <el-option v-for="item in drawerProps.deliveryFeeOptions" :key="item.id" :label="item.name" :value="item.id">
                  <span style="float: left">{{ item.name }}</span>
                  <span style="float: right; font-size: 13px"> 费用：{{ item.price }} </span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <!-- 配送区域 -->
          <el-col :span="12">
            <el-form-item label="配送区域" prop="deliveryIds">
              <el-select v-model="drawerProps.rowData.deliveryIds" multiple placeholder="请选择配送区域" disabled>
                <el-option v-for="item in drawerProps.addressOptions" :key="item.id" :label="item.name" :value="item.id">
                  {{ item.name }}
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <!-- 新配送区域 -->
          <el-col :span="12">
            <el-form-item label="新配送区域" prop="newDeliveryIds">
              <el-select v-model="drawerProps.rowData.newDeliveryIds" multiple placeholder="请选择配送区域">
                <el-option v-for="item in drawerProps.newAddressOptions" :key="item.id" :label="item.name" :value="item.id">
                  {{ item.name }}
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <!-- 配送时间 -->
          <el-col :span="24">
            <el-form-item label="配送时间" prop="deliveryTimeIds">
              <el-checkbox-group v-model="drawerProps.rowData.deliveryTimeIds" multiple @change="handleDeliveryTimeChange">
                <el-checkbox v-for="item in drawerProps.deliveryTimeOptions" :key="item.id" :label="item.name" :value="item.id">{{
                  item.name
                }}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </template>
        <!-- 状态 -->
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-switch v-model="drawerProps.rowData.status" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </el-col>
        <!-- 备注 -->
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="drawerProps.rowData.remark" type="textarea" rows="6" />
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

<script setup lang="ts" name="CanteenDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { MarketCanteen } from "@/api/interface/productDisplay/marketCanteen";
import { useI18n } from "vue-i18n";
import { DictOptionsType } from "@/api/interface";
import UploadImg from "@/components/Upload/Img.vue";
// 图片地址
// const imageUrl = "https://web.iwipwedabay.com/static/";

const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  name: [{ required: true, message: t("main.inputError", "餐厅名称") }],
  image: [{ required: true, message: t("main.inputError", "餐厅图片") }],
  startTime: [{ required: true, message: t("main.inputError", "开始营业时间") }],
  endTime: [{ required: true, message: t("main.inputError", "结束营业时间") }],
  pickupTypeIds: [{ required: true, message: t("main.inputError", "取餐类型") }],
  status: [{ required: true, message: t("main.inputError", "状态") }],
  newDeliveryIds: [{ required: true, message: t("main.inputError", "新配送区域") }],
  deliveryFeeIds: [{ required: true, message: t("main.inputError", "配送费") }],
  deliveryTimeIds: [{ required: true, message: t("main.inputError", "配送时间") }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<MarketCanteen.ResMarketCanteen>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  pickupTypeOptions?: DictOptionsType[];
  deliveryFeeOptions?: DictOptionsType[];
  deliveryTimeOptions?: DictOptionsType[];
  addressOptions?: DictOptionsType[];
  newAddressOptions?: DictOptionsType[];
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  rowData: {
    name: "",
    status: 0,
    createBy: ""
  }
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
};

// 配送时间改变
const handleDeliveryTimeChange = (val: number[]) => {
  drawerProps.value.rowData.deliveryTimeIds = [...new Set(val)];
};

// 取餐类型改变
const handlePickupTypeChange = (val: number[]) => {
  drawerProps.value.rowData.pickupTypeIds = [...new Set(val)];
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await drawerProps.value.api!(drawerProps.value.rowData);
      ElMessage.success({
        message: t("main.successMsg", { title: "餐厅", method: `${drawerProps.value.title}` })
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
