// 配送订单模块
import { OrderDelivery } from "@/api/interface/delivery/order";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
// 获取订单列表
export const getOrderList = (params: OrderDelivery.ReqOrderDeliveryParams) => {
  return http.getRow<OrderDelivery.ResOrderDelivery>(PORT1 + `/delivery/order/list`, params);
};

// 获取订单详情
export const getOrderById = (id: number) => {
  return http.get<OrderDelivery.ResOrderDeliveryDetail>(PORT1 + `/delivery/order/${id}`);
};

// 新增订单
export const addOrder = (data: OrderDelivery.ResOrderDelivery) => {
  return http.post<OrderDelivery.ResOrderDelivery>(PORT1 + `/delivery/order`, data);
};

// 修改订单
export const editOrder = (data: OrderDelivery.ResOrderDelivery) => {
  return http.put<OrderDelivery.ResOrderDelivery>(PORT1 + `/delivery/order`, data);
};

// 删除订单
export const deleteOrder = (id: number) => {
  return http.delete<OrderDelivery.ResOrderDelivery>(PORT1 + `/delivery/order/${id}`);
};

// 批量删除订单
export const batchDeleteOrder = (ids: number[]) => {
  return http.delete<OrderDelivery.ResOrderDelivery>(PORT1 + `/delivery/order/batchDelete`, { ids });
};
