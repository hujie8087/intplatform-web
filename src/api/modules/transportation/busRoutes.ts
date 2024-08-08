// 车辆信息接口管理
import { BusRoutes } from "@/api/interface/transportation";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name 车辆信息管理模块
 */

// * 新增车辆信息
export const addBusRoutes = (params: FormData) => {
  return http.post(PORT1 + `/car/line`, params);
};

// * 编辑车辆信息
export const editBusRoutes = (params: FormData) => {
  return http.put(PORT1 + `/car/line`, params);
};

// * 删除车辆信息
export const deleteBusRoutes = (id: number) => {
  return http.delete(PORT1 + `/car/line/${id}`);
};
// * 获取车辆信息详情
export const getBusRoutesById = (id: number) => {
  return http.get<BusRoutes.ResBusRoutes>(PORT1 + `/car/line/${id}`);
};

// * 获取车辆信息列表
export const getBusRoutesList = (params: BusRoutes.ReqBusRoutesParams) => {
  return http.get<BusRoutes.ResBusRoutes>(PORT1 + `/car/line/list`, params);
};

// * 导出车辆信息
export const exportBusRoutes = (params: BusRoutes.ReqBusRoutesParams) => {
  return http.download(PORT1 + `/car/line/export`, { params });
};
