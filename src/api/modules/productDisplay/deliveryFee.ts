// 配送费管理
import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { DeliveryFee } from "@/api/interface/productDisplay/deliveryFee";

/**
 * @name 配送费管理模块
 */

// * 新增配送费
export const addDeliveryFee = (params: FormData) => {
  return http.post(PORT1 + `/productdisplay/food/fee`, params);
};

// * 编辑配送费
export const editDeliveryFee = (params: FormData) => {
  return http.put(PORT1 + `/productdisplay/food/fee`, params);
};

// * 删除配送费
export const deleteDeliveryFee = (id: number) => {
  return http.delete(PORT1 + `/productdisplay/food/fee/${id}`);
};

// * 获取配送费信息
export const getDeliveryFeeById = (id: number) => {
  return http.get<DeliveryFee.ResDeliveryFee>(PORT1 + `/productdisplay/food/fee/${id}`);
};

// * 获取配送费数据
export const getDeliveryFeeList = (params: DeliveryFee.ReqDeliveryFeeParams) => {
  return http.get<DeliveryFee.ResDeliveryFee[]>(PORT1 + `/productdisplay/food/fee/getList`, params);
};
