// 公共便利服务
import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { Accommodation } from "@/api/interface/service/accommodation";
import { Other } from "@/api/interface/service/other";

/**
 * @name 宿舍服务模块
 */

// * 新增宿舍流程
export const addProcess = (params: FormData) => {
  return http.post(PORT1 + `/other/accommodationProcess`, params);
};

// * 编辑宿舍流程
export const editProcess = (params: FormData) => {
  return http.put(PORT1 + `/other/accommodationProcess`, params);
};

// * 删除宿舍流程
export const deleteProcess = (id: number) => {
  return http.delete(PORT1 + `/other/accommodationProcess/${id}`);
};

// * 获取宿舍流程信息
export const getProcessById = (id: number) => {
  return http.get<Other.ResOther>(PORT1 + `/other/accommodationProcess/${id}`);
};

// * 批量删除宿舍流程
export const deleteMoreProcess = (params: number[]) => {
  return http.post(PORT1 + `/other/accommodationProcess/delByIds`, params);
};

// * 获取宿舍流程数据
export const getProcessList = (params: Accommodation.ReqProcessParams) => {
  return http.get<Accommodation.ResProcess[]>(PORT1 + `/other/accommodationProcess`, params);
};

// * 获取宿舍申请数据
export const getApplyList = (params: Accommodation.ReqApplyParams) => {
  return http.get<Accommodation.ResApply[]>(PORT1 + `/other/applyOnline`, params);
};

// * 获取宿舍申请数据
export const getApplyById = (id: number) => {
  return http.get<Accommodation.ResApply>(PORT1 + `/other/applyOnline/${id}`);
};

// * 新增宿舍申请
export const addApply = (params: FormData) => {
  return http.post(PORT1 + `/other/applyOnline`, params);
};

// * 编辑宿舍申请
export const editApply = (params: FormData) => {
  return http.put(PORT1 + `/other/applyOnline`, params);
};

// * 删除宿舍申请
export const deleteApply = (id: number) => {
  return http.delete(PORT1 + `/other/applyOnline/${id}`);
};

// * 审核宿舍申请
export const auditApply = (params: FormData) => {
  return http.post(PORT1 + `/other/applyOnline/audit`, params);
};
