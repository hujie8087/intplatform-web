<template>
  <div class="main-box">
    <div class="table-box">
      <div class="card" style="height: 100%">
        <el-switch
          v-model="ramadan"
          :before-change="changeRamadan"
          :active-value="true"
          :inactive-value="false"
          active-text="开启斋月"
          inactive-text="关闭斋月"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="tsx" name="BasicSetting">
import { ref } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import { getFoodSetting, updateFoodSetting } from "@/api/modules/mdc/system/order/setting";
const ramadan = ref(false);

const getFoodSettingData = async () => {
  const res = await getFoodSetting();
  ramadan.value = res.data.ramadan;
};
getFoodSettingData();

const changeRamadan = async () => {
  await useHandleData(updateFoodSetting, { ramadan: !ramadan.value }, `修改餐饮设置`);
  getFoodSettingData();
};
</script>
