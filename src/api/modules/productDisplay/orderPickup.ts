// 餐厅管理
import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { PickupCode } from "@/api/interface/productDisplay/orderPickup";

/**
 * @name 订桌/货架管理模块
 */

// * 新增订桌/货架
export const addPickupCode = (params: PickupCode.CreatePickupCode) => {
  return http.post(PORT1 + `/productdisplay/pickupCode`, params);
};

// * 编辑订桌/货架
export const editPickupCode = (params: FormData) => {
  return http.put(PORT1 + `/productdisplay/pickupCode`, params);
};

// * 删除订桌/货架
export const deletePickupCode = (id: number) => {
  return http.delete(PORT1 + `/productdisplay/pickupCode/${id}`);
};

// * 获取订桌/货架信息
export const getPickupCodeById = (id: number) => {
  return http.get<PickupCode.ResPickupCode>(PORT1 + `/productdisplay/pickupCode/${id}`);
};

// * 批量删除订桌/货架
export const deleteMorePickupCode = (params: number[]) => {
  return http.post(PORT1 + `/productdisplay/pickupCode/delByIds`, params);
};

// * 获取订桌/货架数据
export const getPickupCodeList = (params: PickupCode.ReqPickupCodeParams) => {
  return http.getRow<PickupCode.ResPickupCode[]>(PORT1 + `/productdisplay/pickupCode/list`, params);
};

// * 批量修改状态
export const batchUpdatePickupCodeStatus = (params: PickupCode.BatchUpdatePickupCodeStatus) => {
  return http.post(PORT1 + `/productdisplay/pickupCode/enabled`, params);
};
