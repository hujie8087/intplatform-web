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

// * 获取保洁项目列表
export const getCleanList = (params: Accommodation.ReqCleanParams) => {
  return http.getRow<Accommodation.ResClean>(PORT1 + `/maintenance/clean/project/list`, params);
};

// * 新增保洁项目
export const addClean = (params: FormData) => {
  return http.post(PORT1 + `/maintenance/clean/project`, params);
};

// * 编辑保洁项目
export const editClean = (params: FormData) => {
  return http.put(PORT1 + `/maintenance/clean/project`, params);
};

// * 删除保洁项目
export const deleteClean = (id: number) => {
  return http.delete(PORT1 + `/maintenance/clean/project/${id}`);
};

// * 获取保洁项目详情
export const getCleanById = (id: number) => {
  return http.get<Accommodation.ResClean>(PORT1 + `/maintenance/clean/project/${id}`);
};

// * 获取保洁订单列表
export const getCleanOrderList = (params: Accommodation.ReqCleanOrderParams) => {
  // 定义需要检查的字段列表
  const fieldsToCheck = ["repairArea", "roomNo", "repairPerson", "repairMan", "repairState", "ancestors"];
  // 遍历检查各字段是否为空，赋值flag
  for (const field of fieldsToCheck) {
    if (!params[field]?.trim) {
      params.flag = 1;
      break; // 如果已经找到空值，就不需要继续检查了
    }
  }
  return http.get<Accommodation.ResCleanOrder[]>(PORT1 + `/maintenance/clean/order/list`, params);
};

// * 新增保洁订单
export const addCleanOrder = (params: FormData) => {
  return http.post(PORT1 + `/maintenance/clean/order`, params);
};

// * 编辑保洁订单
export const editCleanOrder = (params: FormData) => {
  return http.put(PORT1 + `/maintenance/clean/order`, params);
};

// * 删除保洁订单
export const deleteCleanOrder = (id: number) => {
  return http.delete(PORT1 + `/maintenance/clean/order/${id}`);
};

// * 获取保洁订单详情
export const getCleanOrderById = (id: number) => {
  return http.get<Accommodation.ResCleanOrder>(PORT1 + `/maintenance/clean/order/${id}`);
};

// * 退款保洁订单
export const refundCleanOrder = (id: number) => {
  return http.get(PORT1 + `/maintenance/clean/order/refund`, { id });
};

// * 办理保洁订单
export const handleCleanOrder = (id: number) => {
  return http.get(PORT1 + `/maintenance/clean/order/deduction/${id}`);
};
