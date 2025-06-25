// 餐厅管理
import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { OrderPickup } from "@/api/interface/productDisplay/orderPickup";

/**
 * @name 订桌/货架管理模块
 */

// * 新增订桌/货架
export const addOrderPickup = (params: FormData) => {
  return http.post(PORT1 + `/productdisplay/food/pickup`, params);
};

// * 编辑订桌/货架
export const editOrderPickup = (params: FormData) => {
  return http.put(PORT1 + `/productdisplay/food/pickup`, params);
};

// * 删除订桌/货架
export const deleteOrderPickup = (id: number) => {
  return http.delete(PORT1 + `/productdisplay/food/pickup/${id}`);
};

// * 获取订桌/货架信息
export const getOrderPickupById = (id: number) => {
  return http.get<OrderPickup.ResOrderPickup>(PORT1 + `/productdisplay/food/pickup/${id}`);
};

// * 批量删除订桌/货架
export const deleteMoreOrderPickup = (params: number[]) => {
  return http.post(PORT1 + `/productdisplay/food/pickup/delByIds`, params);
};

// * 获取订桌/货架数据
export const getOrderPickupList = (params: OrderPickup.ReqOrderPickupParams) => {
  return http.getRow<OrderPickup.ResOrderPickup[]>(PORT1 + `/productdisplay/food/pickup/list`, params);
};
