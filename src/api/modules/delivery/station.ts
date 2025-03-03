// 配送站模块
import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { DeliveryStation } from "@/api/interface/delivery/station";

// * 获取配送站列表
export const getDeliveryStationList = (params: DeliveryStation.ReqDeliveryStationParams) => {
  return http.getRow<DeliveryStation.ResDeliveryStation>(PORT1 + `/delivery/sourceMsg/list`, params);
};

// * 新增配送站
export const addDeliveryStation = (params: DeliveryStation.ReqDeliveryStationParams) => {
  return http.post(PORT1 + `/delivery/sourceMsg/addStation`, params);
};

// * 编辑配送站
export const editDeliveryStation = (params: DeliveryStation.ReqDeliveryStationParams) => {
  return http.put(PORT1 + `/delivery/sourceMsg`, params);
};

// * 删除配送站
export const deleteDeliveryStation = (id: number) => {
  return http.delete(PORT1 + `/delivery/sourceMsg/${id}`);
};

// * 获取配送站信息
export const getDeliveryStationById = (id: number) => {
  return http.get<DeliveryStation.ResDeliveryStation>(PORT1 + `/delivery/sourceMsg/${id}`);
};
// * 获取配送站列表(不带分页)
export const getDeliveryStation = () => {
  return http.get<DeliveryStation.ResDeliveryStation[]>(PORT1 + `/delivery/sourceMsg`);
};
