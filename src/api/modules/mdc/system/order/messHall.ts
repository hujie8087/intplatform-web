import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

// 查询食堂列表
export function listMessHall(params: any) {
  return http.get<any>(PORT1 + "/system/mdc/messHall/list", params);
}

// 查询食堂详细
export function getMessHall(messHallId: string) {
  return http.get<any>(PORT1 + "/system/mdc/messHall/" + messHallId);
}

// 查询所有食堂名称列表
export function queryAllMessHallNameList() {
  return http.get<any>(PORT1 + "/system/mdc/messHall/queryAllMessHallNameList");
}

// 新增食堂
export function addMessHall(data: any) {
  return http.post<any>(PORT1 + "/system/mdc/messHall", data);
}

// 修改食堂
export function updateMessHall(data: any) {
  return http.put<any>(PORT1 + "/system/mdc/messHall", data);
}

// 删除食堂
export function delMessHall(messHallId: string) {
  return http.delete<any>(PORT1 + "/system/mdc/messHall/" + messHallId);
}

// 状态修改
export function changeMessHallStatus(messHallId: string) {
  return http.put<any>(PORT1 + "/system/mdc/messHall/enable/" + messHallId);
}

//查询食堂信息
export function queryMessHall() {
  return http.get<any>(PORT1 + "/system/mdc/messHall/queryAllMessHallNameList");
}
