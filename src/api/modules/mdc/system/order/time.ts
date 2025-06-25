import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { BasicTime } from "@/api/interface/mealDelivery/basic/time";
// 查询时间列表
export function listTime(params: any) {
  return http.getRow<BasicTime.ResBasicTime>(PORT1 + "/system/mdc/time/list", params);
}
// 查询公告详细
export function getTimeById(timeId: string) {
  return http.get<BasicTime.ResBasicTime>(PORT1 + "/system/mdc/time/" + timeId);
}

// 新增公告
export function addTime(data: any) {
  return http.post<BasicTime.ResBasicTime>(PORT1 + "/system/mdc/time", data);
}

// 修改公告
export function updateTime(data: any) {
  return http.put<BasicTime.ResBasicTime>(PORT1 + "/system/mdc/time", data);
}

// 删除公告
export function delTime(timeId: string) {
  return http.delete<any>(PORT1 + "/system/mdc/time/" + timeId);
}
// 状态修改
export function changeTimeStatus(timeId: string) {
  return http.put<any>(PORT1 + "/system/mdc/time/enable/" + timeId);
}
