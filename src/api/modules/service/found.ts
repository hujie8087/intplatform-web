// 失物招领
import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { Found } from "@/api/interface/service/found";

/**
 * @name 失物招领模块
 */

// * 新增失物招领
export const addFound = (params: FormData) => {
  return http.post(PORT1 + `/other/found`, params);
};

// * 编辑失物招领
export const editFound = (params: FormData) => {
  return http.put(PORT1 + `/other/found`, params);
};

// * 删除失物招领
export const deleteFound = (id: number) => {
  return http.delete(PORT1 + `/other/found/${id}`);
};

// * 获取失物招领信息
export const getFoundById = (id: number) => {
  return http.get<Found.ResFound>(PORT1 + `/other/found/${id}`);
};

// * 批量删除失物招领
export const deleteMoreFound = (params: number[]) => {
  return http.post(PORT1 + `/other/found/delByIds`, params);
};

// * 获取宿舍失物招领数据
export const getFoundList = (params: Found.ReqFoundParams) => {
  return http.get<Found.ResFound[][]>(PORT1 + `/other/found/list`, params);
};

// * 导出宿舍失物招领数据
export const exportFound = (params: Found.ReqFoundParams) => {
  return http.get(PORT1 + `/other/found/export`, params);
};
