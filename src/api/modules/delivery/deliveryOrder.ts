// * 配送订单模块
import { DeliveryOrder } from "@/api/interface/delivery/deliveryOrder";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

// * 获取配送订单列表
export const getDeliveryOrderList = (params: DeliveryOrder.ReqDeliveryOrderParams) => {
  return http.getRow<DeliveryOrder.ResDeliveryOrder>(PORT1 + `/delivery/orderDeliveryTrip`, params);
};

// * 获取配送订单详情
export const getDeliveryOrderById = (id: number) => {
  return http.get<DeliveryOrder.ResDeliveryOrderById>(PORT1 + `/delivery/orderDeliveryTrip/${id}`);
};

// * 新增配送订单
export const addDeliveryOrder = (data: DeliveryOrder.ReqAddDeliveryOrder) => {
  return http.post<DeliveryOrder.ResDeliveryOrder>(PORT1 + `/delivery/orderDeliveryTrip`, data);
};

// * 修改配送订单
export const editDeliveryOrder = (data: DeliveryOrder.ResDeliveryOrder) => {
  return http.put<DeliveryOrder.ResDeliveryOrder>(PORT1 + `/delivery/orderDeliveryTrip`, data);
};

// * 删除配送订单
export const deleteDeliveryOrder = (id: number) => {
  return http.delete<DeliveryOrder.ResDeliveryOrder>(PORT1 + `/delivery/orderDeliveryTrip/${id}`);
};

// * 取消配送订单
export const cancelDeliveryOrder = (params: { id: number; deliveryNo: string }) => {
  return http.put<DeliveryOrder.ResDeliveryOrder>(PORT1 + `/delivery/orderDeliveryTrip/cancelTrip`, params);
};

// * 获取待配送订单
export const getFPOrderList = (params: DeliveryOrder.ReqDeliveryOrderParams) => {
  return http.getRow<DeliveryOrder.ResDeliveryOrder>(PORT1 + `/delivery/orderDeliveryTrip/FPOrder`, params);
};
