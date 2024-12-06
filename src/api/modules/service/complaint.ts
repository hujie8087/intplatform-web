// 投诉与建议
import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { Complaint } from "@/api/interface/service/complaint";

/**
 * @name 投诉与建议模块
 */

// * 新增投诉与建议
export const addComplaintMessage = (params: FormData) => {
  return http.post(PORT1 + `/other/ComplaintMessage`, params);
};

// * 编辑投诉与建议
export const editComplaintMessage = (params: FormData) => {
  return http.put(PORT1 + `/other/ComplaintMessage`, params);
};

// * 删除投诉与建议
export const deleteComplaintMessage = (id: number) => {
  return http.delete(PORT1 + `/other/ComplaintMessage/${id}`);
};

// * 获取投诉与建议信息
export const getComplaintMessageById = (id: number) => {
  return http.get<Complaint.ResComplaintMessage>(PORT1 + `/other/ComplaintMessage/${id}`);
};

// * 批量删除投诉与建议
export const deleteMoreComplaintMessage = (params: number[]) => {
  return http.post(PORT1 + `/other/ComplaintMessage/delByIds`, params);
};

// * 获取宿舍投诉与建议数据
export const getComplaintMessageList = (params: Complaint.ReqComplaintMessageParams) => {
  return http.get<Complaint.ResComplaintMessage[][]>(PORT1 + `/other/ComplaintMessage/list`, params);
};

// // 获取投诉与建议类型列表
// export const getComplaintTypeList = (params: Complaint.ReqComplaintTypeParams) => {
//   return http.getRow<Complaint.ResComplaintType>(PORT1 + `/other/ComplaintType/list`, params);
// };
// // * 获取投诉与建议类型
// export const getComplaintTypeById = (id: number) => {
//   return http.get<Complaint.ResComplaintType>(PORT1 + `/other/ComplaintType/${id}`);
// };
// // * 新增投诉与建议类型
// export const addComplaintType = (params: FormData) => {
//   return http.post(PORT1 + `/other/ComplaintType`, params);
// };
// // * 编辑投诉与建议类型
// export const editComplaintType = (params: FormData) => {
//   return http.put(PORT1 + `/other/ComplaintType`, params);
// };
// // * 删除投诉与建议类型
// export const deleteComplaintType = (id: number) => {
//   return http.delete(PORT1 + `/other/ComplaintType/${id}`);
// };
