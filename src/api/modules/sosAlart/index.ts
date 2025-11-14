import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { ResPage } from "@/api/interface";
import { SosChart } from "@/api/interface/sosAlart";

// 查询SOS报警列表
export const listAlarm = (params: any) => {
  return http.get<ResPage<SosChart.ResChatMessageList>>(PORT1 + `/maintenance/report/list`, params);
};

// 查询SOS报警详细
export const getAlarm = (id: string) => {
  return http.get<SosChart.ResChatMessageList>(PORT1 + `/maintenance/report/${id}`);
};

// 新增SOS报警
export const createChatSession = (data: SosChart.ReqSendMessage) => {
  return http.post<SosChart.ResChatMessageList>(PORT1 + `/maintenance/report/add`, data);
};

//管理员审核乘客延长等待时间
export const approveWaitTimeExtension = (data: SosChart.TripWaitingExtension) => {
  return http.post<SosChart.TripWaitingExtension>(PORT1 + "/tripWaiting/approveWaitTimeExtension", data);
};

//查询延长等待时间详细信息
export function getTripWaitingDetail(id: string | number) {
  return http.get<SosChart.TripWaitingExtension>(PORT1 + `/tripWaiting/${id}`);
}

// 处理报警
export function processAlarm(data) {
  return http.put<SosChart.ResChatMessageList>(PORT1 + "/maintenance/report", data);
}
