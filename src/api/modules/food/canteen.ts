// 餐厅管理
import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { Canteen } from "@/api/interface/food/canteen";

/**
 * @name 餐厅管理模块
 */

// * 新增餐厅
export const addCanteen = (params: FormData) => {
  return http.post(PORT1 + `/commonality/food/canteen`, params);
};

// * 编辑餐厅
export const editCanteen = (params: FormData) => {
  return http.put(PORT1 + `/commonality/food/canteen`, params);
};

// * 删除餐厅
export const deleteCanteen = (id: number) => {
  return http.delete(PORT1 + `/commonality/food/canteen/${id}`);
};

// * 获取餐厅信息
export const getCanteenById = (id: number) => {
  return http.get<Canteen.ResCanteen>(PORT1 + `/commonality/food/canteen/${id}`);
};

// * 批量删除餐厅
export const deleteMoreCanteen = (params: number[]) => {
  return http.post(PORT1 + `/commonality/food/canteen/delByIds`, params);
};

// * 获取宿舍餐厅数据
export const getCanteenList = (params: Canteen.ReqCanteenParams) => {
  return http.get<Canteen.ResCanteen[][]>(PORT1 + `/commonality/food/canteen/getList`, params);
};
