// 餐厅管理
import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { DictOptionsType } from "@/api/interface";
import { Building } from "@/api/interface/productDisplay/building";
import { MarketCanteen } from "@/api/interface/productDisplay/marketCanteen";

/**
 * @name 餐厅管理模块
 */

// * 新增餐厅
export const addCanteen = (params: FormData) => {
  return http.post(PORT1 + `/productdisplay/marketCanteen`, params);
};

// * 编辑餐厅
export const editCanteen = (params: FormData) => {
  return http.put(PORT1 + `/productdisplay/marketCanteen`, params);
};

// * 删除餐厅
export const deleteCanteen = (id: number) => {
  return http.delete(PORT1 + `/productdisplay/marketCanteen/${id}`);
};

// * 获取餐厅信息
export const getCanteenById = (id: number) => {
  return http.get<MarketCanteen.ResMarketCanteen>(PORT1 + `/productdisplay/marketCanteen/${id}`);
};

// * 批量删除餐厅
export const deleteMoreCanteen = (params: number[]) => {
  return http.post(PORT1 + `/productdisplay/marketCanteen/delByIds`, params);
};

// * 获取宿舍餐厅数据
export const getCanteenList = (params: MarketCanteen.ReqMarketCanteenParams) => {
  return http.get<MarketCanteen.ResMarketCanteen[][]>(PORT1 + `/productdisplay/marketCanteen/list`, params);
};

// * 获取取餐类型
export const getPickupType = () => {
  return http.getRow<DictOptionsType>(PORT1 + `/productdisplay/pickupType/list`);
};

// * 切换餐厅状态
export const changeCanteenStatus = (params: { id: number; status: number }) => {
  return http.put(PORT1 + `/productdisplay/marketCanteen`, params);
};

// * 获取配送费选项
export const getDeliveryFee = () => {
  return http.getRow<DictOptionsType>(PORT1 + `/productdisplay/food/fee/list`);
};

// * 获取配送区域
export const getDeliveryAddress = () => {
  return http.getRow<DictOptionsType>(PORT1 + `/productdisplay/food/delivery/list`);
};

// * 获取配送时间
export const getDeliveryTime = () => {
  return http.getRow<DictOptionsType>(PORT1 + `/productdisplay/food/time/list`);
};

// * 获取区域列表
export const getNewAreaMenu = () => {
  return http.get<Building.ResBuilding[]>(PORT1 + `/productdisplay/food/delivery/newList`);
};
// * 获取餐厅数据列表
export const getCanteenListOptions = () => {
  return http.get<DictOptionsType[]>(PORT1 + `/productdisplay/marketCanteen/allList`);
};

// * 获取分类数据列表
export const getCategoryListOptions = (canteenId: number) => {
  return http.get<DictOptionsType[]>(PORT1 + `/productdisplay/category/typeList/${canteenId}`);
};
