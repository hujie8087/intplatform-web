// 配送员模块
import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { DeliveryStaff } from "@/api/interface/delivery/staff";

// * 获取配送员列表
export const getDeliveryStaffList = (params: DeliveryStaff.ReqDeliveryStaffParams) => {
  return http.getRow<DeliveryStaff.ResDeliveryStaff>(PORT1 + `/delivery/staff/list1`, params);
};

// * 新增配送员
export const addDeliveryStaff = (params: DeliveryStaff.ReqDeliveryStaffParams) => {
  return http.post(PORT1 + `/delivery/staff`, params);
};

// * 编辑配送员
export const editDeliveryStaff = (params: DeliveryStaff.ReqDeliveryStaffParams) => {
  return http.put(PORT1 + `/delivery/staff`, params);
};

// * 删除配送员
export const deleteDeliveryStaff = (id: number) => {
  return http.delete(PORT1 + `/delivery/staff/${id}`);
};

// * 获取配送员信息
export const getDeliveryStaffById = (id: number) => {
  return http.get<DeliveryStaff.ResDeliveryStaff>(PORT1 + `/delivery/staff/getStaffDetails/${id}`);
};

// * 导出配送员信息
export const exportDeliveryStaff = (params: DeliveryStaff.ReqDeliveryStaffParams) => {
  return http.post(PORT1 + `/delivery/staff/export`, params);
};
