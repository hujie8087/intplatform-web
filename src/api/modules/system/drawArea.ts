// import { Dict } from "@/api/interface/system";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name 系统字典管理模块
 */

// * 新增大屏区域
export const addRegion = (params: FormData) => {
  return http.post(PORT1 + `/system/area`, params);
};

// * 编辑大屏区域
export const editRegion = (params: FormData) => {
  return http.put(PORT1 + `/system/area`, params);
};

// * 删除大屏区域
export const deleteRegion = (id: number) => {
  return http.delete(PORT1 + `/system/area/${id}`);
};
// * 获取大屏区域列表-分页
export const getRegionList = params => {
  return http.get(PORT1 + `/system/area/list`, params);
};
// * 获取大屏区域列表-不分页
export const getRegionAllList = () => {
  return http.get(PORT1 + `/system/area/listAll`);
};
