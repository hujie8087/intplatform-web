<template>
  <div class="main-box">
    <div class="table-box card">
      <el-calendar v-model="date" height="100%" ref="calendar">
        <template #header="{ date }">
          <div class="header-box">
            <div class="header-left">
              <span class="header-title" style="margin-right: 20px">{{ date }}</span>
              <el-button type="danger" @click="importRecipes">导入菜谱</el-button>
            </div>
            <div class="header-right">
              <el-button-group>
                <el-button size="small" @click="selectDate('prev-month')"> 上个月 </el-button>
                <el-button size="small" @click="selectDate('today')">今天</el-button>
                <el-button size="small" @click="selectDate('next-month')"> 下个月 </el-button>
              </el-button-group>
            </div>
          </div>
        </template>
        <template #date-cell="{ data }">
          <div class="cell-box" @click="openDrawer(data)">
            <div class="cell-box-content">
              <div class="cell-box-content-title">{{ data.day.split("-").slice(1).join("-") }}</div>
              <div class="cell-box-content-list" v-if="hasMenuData(data.day)">
                <div v-for="meal in getMealDisplay(data.day)" :key="meal.type" :class="['meal-item', meal.type]">
                  <span class="meal-label">{{ meal.label }}:</span>{{ meal.dishes }}
                </div>
              </div>
              <div v-else class="empty-state">
                <span class="empty-text">暂无菜单</span>
              </div>
            </div>
          </div>
        </template>
      </el-calendar>
    </div>
    <DailyRecipeDrawer ref="drawerRef" />
    <ImportExcel ref="dialogRef" />
  </div>
</template>
<script setup lang="tsx" name="DailyRecipe">
import { ref, computed } from "vue";
import DailyRecipeDrawer from "./components/DailyRecipeDrawer.vue";
import ImportExcel from "@/components/ImportExcel/index.vue";
import { getDailyRecipeList, importDailyRecipe } from "@/api/modules/productDisplay/dailyRecipe";
import { watch } from "vue";
import { DailyRecipe } from "@/api/interface/productDisplay/dailyRecipe";
import dayjs from "dayjs";
import { useAuthButtons } from "@/hooks/useAuthButtons";
import { CalendarDateType, CalendarInstance, ElMessage } from "element-plus";
const { BUTTONS } = useAuthButtons();

// 权限检查计算属性
const hasEditPermission = computed(() => {
  return BUTTONS.value["*:*:*"] || BUTTONS.value["daily:menu:edit"];
});

const date = ref(new Date());
const dailyRecipeDataList = ref<DailyRecipe.ResDailyRecipe[]>([]);

// 性能优化：缓存菜名列表，按餐次分类
const dishNamesCache = computed(() => {
  const cache = new Map<string, { breakfast: string; lunch: string; dinner: string }>();
  dailyRecipeDataList.value.forEach(recipe => {
    if (recipe.menuDate && recipe.dishs) {
      const mealGroups = {
        breakfast: [] as string[],
        lunch: [] as string[],
        dinner: [] as string[]
      };

      recipe.dishs.forEach(dish => {
        switch (dish.mealType) {
          case 0: // 早餐
            mealGroups.breakfast.push(dish.name);
            break;
          case 1: // 中餐
            mealGroups.lunch.push(dish.name);
            break;
          case 2: // 晚餐
            mealGroups.dinner.push(dish.name);
            break;
        }
      });

      cache.set(recipe.menuDate, {
        breakfast: mealGroups.breakfast.join(","),
        lunch: mealGroups.lunch.join(","),
        dinner: mealGroups.dinner.join(",")
      });
    }
  });
  return cache;
});

const getDailyRecipeDataList = async () => {
  const res = await getDailyRecipeList({
    beginDate: dayjs(date.value).startOf("month").format("YYYY-MM-DD"),
    endDate: dayjs(date.value).endOf("month").format("YYYY-MM-DD"),
    pageNum: 1,
    pageSize: 10000
  });
  dailyRecipeDataList.value = res.rows;
};
getDailyRecipeDataList();

// 检查是否有菜单数据
const hasMenuData = (date: string): boolean => {
  const menuData = dishNamesCache.value.get(date);
  return !!(menuData && (menuData.breakfast || menuData.lunch || menuData.dinner));
};

