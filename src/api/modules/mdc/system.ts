// 车辆管理接口模块
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

// 获取车辆数据
export const getAllCarNameList = () => {
  return http.get<{ fcId: number; fcName: string }[]>(PORT1 + `/system/mdc/carInfo/queryAllCarNameList`);
};

// 获取食堂列表数据
export const getAllMessHallNameList = () => {
  return http.get<{ fdId: number; fdName: string }[]>(PORT1 + `/system/mdc/messHall/queryAllMessHallNameList`);
};

// 获取配送站点列表
export const getAllSiteAddressList = () => {
  return http.get<{ fsIds: string; fsAddress: string }[]>(PORT1 + `/system/mdc/site/queryAllSiteAddressList`);
};
