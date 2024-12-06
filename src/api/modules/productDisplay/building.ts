// 生活区楼栋管理
import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { Building } from "@/api/interface/productDisplay/building";

/**
 * @name 楼栋管理模块
 */

// * 新增楼栋
export const addBuilding = (params: FormData) => {
  return http.post(PORT1 + `/maintenance/building`, params);
};

// * 编辑楼栋
export const editBuilding = (params: FormData) => {
  return http.put(PORT1 + `/maintenance/building`, params);
};

// * 删除楼栋
export const deleteBuilding = (id: number) => {
  return http.delete(PORT1 + `/maintenance/building/${id}`);
};

// * 获取楼栋信息
export const getBuildingById = (id: number) => {
  return http.get<Building.ResBuilding>(PORT1 + `/maintenance/building/${id}`);
};

// * 批量删除楼栋
export const deleteMoreBuilding = (params: number[]) => {
  return http.post(PORT1 + `/maintenance/building/delByIds`, params);
};

// * 获取宿舍楼栋数据
export const getBuildingTree = () => {
  return http.get<Building.ResBuilding[]>(PORT1 + `/maintenance/building/tree`);
};

// * 获取所有生活区列表
export const getAllBuildingTree = () => {
  return http.get<Building.ResBuilding[]>(PORT1 + `/maintenance/building/tree`);
};

// 获取楼栋节点
export const getBuildingNode = (id: number) => {
  return http.get<Building.ResBuilding[]>(PORT1 + `/maintenance/building/node/${id}`);
};

// * 获取区域列表
export const getAreaMenu = () => {
  return http.get<Building.ResBuilding[]>(PORT1 + `/maintenance/building/area`);
};
