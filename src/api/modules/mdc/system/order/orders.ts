import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { Settlement } from "@/api/interface/mealDelivery/settlement";
import { WaterSettlement } from "@/api/interface/mealDelivery/waterSettlement";
import { MdcOrder } from "@/api/interface/mealDelivery/order";

// 查询订单列表
export function listOrders(params: any) {
  return http.getUrl<MdcOrder.ResMdcOrder[]>(PORT1 + "/order/orders/systemList", params);
}

// 查询餐厅列表
export function canteensList(params: any) {
  return http.getUrl<MdcOrder.ResMdcOrder[]>(PORT1 + "/order/orders/canteensList", params);
}

// 查询订单结算列表
export function queryFoodOrderSettlementList(params: any) {
  return http.getUrl<Settlement.ResSettlement>(PORT1 + "/order/orders/queryfoodordersettlementlist", params);
}

// 订水结算列表
export function queryWaterOrderSettlementList(params: any) {
  return http.getRow<WaterSettlement.ResWaterSettlement>(PORT1 + "/order/orders/queryfoodorderwatersettlementlist", params);
}

// 查询订单详细
export function getOrders(ordersId: string) {
  return http.get<any>(PORT1 + "/order/orders/" + ordersId);
}

// 新增订单
export function addOrders(data: any) {
  return http.post<any>(PORT1 + "/order/orders", data);
}

// 修改订单
export function updateOrders(data: any) {
  return http.put<any>(PORT1 + "/order/orders/pcEdit", data);
}

// 删除订单
export function delOrders(ordersId) {
  return http.delete<any>(PORT1 + "/order/orders/" + ordersId);
}
// 订单中心 确认订单
export function confirmOrdersStatus(ordersId: string) {
  return http.post<any>(PORT1 + "/order/orders/confirmOrder/" + ordersId);
}

// 审核通过
export function approve(ordersId: string) {
  return http.put<any>(PORT1 + "/order/orders/approve/" + ordersId);
}

// 审核驳回
export function reject(data: any) {
  return http.put<any>(PORT1 + "/order/orders/reject", data);
}

// 子表：查询用户信息
export function selectOrderUserList(order) {
  return http.get<any>(PORT1 + "/order/detil/selectAllByOrderNo/" + order);
}

// 查询补单列表
export function updateList(query: any) {
  return http.get<any>(PORT1 + "/order/orders/updateList", { params: query });
}

// 订单中心-确认订单
export function receiveOrder(ordersId) {
  return http.post<any>(PORT1 + "/order/orders/receiveOrder/" + ordersId);
}

// 订单中心-更新打印状态
export function updatePrintStatus(ordersId: string) {
  return http.post<any>(PORT1 + "/order/orders/confirmPrint/" + ordersId);
}

//获取车号信息
export function getCarNoList() {
  return http.get<any>(PORT1 + "/system/carInfo/queryAllCarNameList");
}

//导出excel
export function exportOrders(query: any) {
  return http.get<any>(PORT1 + "/order/orders/export", { params: query });
}

//导出部门订单核对
export function exportDeptOrderCheck(query: any) {
  // return http.post<any>(PORT1 + "/order/orders/exportDeptOrderCheck", { params: query });
  return http.post<any>(PORT1 + "/order/orders/exportDeptOrderCheck", query);
}

//导出明细
export function exportOrders3(query: any) {
  return http.post<any>(PORT1 + "/order/orders/export3", query);
}

//导出结算
export function exportSettlement(query: any) {
  return http.post<any>(PORT1 + "/order/orders/exportSettlement", query);
}

// 订水结算单导出
export function exportWaterSettlement(data: any) {
  return http.post<any>(PORT1 + "/order/orders/exportWaterSettlement", data);
}

//导出核对
export function exportCheck(data: any) {
  return http.post<any>(PORT1 + "/order/orders/exportCheck2", data);
}

//部门批量提交
export function batchSubmit(data: any) {
  return http.put<any>(PORT1 + "/order/orders/deptSubmit/" + data);
}

//部门驳回
export function deptReject(data: any) {
  return http.post<any>(PORT1 + "/order/orders/deptreject?orderId=" + data);
}

// 订餐中心复制订单
export function copyOrder(data: any) {
  return http.post<any>(PORT1 + "/order/orders/copyToNewOrder", data);
}

// 订单中心驳回订单
export function orderReject(data: any) {
  return http.post<any>(PORT1 + "/order/orders/orderreject?orderId=" + data);
}

// 食堂驳回订单
export function canteenReject(data: any) {
  return http.post<any>(PORT1 + "/order/orders/canteenreject?orderId=" + data);
}

// 食堂 确认订单已打印
export function canteenConfirmPrint(ordersId: string) {
  return http.post<any>(PORT1 + "/order/orders/canteenConfirmPrint/" + ordersId);
}

export function queryFoodOrderDeliverySummaryList(data: any) {
  return http.post<MdcOrder.ResFoodOrderDeliverySummary[]>(
    PORT1 + "/order/orders/queryfoodorderdeliverysummarylist?oIds=" + data
  );
}

// 送达功能
export function orderDelivered(ordersId) {
  return http.put<any>(PORT1 + "/order/orders/completeOrder3/" + ordersId);
}

// 获取图片
export function getImage(imageUrl: string, w: number, h: number) {
  return http.get<any>(PORT1 + "/file/mdc/image?filename=" + imageUrl + "&w=" + w + "&h=" + h);
}
