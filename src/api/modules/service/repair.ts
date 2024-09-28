// 报修服务
import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { Repair } from "@/api/interface/service/repair";

/**
 * @name 报修服务模块
 */

// * 新增报修
export const addRepair = (params: FormData) => {
  return http.post(PORT1 + `/maintenance/repair`, params);
};

// * 编辑报修
export const editRepair = (params: FormData) => {
  return http.put(PORT1 + `/maintenance/repair`, params);
};

// * 删除报修
export const deleteRepair = (id: number) => {
  return http.delete(PORT1 + `/maintenance/repair/${id}`);
};

// * 获取报修信息
export const getRepairById = (id: number) => {
  return http.get<Repair.ResRepair>(PORT1 + `/maintenance/repair/${id}`);
};

// * 批量删除报修
export const deleteMoreRepair = (params: number[]) => {
  return http.post(PORT1 + `/maintenance/repair/delByIds`, params);
};

// * 获取宿舍报修数据
export const getRepairList = (params: Repair.ReqRepairParams) => {
  // 定义需要检查的字段列表
  const fieldsToCheck = ["repairArea", "roomNo", "repairPerson", "repairMan", "repairState", "ancestors"];

  // 遍历检查各字段是否为空，赋值flag
  for (const field of fieldsToCheck) {
    if (!params[field]?.trim) {
      params.flag = 1;
      break; // 如果已经找到空值，就不需要继续检查了
    }
  }
  return http.get<Repair.ResRepair[][]>(PORT1 + `/maintenance/repair/list`, params);
};
// export const getRepairList = (params: Repair.ReqRepairParams) => {
//   // 如果没有传过来条件，标志赋值1，就按照各区域保修管理员查看自己的区域报修单
//   if (params.repairArea?.trim == null) {
//     params.flag = 1;
//   }
//   if (params.roomNo?.trim == null) {
//     params.flag = 1;
//   }
//   if (params.repairPerson?.trim == null) {
//     params.flag = 1;
//   }
//   if (params.repairMan?.trim == null) {
//     params.flag = 1;
//   }
//   if (params.repairState?.trim == null) {
//     params.flag = 1;
//   }
//   if (params.ancestors?.trim == null) {
//     params.flag = 1;
//   }
//   if (params.repairArea) return http.get<Repair.ResRepair[][]>(PORT1 + `/maintenance/repair/list`, params);
// };

// 获取报修类型列表
export const getRepairTypeList = (params: Repair.ReqRepairTypeParams) => {
  return http.getRow<Repair.ResRepairType>(PORT1 + `/maintenance/repairType/list`, params);
};
// * 获取报修类型
export const getRepairTypeById = (id: number) => {
  return http.get<Repair.ResRepairType>(PORT1 + `/maintenance/repairType/${id}`);
};
// * 新增报修类型
export const addRepairType = (params: FormData) => {
  return http.post(PORT1 + `/maintenance/repairType`, params);
};
// * 编辑报修类型
export const editRepairType = (params: FormData) => {
  return http.put(PORT1 + `/maintenance/repairType`, params);
};
// * 删除报修类型
export const deleteRepairType = (id: number) => {
  return http.delete(PORT1 + `/maintenance/repairType/${id}`);
};

// * 报修数据报表
export const getRepairReport = (params: { beginTime: string; endTime: string }) => {
  return http.get<Repair.RepairData>(PORT1 + `maintenance/repair/forms`, params);
};
