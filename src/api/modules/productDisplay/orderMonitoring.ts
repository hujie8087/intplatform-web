// 餐厅管理
import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { OrderMonitoring } from "@/api/interface/productDisplay/orderMonitoring";

/**
 * @name 订单监控管理模块
 */

// * 获取宿舍餐厅数据
export const getOrderMonitoringList = (params: OrderMonitoring.ReqOrderMonitoringParams) => {
  return http.get<OrderMonitoring.ResOrderMonitoring[][]>(PORT1 + `/productdisplay/food/order/count`, params);
};