// 获取餐次显示数据
const getMealDisplay = (date: string): Array<{ type: string; label: string; dishes: string }> => {
  const menuData = dishNamesCache.value.get(date);
  if (!menuData) return [];

  const meals: Array<{ type: string; label: string; dishes: string }> = [];
  if (menuData.breakfast) {
    meals.push({ type: "breakfast", label: "早", dishes: menuData.breakfast });
  }
  if (menuData.lunch) {
    meals.push({ type: "lunch", label: "中", dishes: menuData.lunch });
  }
  if (menuData.dinner) {
    meals.push({ type: "dinner", label: "晚", dishes: menuData.dinner });
  }

  return meals;
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof DailyRecipeDrawer> | null>(null);
const openDrawer = async (data: any) => {
  // 检查是否有编辑权限
  if (hasEditPermission.value) {
    const existingData = dailyRecipeDataList.value.find(item => item.menuDate === data.day);
    const params = {
      rowData: existingData || { menuDate: data.day }, // 如果没有数据，创建新的
      isEdit: !!existingData, // 标记是否为编辑模式
      getDailyRecipeDataList: getDailyRecipeDataList
    };
    drawerRef.value?.acceptParams(params);
  } else {
    ElMessage.warning("您没有编辑权限");
  }
};

const calendar = ref<CalendarInstance>();
const selectDate = (val: CalendarDateType) => {
  if (!calendar.value) return;
  calendar.value.selectDate(val);
};
// 导入菜谱
const dialogRef = ref<InstanceType<typeof ImportExcel> | null>(null);
const importRecipes = () => {
  dialogRef.value?.acceptParams({
    title: "菜谱",
    importApi: importDailyRecipe,
    tempApi: "other/daily/menu/exportImp",
    getTableList: getDailyRecipeDataList
  });
};
watch(date, () => {
  getDailyRecipeDataList();
});
</script>

<style lang="scss" scoped>
.main-box {
  .table-box {
    height: 100%;
    .el-calendar {
      width: 100%;
      height: 100%;
      :deep(.el-calendar__header) {
        padding: 10px 20px;
        border-bottom: 1px solid #ebeef5;
        .header-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          .header-left {
            display: flex;
            align-items: center;
            .header-title {
              font-size: 18px;
              font-weight: bold;
              color: #303133;
            }
          }
        }
      }
      :deep(.el-calendar__body) {
        width: 100%;
        height: calc(100% - 52px);
        padding: 0;
        .el-calendar-table {
          width: 100%;
          height: 100%;
          .el-calendar-day {
            width: 100%;
            height: 100%;
            padding: 4px;
            .cell-box {
              width: 100%;
              height: 100%;
              cursor: pointer;
              border-radius: 4px;
              transition: all 0.3s ease;
              &:hover {
                background-color: #f5f7fa;
                box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
                transform: translateY(-1px);
              }
              .cell-box-content {
                width: 100%;
                height: 100%;
                min-height: 100px;
                padding: 8px;
                font-size: 12px;
                .cell-box-content-title {
                  margin-bottom: 8px;
                  font-size: 16px;
                  font-weight: bold;
                  color: #303133;
                }
                .cell-box-content-list {
                  margin-top: 4px;
                  .meal-item {
                    padding: 2px 4px;
                    margin-bottom: 5px;
                    line-height: 1.3;
                    background-color: rgb(64 158 255 / 10%);
                    border-radius: 2px;
                    .meal-label {
                      margin-right: 4px;
                      font-size: 11px;
                      font-weight: bold;
                    }
                    &.breakfast {
                      background-color: rgb(103 194 58 / 10%);
                      .meal-label {
                        color: #67c23a;
                      }
                    }
                    &.lunch {
                      background-color: rgb(230 162 60 / 10%);
                      .meal-label {
                        color: #e6a23c;
                      }
                    }
                    &.dinner {
                      background-color: rgb(245 108 108 / 10%);
                      .meal-label {
                        color: #f56c6c;
                      }
                    }
                  }
                }
                .empty-state {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  height: 60px;
                  .empty-text {
                    font-size: 12px;
                    font-style: italic;
                    color: #909399;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
