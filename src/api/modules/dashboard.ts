import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { DataVisualize } from "../interface/dashboard";

/**
 * @name 数据可视化模块
 */

// 维修单24小时完成率
export const getDeliveryOrderCount = (params: { beginTime: string; endTime: string }) => {
  return http.get<DataVisualize.ResDeliveryCompletionRate>(PORT1 + `/delivery/order/count`, { ...params });
};

// 餐饮大屏数据展示
export const getCateringScreenData = (params: { beginTime: string; endTime: string }) => {
  return http.get<DataVisualize.ResCateringScreenData>(PORT1 + `/productdisplay/food/order/cateringScreen`, {
    ...params
  });
};
