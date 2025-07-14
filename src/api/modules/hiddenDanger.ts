import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { HiddenDanger } from "../interface/hiddenDanger";
import { ResPage } from "../interface";

/**
 * @name 数据可视化模块
 */

// 隐患列表
export const getHiddenDangerList = (params: HiddenDanger.ReqHiddenDangerParams) => {
  return http.get<ResPage<HiddenDanger.ResHiddenDanger>>(PORT1 + `/maintenance/hidden/danger/list`, { ...params });
};

// 新增隐患
export const addHiddenDanger = (params: HiddenDanger.ResHiddenDanger) => {
  return http.post(PORT1 + `/maintenance/hidden/danger`, params);
};

// 编辑隐患
export const editHiddenDanger = (params: HiddenDanger.ResHiddenDanger) => {
  return http.put(PORT1 + `/maintenance/hidden/danger`, params);
};

// 删除隐患
export const deleteHiddenDanger = (ids: string[]) => {
  return http.delete(PORT1 + `/maintenance/hidden/danger/${ids.join(",")}`);
};

// 获取隐患详情
export const getHiddenDangerDetail = (id: number) => {
  return http.get<HiddenDanger.ResHiddenDanger>(PORT1 + `/maintenance/hidden/danger/${id}`);
};
