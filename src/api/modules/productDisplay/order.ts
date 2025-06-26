// * 订单管理模块
import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { Order } from "@/api/interface/productDisplay/order";

/**
 * @name 订单管理模块
 */

// * 获取订单数据
export const getOrderList = (params: Order.ReqOrderParams) => {
  return http.get<Order.ResOrder[]>(PORT1 + `/productdisplay/food/order/list`, params);
};

// * 编辑订单
export const editOrder = (params: Order.ResOrder) => {
  return http.put(PORT1 + `/productdisplay/food/order`, params);
};

// * 删除订单
export const deleteOrder = (id: number) => {
  return http.delete(PORT1 + `/productdisplay/food/order/${id}`);
};

// * 获取订单信息
export const getOrderById = (id: number) => {
  return http.get<Order.ResOrder>(PORT1 + `/productdisplay/food/order/${id}`);
};

// * 批量删除订单
export const deleteMoreOrder = (params: number[]) => {
  return http.post(PORT1 + `/productdisplay/food/order/delByIds`, params);
};

// * 获取订单菜品列表
export const getOrderDishList = (params: { orderId: number; page: number; size: number }) => {
  return http.getRow<Order.ResOrderDish>(PORT1 + `/productdisplay/food/details/list`, params);
};

// * 修改订单状态
export const updateOrderStatus = (params: { id: number; status: number }) => {
  return http.put(PORT1 + `/productdisplay/food/order`, params);
};

// * 批量修改订单状态
export const updateMoreOrderStatus = (params: { id: number; status: number }[]) => {
  return http.put(PORT1 + `/productdisplay/food/order/updOrders`, params);
};

// * 导出订单
export const exportOrder = (params: Order.ReqOrderParams) => {
  return http.post(PORT1 + `/productdisplay/food/order/export`, params);
};

// 获取打印订单
export const getPrintOrder = (id: number) => {
  return http.get<Order.ResOrder[]>(PORT1 + `/productdisplay/findById/${id}`);
};

// 退款
export const refundOrder = (id: number) => {
  return http.get(PORT1 + `/productdisplay/food/order/depositById?id=${id}`);
};
