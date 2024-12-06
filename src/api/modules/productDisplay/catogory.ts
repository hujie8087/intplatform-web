import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { Category } from "@/api/interface/productDisplay/catogory";

// * 获取菜品分类列表
export const getCategoryList = (params: Category.ReqCategoryParams) => {
  return http.get<Category.ResCategory[]>(PORT1 + `/productdisplay/category/list`, params);
};

// * 新增菜品分类
export const addCategory = (params: Category.CreateCategory) => {
  return http.post(PORT1 + `/productdisplay/category`, params);
};

// * 编辑菜品分类
export const editCategory = (params: Category.ResCategory) => {
  return http.put(PORT1 + `/productdisplay/category`, params);
};

// * 删除菜品分类
export const deleteCategory = (id: number) => {
  return http.delete(PORT1 + `/productdisplay/category/${id}`);
};

// * 获取菜品分类信息
export const getCategoryById = (id: number) => {
  return http.get<Category.ResCategory>(PORT1 + `/productdisplay/category/${id}`);
};

// * 批量删除菜品分类
export const deleteMoreCategory = (params: number[]) => {
  return http.post(PORT1 + `/productdisplay/category/delByIds`, params);
};
