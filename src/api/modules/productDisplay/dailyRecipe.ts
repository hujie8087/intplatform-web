import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { DailyRecipe, Dish } from "@/api/interface/productDisplay/dailyRecipe";
// * 获取每日菜谱列表
export const getDishList = (params: Dish.ReqDishParams) => {
  return http.getRow<Dish.ResDish>(PORT1 + `/other/dayDish/list`, params);
};

// * 新增每日菜品
export const addDish = (params: FormData) => {
  return http.post(PORT1 + `/other/dayDish`, params);
};

// * 编辑菜品
export const editDish = (params: FormData) => {
  return http.put(PORT1 + `/other/dayDish`, params);
};

// * 删除菜品
export const deleteDish = (id: number) => {
  return http.delete(PORT1 + `/other/dayDish/${id}`);
};

// * 获取菜品信息
export const getDishById = (id: number) => {
  return http.get<Dish.ResDish>(PORT1 + `/other/dayDish/${id}`);
};

// * 批量删除菜品
export const deleteMoreDish = (params: number[]) => {
  return http.post(PORT1 + `/other/dayDish/delByIds`, params);
};
// * 导出每日菜谱
export const exportDish = (params: Dish.ReqDishParams) => {
  return http.post(PORT1 + `/other/dayDish/export`, params);
};
// * 新增每日菜谱
export const addDailyRecipe = (params: DailyRecipe.CreateDailyRecipe) => {
  return http.post(PORT1 + `/other/daily/menu`, params);
};
// * 编辑每日菜谱
export const editDailyRecipe = (params: DailyRecipe.CreateDailyRecipe) => {
  return http.put(PORT1 + `/other/daily/menu`, params);
};
// * 删除每日菜谱
export const deleteDailyRecipe = (id: number) => {
  return http.delete(PORT1 + `/other/daily/menu/${id}`);
};
// * 获取每日菜谱
export const getDailyRecipeById = (id: number) => {
  return http.get<DailyRecipe.ResDailyRecipe>(PORT1 + `/other/daily/menu/${id}`);
};

// * 获取每日菜谱
export const getDailyRecipeList = (params: DailyRecipe.ReqDailyRecipeParams) => {
  return http.getRow<DailyRecipe.ResDailyRecipe>(PORT1 + `/other/daily/menu/list`, params);
};

// * 导入每日菜谱
export const importDailyRecipe = (params: FormData) => {
  return http.post(PORT1 + `/other/daily/menu/importDailyMenu`, params);
};
