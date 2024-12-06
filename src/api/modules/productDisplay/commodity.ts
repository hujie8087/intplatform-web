import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { Commodity } from "@/api/interface/productDisplay/commodity";

// * 获取菜品列表
export const getCommodityList = (params: Commodity.ReqCommodityParams) => {
  return http.get<Commodity.ResCommodity[]>(PORT1 + `/productdisplay/commodity/list`, params);
};

// * 新增菜品
export const addCommodity = (params: FormData) => {
  return http.post(PORT1 + `/productdisplay/commodity`, params);
};

// * 编辑菜品
export const editCommodity = (params: FormData) => {
  return http.put(PORT1 + `/productdisplay/commodity`, params);
};

// * 删除菜品
export const deleteCommodity = (id: number) => {
  return http.delete(PORT1 + `/productdisplay/commodity/${id}`);
};

// * 获取菜品信息
export const getCommodityById = (id: number) => {
  return http.get<Commodity.ResCommodity>(PORT1 + `/productdisplay/commodity/${id}`);
};

// * 批量删除菜品
export const deleteMoreCommodity = (params: number[]) => {
  return http.post(PORT1 + `/productdisplay/commodity/delByIds`, params);
};
// * 导出菜品
export const exportCommodity = (params: Commodity.ReqCommodityParams) => {
  return http.post(PORT1 + `/productdisplay/commodity/export`, params);
};
// * 导入菜品
export const importCommodity = (params: FormData) => {
  return http.post(PORT1 + `/productdisplay/commodity/import`, params);
};
