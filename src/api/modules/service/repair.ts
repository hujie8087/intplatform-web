// 报修服务
import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { Repair } from "@/api/interface/service/repair";

/**
 * @name 报修服务模块
 */

// * 新增报修
export const addRepair = (params: FormData) => {
  return http.post(PORT1 + `/commonality/repair`, params);
};

// * 编辑报修
export const editRepair = (params: FormData) => {
  return http.put(PORT1 + `/commonality/repair`, params);
};

// * 删除报修
export const deleteRepair = (id: number) => {
  return http.delete(PORT1 + `/commonality/repair/${id}`);
};

// * 获取报修信息
export const getRepairById = (id: number) => {
  return http.get<Repair.ResRepair>(PORT1 + `/commonality/repair/${id}`);
};

// * 批量删除报修
export const deleteMoreRepair = (params: number[]) => {
  return http.post(PORT1 + `/commonality/repair/delByIds`, params);
};

// * 获取宿舍报修数据
export const getRepairList = (params: Repair.ReqRepairParams) => {
  return http.get<Repair.ResRepair[][]>(PORT1 + `/commonality/repair/list`, params);
};

// 获取报修类型列表
export const getRepairTypeList = () => {
  return http.getRow<Repair.ResRepairType>(PORT1 + `/commonality/repairType/list`);
};
// * 获取报修类型
export const getRepairTypeById = (id: number) => {
  return http.get<Repair.ResRepairType>(PORT1 + `/commonality/repairType/${id}`);
};
// * 新增报修类型
export const addRepairType = (params: FormData) => {
  return http.post(PORT1 + `/commonality/repairType`, params);
};
// * 编辑报修类型
export const editRepairType = (params: FormData) => {
  return http.put(PORT1 + `/commonality/repairType`, params);
};
// * 删除报修类型
export const deleteRepairType = (id: number) => {
  return http.delete(PORT1 + `/commonality/repairType/${id}`);
};
