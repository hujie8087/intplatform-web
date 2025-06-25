// 水单结算模块
import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { ResPage } from "@/api/interface";
import { WaterSettlement } from "@/api/interface/mealDelivery/waterSettlement";

/**
 * @name 水单结算模块
 */

// * 新增水单结算
export const addWaterSettlement = (params: FormData) => {
  return http.post(PORT1 + `/mealDelivery/waterSettlement`, params);
};

// * 编辑水单结算
export const editWaterSettlement = (params: FormData) => {
  return http.put(PORT1 + `/mealDelivery/waterSettlement`, params);
};

// * 获取水单结算信息
export const getWaterSettlementById = (id: number) => {
  return http.get<WaterSettlement.ResWaterSettlement>(PORT1 + `/mealDelivery/waterSettlement/${id}`);
};

// * 批量删除水单结算
export const deleteMoreWaterSettlement = (ids: number[]) => {
  return http.delete(PORT1 + `/mealDelivery/waterSettlement/${ids}`);
};

// * 获取水单结算列表
export const getWaterSettlementList = (params: WaterSettlement.ReqWaterSettlementParams) => {
  return http.get<ResPage<WaterSettlement.ResWaterSettlement>>(PORT1 + `/order/orders/queryfoodorderwatersettlementlist`, params);
};
