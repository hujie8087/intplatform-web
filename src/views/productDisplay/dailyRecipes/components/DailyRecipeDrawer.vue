<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" width="800" title="编辑菜谱">
    <el-form ref="ruleFormRef" label-width="120px" label-suffix=" :">
      <el-row>
        <el-col :span="24">
          <el-form-item label="日期" prop="menuDate">
            <el-date-picker
              v-model="drawerProps.rowData!.menuDate"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              type="date"
              placeholder="请选择日期"
              disabled
            ></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="早餐" prop="breakfastList">
            <el-select v-model="breakfastList" multiple>
              <el-option v-for="item in dishList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="午餐" prop="lunchList">
            <el-select v-model="lunchList" multiple>
              <el-option v-for="item in dishList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="晚餐" prop="dinnerList">
            <el-select v-model="dinnerList" multiple>
              <el-option v-for="item in dishList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">{{ $t("main.cancel") }}</el-button>
      <el-button @click="handleReset" type="warning">{{ $t("main.reset") }}</el-button>
      <el-button type="primary" @click="handleSubmit">{{ $t("main.confirm") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="DailyRecipeDrawer">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { getDishList } from "@/api/modules/productDisplay/dailyRecipe";
import { Dish, DailyRecipe } from "@/api/interface/productDisplay/dailyRecipe";
import { addDailyRecipe } from "@/api/modules/productDisplay/dailyRecipe";
import { editDailyRecipe } from "@/api/modules/productDisplay/dailyRecipe";
// import { DictOptions } from "@/api/interface";

// 获取所有菜品
const dishList = ref<Dish.ResDish[]>([]);
const getDishListData = async () => {
  const res = await getDishList({ pageNum: 1, pageSize: 10000 });
  dishList.value = res.rows;
};
getDishListData();
// 早餐
const breakfastList = ref<number[]>([]);
// 午餐
const lunchList = ref<number[]>([]);
// 晚餐
const dinnerList = ref<number[]>([]);

interface DrawerProps {
  rowData?: Partial<DailyRecipe.ResDailyRecipe>;
  getDailyRecipeDataList?: () => Promise<any>;
}

// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  rowData: {}
});
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  drawerProps.value = params;
  drawerVisible.value = true;
  if (params.rowData?.dishs) {
    breakfastList.value = params.rowData?.dishs.filter(item => item.mealType === 0).map(item => item.id) || [];
    lunchList.value = params.rowData?.dishs.filter(item => item.mealType === 1).map(item => item.id) || [];
    dinnerList.value = params.rowData?.dishs.filter(item => item.mealType === 2).map(item => item.id) || [];
  }
};

// 重置选择
const handleReset = () => {
  breakfastList.value = [];
  lunchList.value = [];
  dinnerList.value = [];
};

// 提交数据（新增/编辑）
const handleSubmit = async () => {
  if (breakfastList.value.length === 0) {
    ElMessage.error("请至少选择一餐的早餐");
    return;
  } else if (lunchList.value.length === 0) {
    ElMessage.error("请至少选择一餐的午餐");
    return;
  } else if (dinnerList.value.length === 0) {
    ElMessage.error("请至少选择一餐的晚餐");
    return;
  }

  const params = {
    id: drawerProps.value.rowData?.id,
    menuDate: drawerProps.value.rowData?.menuDate,
    dids: {
      0: breakfastList.value.join(","),
      1: lunchList.value.join(","),
      2: dinnerList.value.join(",")
    }
  };
  if (drawerProps.value.rowData?.id) {
    await editDailyRecipe(params);
    ElMessage.success("编辑成功");
    drawerProps.value.getDailyRecipeDataList?.();
  } else {
    await addDailyRecipe(params);
    ElMessage.success("新增成功");
    drawerProps.value.getDailyRecipeDataList?.();
  }
  drawerVisible.value = false;
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
