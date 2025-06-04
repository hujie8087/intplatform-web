// 位置收集模块
import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { DeliveryStation } from "@/api/interface/delivery/station";
import { LocationCollection } from "@/api/interface/delivery/locationCollection";
// 获取所有站点
export const getStationListApi = () => {
  return http.get<LocationCollection.ResLocationCollection[]>(PORT1 + `/system/mdc/site/queryAllSiteAddressList`);
};

// * 获取位置收集列表
export const getLocationCollectionList = (params: DeliveryStation.ReqDeliveryStationParams) => {
  return http.getRow<DeliveryStation.ResDeliveryStation>(PORT1 + `/delivery/sourceMsg/list`, params);
};

// * 新增位置收集
export const addLocationCollection = (params: DeliveryStation.ReqDeliveryStationParams) => {
  return http.post(PORT1 + `/delivery/sourceMsg/addStation`, params);
};

// * 编辑位置收集
export const editLocationCollection = (params: { fsIds: string; latitude: string; longitude: string }) => {
  return http.put(
    PORT1 + `/system/mdc/site/modifySiteLocation?fsIds=${params.fsIds}&latitude=${params.latitude}&longitude=${params.longitude}`
  );
};

// * 删除位置收集
export const deleteLocationCollection = (id: number) => {
  return http.delete(PORT1 + `/delivery/sourceMsg/${id}`);
};

// * 获取配送站信息
export const getLocationCollectionById = (id: number) => {
  return http.get<DeliveryStation.ResDeliveryStation>(PORT1 + `/delivery/sourceMsg/${id}`);
};
// * 获取位置收集列表(不带分页)
export const getLocationCollection = () => {
  return http.get<DeliveryStation.ResDeliveryStation[]>(PORT1 + `/delivery/sourceMsg`);
};
