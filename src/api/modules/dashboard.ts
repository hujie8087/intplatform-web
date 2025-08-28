import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { DataVisualize } from "../interface/dashboard";

/**
 * @name 数据可视化模块
 */

// 维修单24小时完成率
export const getDeliveryOrderCount = (params: { beginTime?: string; endTime?: string }) => {
  return http.get<DataVisualize.ResDeliveryCompletionRate>(PORT1 + `/delivery/order/count`, { ...params });
};

// 餐饮大屏数据展示
export const getCateringScreenData = (params: { beginTime?: string; endTime?: string }) => {
  return http.get<DataVisualize.ResCateringScreenData>(PORT1 + `/productdisplay/food/order/cateringScreen`, {
    ...params
  });
};

// 人员统计信息
export const getPersonnelStatistics = params => {
  return http.get<DataVisualize.Personnel>(PORT1 + `system/statistics/data`, params);
};

// 维修统计信息
export const getRepairStatistics = (params: { dateType?: string; ancestors?: string }) => {
  return http.get<DataVisualize.RepairStatistics>(PORT1 + `maintenance/statistics/repair`, params);
};

// 排查隐患
export const getCheckHiddenDanger = (params: { dateType?: string; ancestors?: string }) => {
  return http.get<DataVisualize.CheckHiddenDanger>(PORT1 + `maintenance/statistics/hiddendanger`, params);
};
// 报餐送餐
export const getMealService = (params: { dateType?: string; ancestors?: string }) => {
  return http.get<DataVisualize.MealService>(PORT1 + `order/statistics/count`, params);
};
