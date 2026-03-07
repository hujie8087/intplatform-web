import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { CarListItem, DataVisualize, SiteInformationList } from "../interface/dashboard";

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
  return http.get<DataVisualize.Personnel>(PORT1 + `system/statistics/data`, params, { loading: false });
};
// 用户数据部门分析
export const getPersonCardBar = params => {
  return http.get(PORT1 + `system/statistics/data/distribution`, params, { loading: false });
};

// 维修统计信息
export const getRepairStatistics = (params: { dateType?: string; ancestors?: string }) => {
  return http.get<DataVisualize.RepairStatistics>(PORT1 + `maintenance/statistics/repair`, params, { loading: false });
};

// 排查隐患
export const getCheckHiddenDanger = (params: { dateType?: string; ancestors?: string }) => {
  return http.get<DataVisualize.CheckHiddenDanger>(PORT1 + `maintenance/statistics/hiddendanger`, params, { loading: false });
};
// 报餐送餐-汇总信息
export const getMealService = (params: { date?: string; foodName?: string; fcName?: string }) => {
  return http.get<DataVisualize.MealService>(PORT1 + `order/statistics/count`, params, { loading: false });
};
// 报餐送餐-站点信息
export const getSiteInformation = (params: { date?: string; foodName?: string; fcName?: string }) => {
  return http.get<SiteInformationList[]>(PORT1 + `/order/statistics/site`, params, { loading: false });
};

// 报餐送餐-货车轨迹
export const getCarLine = (params: { date?: string; foodName?: string; fcName?: string }) => {
  return http.get<CarListItem[]>(PORT1 + `/order/statistics/car/line`, params, { loading: false });
};

// 报餐送餐-指定车辆数据
export const getCarMessge = (params: { date?: string; foodName?: string; fcName?: string }) => {
  return http.get<DataVisualize.CarMessge>(PORT1 + `/order/statistics/car/data`, params, { loading: false });
};

// 报餐送餐-站点货物信息
export const getSiteInformationOfGoods = params => {
  return http.get<SiteInformationList[]>(PORT1 + `/order/statistics/queryFoodSiteOrderListOfSite`, params);
};
