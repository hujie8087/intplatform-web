import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

// 查询车辆信息列表
export function listCarInfo(params: any) {
  return http.get<any>(PORT1 + "/system/mdc/carInfo/list", params);
}

// 查询所有车队名称列表
export function queryAllCarNameList() {
  return http.get<any>(PORT1 + "/system/mdc/carInfo/queryAllCarNameList");
}

// 查询车辆信息详细
export function getCarInfo(carInfoId) {
  return http.get<any>(PORT1 + "/system/mdc/carInfo/" + carInfoId);
}

// 新增车辆信息
export function addCarInfo(data) {
  return http.post<any>(PORT1 + "/system/mdc/carInfo", data);
}

// 修改车辆信息
export function updateCarInfo(data) {
  return http.put<any>(PORT1 + "/system/mdc/carInfo", data);
}

// 删除车辆信息
export function delCarInfo(carInfoId) {
  return http.delete<any>(PORT1 + "/system/mdc/carInfo/" + carInfoId);
}
// 状态修改
export function changeCarInfoStatus(carInfoId) {
  return http.put<any>(PORT1 + "/system/mdc/carInfo/enable/" + carInfoId);
}
