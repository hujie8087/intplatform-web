// 公共便利服务
import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { BusCar, BusDeparture, BusLine, BusStation } from "@/api/interface/bus";
import { Other } from "@/api/interface/service/other";

/**
 * @name 公共便利服务模块
 */

// * 新增公共便利
export const addOther = (params: FormData) => {
  return http.post(PORT1 + `/other/show`, params);
};

// * 编辑公共便利
export const editOther = (params: FormData) => {
  return http.put(PORT1 + `/other/show`, params);
};

// * 删除公共便利
export const deleteOther = (id: number) => {
  return http.delete(PORT1 + `/other/show/${id}`);
};

// * 获取公共便利信息
export const getOtherById = (id: number) => {
  return http.get<Other.ResOther>(PORT1 + `/other/show/${id}`);
};

// * 批量删除公共便利
export const deleteMoreOther = (params: number[]) => {
  return http.post(PORT1 + `/other/show/delByIds`, params);
};

// * 获取宿舍公共便利数据
export const getOtherList = (params: Other.ReqOtherParams) => {
  return http.get<Other.ResOther[]>(PORT1 + `/other/show/list`, params);
};

// * 获取公交站台数据
export const getBusStationList = (params: BusStation.ReqBusStation) => {
  return http.getRow<BusStation.ResBusStation>(PORT1 + `/other/site/list`, params);
};

// * 新增公交站台数据
export const addBusStation = (params: BusStation.ReqBusStation) => {
  return http.post(PORT1 + `/other/site`, params);
};

// * 编辑公交站台数据
export const editBusStation = (params: BusStation.ReqBusStation) => {
  return http.put(PORT1 + `/other/site`, params);
};

// * 删除公交站台数据
export const deleteBusStation = (id: number) => {
  return http.delete(PORT1 + `/other/site/${id}`);
};

// * 获取公交站台数据
export const getBusStationById = (id: number) => {
  return http.get<BusStation.ResBusStation>(PORT1 + `/other/site/${id}`);
};

// * 获取公交线路数据
export const getBusLineList = (params: BusLine.ReqBusLine) => {
  return http.getRow<BusLine.ResBusLine>(PORT1 + `/other/line/list`, params);
};

// * 新增公交线路数据
export const addBusLine = (params: BusLine.ReqBusLine) => {
  return http.post(PORT1 + `/other/line`, params);
};

// * 编辑公交线路数据
export const editBusLine = (params: BusLine.ResBusLine) => {
  return http.put(PORT1 + `/other/line`, params);
};

// * 编辑公交线路排序
export const editBusLineSort = (params: BusLine.ResBusLine) => {
  return http.put(PORT1 + `/other/line/editSort`, params);
};

// * 删除公交线路数据
export const deleteBusLine = (id: number) => {
  return http.delete(PORT1 + `/other/line/${id}`);
};
// 修改公交线路状态
export const updateBusLineStatus = (id: number) => {
  return http.get(PORT1 + `/other/line/updateStatus/${id}`);
};

// * 获取公交线路数据
export const getBusLineById = (id: number) => {
  return http.get<BusLine.ResBusLine>(PORT1 + `/other/line/${id}`);
};

// * 获取车辆数据
export const getBusCarList = (params: BusCar.ReqBusCar) => {
  return http.getRow<BusCar.ResBusCar>(PORT1 + `/other/message/list`, params);
};

// * 新增车辆数据
export const addBusCar = (params: BusCar.ReqBusCar) => {
  return http.post(PORT1 + `/other/message`, params);
};

// * 编辑车辆数据
export const editBusCar = (params: BusCar.ReqBusCar) => {
  return http.put(PORT1 + `/other/message`, params);
};

// * 删除车辆数据
export const deleteBusCar = (id: number) => {
  return http.delete(PORT1 + `/other/message/${id}`);
};

// * 获取车辆数据
export const getBusCarById = (id: number) => {
  return http.get<BusCar.ResBusCar>(PORT1 + `/other/message/${id}`);
};

// * 获取公交总时刻表
export const getBusDepartureList = (params: BusDeparture.ReqBusDeparture) => {
  return http.getRow<BusDeparture.ResBusDeparture>(PORT1 + `/other/departure/list`, params);
};
