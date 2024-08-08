import { ResPage } from "@/api/interface/index";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { CommonalityType, Goods, Supermarket } from "../interface/commonality";

/**
 * @name 超市管理模块
 */
// 获取超市列表
export const getSupermarketList = (params: Supermarket.ReqSupermarket) => {
  return http.get<ResPage<Supermarket.ResSupermarket>>(PORT1 + `/commonality/supermarket/list`, params);
};

// 新增超市
export const addSupermarket = (params: Supermarket.ResSupermarket) => {
  return http.post(PORT1 + `/commonality/supermarket`, params);
};

// 编辑超市信息
export const editSupermarket = (params: Supermarket.ResSupermarket) => {
  return http.put(PORT1 + `/commonality/supermarket`, params);
};

// 删除超市信息
export const deleteSupermarket = (ids: string[]) => {
  return http.delete(PORT1 + `/commonality/supermarket/${ids.join(",")}`);
};

/**
 * @name 商品类型管理模块
 */
// 获取商品类型列表
export const getCommonalityTypeList = (params: CommonalityType.ReqCommonalityType) => {
  return http.get<ResPage<CommonalityType.ResCommonalityType>>(PORT1 + `/commonality/type/list`, params);
};

// 新增商品类型
export const addCommonalityType = (params: CommonalityType.ResCommonalityType) => {
  return http.post(PORT1 + `/commonality/type`, params);
};

// 编辑商品类型信息
export const editCommonalityType = (params: CommonalityType.ResCommonalityType) => {
  return http.put(PORT1 + `/commonality/type`, params);
};

// 删除商品类型信息
export const deleteCommonalityType = (ids: string[]) => {
  return http.delete(PORT1 + `/commonality/type/${ids.join(",")}`);
};

/**
 * @name 商品详情管理模块
 */
// 获取商品详情列表
export const getGoodsList = (params: Goods.ReqGoods) => {
  return http.get<ResPage<Goods.ResGoods>>(PORT1 + `/commonality/detil/list`, params);
};

// 新增商品详情
export const addGoods = (params: Goods.ResGoods) => {
  return http.post(PORT1 + `/commonality/detil`, params);
};

// 编辑商品详情信息
export const editGoods = (params: Goods.ResGoods) => {
  return http.put(PORT1 + `/commonality/detil`, params);
};

// 删除商品详情信息
export const deleteGoods = (ids: string[]) => {
  return http.delete(PORT1 + `/commonality/detil/${ids.join(",")}`);
};
