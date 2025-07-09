// 投诉与建议
import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { CoupleRoom } from "@/api/interface/service/coupleRoom";

/**
 * @name 客房房间管理
 */

// * 获取房间列表
export const getChamberList = (params: CoupleRoom.ReqRoomParams) => {
  return http.getRow<CoupleRoom.ResRoom>(PORT1 + `/coupleRoom/room/chamber/list`, params);
};

// * 获取房间详情
export const getChamberById = (id: number) => {
  return http.get<CoupleRoom.ResRoom>(PORT1 + `/coupleRoom/room/chamber/${id}`);
};

// * 新增房间
export const addChamber = (params: CoupleRoom.ReqRoomParams) => {
  return http.post(PORT1 + `/coupleRoom/room/chamber`, params);
};

// * 编辑房间
export const editChamber = (params: CoupleRoom.ReqRoomParams) => {
  return http.put(PORT1 + `/coupleRoom/room/chamber`, params);
};

// * 删除房间
export const deleteChamber = (id: number) => {
  return http.delete(PORT1 + `/coupleRoom/room/chamber/${id}`);
};

// * 批量删除房间
export const deleteMoreChamber = (params: number[]) => {
  return http.post(PORT1 + `/coupleRoom/room/chamber/delByIds`, params);
};

// * 获取订单列表
export const getCoupleRoomOrderList = (params: CoupleRoom.ReqOrderParams) => {
  return http.getRow<CoupleRoom.ResRoomOrder>(PORT1 + `/coupleRoom/room/order/list`, params);
};

// * 退款
export const refundCoupleRoomOrder = (id: number) => {
  return http.get(PORT1 + `/coupleRoom/room/order/refund`, { id });
};

// * 冻结
export const freezeCoupleRoomOrder = (params: {
  id: number;
  freeze: boolean;
  chamberName: string;
  startTime: string;
  endTime: string;
}) => {
  return http.put(PORT1 + `/coupleRoom/room/order/freeze`, params);
};

// * 查看订单详情
export const getCoupleRoomOrderDetail = (id: number) => {
  return http.get<CoupleRoom.ResRoomOrder>(PORT1 + `/coupleRoom/room/order/${id}`);
};

// * 修改订单
export const editCoupleRoomOrder = (params: CoupleRoom.ReqOrderParams) => {
  return http.put(PORT1 + `/coupleRoom/room/order`, params);
};

// * 导出订单
export const exportCoupleRoomOrder = (params: CoupleRoom.ReqOrderParams) => {
  return http.get(PORT1 + `/coupleRoom/room/order/export`, params);
};

// * 审核
export const auditCoupleRoomOrder = (params: { id: number; orderId: number; name: string; status: number; content: string }) => {
  return http.post(PORT1 + `/coupleRoom/room/order/pcAudit`, params);
};

// * 获取房间列表
export const getChamberAvailableList = (day: number) => {
  return http.get<CoupleRoom.ResRoom[]>(PORT1 + `/coupleRoom/room/chamber/available/${day}`);
};

// * 获取反馈列表
export const getCoupleRoomFeedbackList = (params: CoupleRoom.ReqFeedbackParams) => {
  return http.getRow<CoupleRoom.ResFeedback>(PORT1 + `/coupleRoom/room/feedback/list`, params);
};

// * 导出反馈
export const exportCoupleRoomFeedback = (params: CoupleRoom.ReqFeedbackParams) => {
  return http.get(PORT1 + `/coupleRoom/room/feedback/export`, params);
};

// * 人员管理
export const getCoupleRoomStaffList = (params: CoupleRoom.ReqStaffParams) => {
  return http.getRow<CoupleRoom.ResStaff>(PORT1 + `/coupleRoom/room/staff/list`, params);
};

// * 新增人员
export const addCoupleRoomStaff = (params: CoupleRoom.ReqStaffParams) => {
  return http.post(PORT1 + `/coupleRoom/room/staff`, params);
};

// * 编辑人员
export const editCoupleRoomStaff = (params: CoupleRoom.ReqStaffParams) => {
  return http.put(PORT1 + `/coupleRoom/room/staff`, params);
};

// * 删除人员
export const deleteCoupleRoomStaff = (id: number) => {
  return http.delete(PORT1 + `/coupleRoom/room/staff/${id}`);
};

// * 批量删除人员
export const deleteMoreCoupleRoomStaff = (params: number[]) => {
  return http.post(PORT1 + `/coupleRoom/room/staff/delByIds`, params);
};

// * 获取人员详情
export const getCoupleRoomStaffDetail = (id: number) => {
  return http.get<CoupleRoom.ResStaff>(PORT1 + `/coupleRoom/room/staff/${id}`);
};
