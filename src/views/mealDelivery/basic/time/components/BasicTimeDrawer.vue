<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}站点`">
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
        <!-- 来源类型 -->
        <el-col :span="24">
          <el-form-item label="餐饮名称" prop="tType">
            <el-select v-model="drawerProps.rowData.tType" placeholder="请选择餐饮">
              <el-option v-for="item in drawerProps.foodTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="班组报餐时间" prop="beginTime">
            <el-time-picker
              v-model="drawerProps.rowData.beginTime"
              format="HH:mm"
              value-format="HH:mm"
              placeholder="请选择班组报餐时间"
            />
            <span style="margin: 0 10px">至</span>
            <el-time-picker
              v-model="drawerProps.rowData.endTime"
              format="HH:mm"
              value-format="HH:mm"
              placeholder="请选择班组报餐结束时间"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="部门开始时间" prop="deptBeginTime">
            <el-time-picker
              v-model="drawerProps.rowData.deptBeginTime"
              format="HH:mm"
              value-format="HH:mm"
              placeholder="请选择部门开始时间"
            />
            <span style="margin: 0 10px">至</span>
            <el-time-picker
              v-model="drawerProps.rowData.deptEndTime"
              format="HH:mm"
              value-format="HH:mm"
              placeholder="请选择部门结束时间"
            />
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

<script setup lang="ts" name="DeliveryStationDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { BasicTime } from "@/api/interface/mealDelivery/basic/time";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
const { t } = useI18n(); // 解构出t方法

const rules = reactive({
  nationType: [{ required: true, message: t("main.selectError", { msg: "餐饮" }) }],
  fsAddressCn: [{ required: true, message: t("main.inputError", { msg: "地址(中文)" }) }],
  fsAddressEn: [{ required: true, message: t("main.inputError", { msg: "地址(英文)" }) }],
  fcId: [{ required: true, message: t("main.inputError", { msg: "车号" }) }],
  fsAddressId: [{ required: true, message: t("main.inputError", { msg: "地址(印尼)" }) }],
  status: [{ required: true, message: t("main.selectError", { msg: "状态" }) }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  rowData: Partial<BasicTime.ResBasicTime>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  messHallListOptions?: DictOptions[];
  carListOptions?: DictOptions[];
  foodTypeOptions?: DictOptions[];
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  rowData: {
    tType: "",
    beginTime: "",
    endTime: "",
    deptBeginTime: "",
    deptEndTime: ""
  }
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
        message: t("main.successMsg", { title: "站点", method: `${drawerProps.value.title}` })
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
#map {
  width: 100%;
  height: 600px;
}
</style>
