// 车辆信息接口管理
import { Buses } from "@/api/interface/transportation";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name 车辆信息管理模块
 */

// * 新增车辆信息
export const addBuses = (params: FormData) => {
  return http.post(PORT1 + `/car/message`, params);
};

// * 编辑车辆信息
export const editBuses = (params: FormData) => {
  return http.put(PORT1 + `/car/message`, params);
};

// * 删除车辆信息
export const deleteBuses = (id: number) => {
  return http.delete(PORT1 + `/car/message/${id}`);
};
// * 获取车辆信息详情
export const getBusesById = (id: number) => {
  return http.get<Buses.ResBuses>(PORT1 + `/car/message/${id}`);
};

// * 获取车辆信息列表
export const getBusesList = (params: Buses.ReqBusesParams) => {
  return http.get<Buses.ResBuses>(PORT1 + `/car/message/list`, params);
};

// * 导出车辆信息
export const exportBuses = (params: Buses.ReqBusesParams) => {
  return http.download(PORT1 + `/car/message/export`, { params });
};
