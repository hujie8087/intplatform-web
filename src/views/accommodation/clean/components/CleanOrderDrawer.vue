<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}保洁订单`">
    <el-form ref="ruleFormRef" label-width="120px" label-suffix=" :" :rules="rules" :model="drawerProps.rowData">
      <el-row>
        <el-col :span="12">
          <el-form-item label="保洁项目" prop="cpId">
            <!-- 选择保洁项目 -->
            <el-select v-model="drawerProps.rowData.cpId" placeholder="请选择保洁项目" clearable disabled>
              <el-option
                v-for="item in drawerProps.cleanProjectOptions"
                :key="item.label"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="保洁价格" prop="cleanPrice">
            <!-- 选择报修区域 -->
            <el-input v-model="drawerProps.rowData.cleanPrice" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="保洁区域" prop="cleanArea">
            <!-- 选择报修区域 -->
            <el-input v-model="drawerProps.rowData.clArea" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="保洁房间" prop="roomNo">
            <!-- 选择报修房间 -->
            <el-input v-model="drawerProps.rowData.roomNo" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系人" prop="contacts">
            <!-- 选择报修人 -->
            <el-input v-model="drawerProps.rowData.contacts" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" prop="tel">
            <el-input v-model="drawerProps.rowData!.tel" clearable disabled />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="预约时间" prop="reserveDate">
            <el-date-picker
              v-model="drawerProps.rowData.reserveDate"
              disabled
              type="datetime"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              placeholder="请选择预约时间"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="订单备注" prop="remark">
            <el-input
              v-model="drawerProps.rowData!.remark"
              type="textarea"
              disabled
              :placeholder="`${$t('main.inputError', { msg: '请填写订单备注' })}`"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('system.notice.status')}`" prop="status">
            <el-radio-group
              v-model="drawerProps.rowData!.orderStatus"
              :placeholder="`${$t('main.selectError', { msg: '订单状态' })}`"
              disabled
            >
              <el-radio v-for="item in drawerProps.orderStatusOptions" :key="item.label" :label="item.value">{{
                item.label
              }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-col :span="24">
            <el-form-item label="评价分数" prop="score">
              <el-rate v-model="drawerProps.rowData!.score" disabled />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="评价内容" prop="evaluate">
              <el-input v-model="drawerProps.rowData!.evaluate" type="textarea" disabled />
            </el-form-item>
          </el-col>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button type="primary" @click="handleSubmit">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="CleanOrderDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { Accommodation } from "@/api/interface/service/accommodation";
import { useI18n } from "vue-i18n";
import { DictOptions } from "@/api/interface";
// import { useUserStore } from "@/stores/modules/user";
import { sendMessage } from "@/api/modules/system/notice";
import { getUserInfoByUsername } from "@/api/modules/system/user";
const { t } = useI18n(); // 解构出t方法

// const userInfo = useUserStore().userInfo;

const rules = reactive({
  repairType: [{ required: true, message: t("main.inputError", { msg: "维修类型" }) }],
  repairState: [{ required: true, message: t("main.selectError", { msg: "维修状态" }) }],
  repairTime: [{ required: true, message: t("main.selectError", { msg: "维修时间" }) }]
});

interface DrawerProps {
  title: string;
  rowData: Partial<Accommodation.ResCleanOrder>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  cleanProjectOptions?: DictOptions[];
  orderStatusOptions?: DictOptions[];
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: "",
  rowData: {
    tel: "",
    createBy: ""
  }
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
  console.log(drawerProps.value);
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
        message: t("main.successMsg", { title: "保洁单", method: `${drawerProps.value.title}` })
      });
      // 获取用户详情
      const res = await getUserInfoByUsername(drawerProps.value.rowData.createBy!);
      if (res.msg) {
        let title = formData.orderStatus === 1 ? "您的保洁单已完成" : "您的保洁单已完成";
        sendMessage({
          title: title,
          body: formData.clArea + "/" + formData.roomNo,
          type: "1",
          payload: ``,
          userName: drawerProps.value.rowData.createBy!,
          equipmentToken: res.msg
        });
      }
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
