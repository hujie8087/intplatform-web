// 公共便利服务
import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { Other } from "@/api/interface/service/other";

/**
 * @name 公共便利服务模块
 */

// * 新增公共便利
export const addOther = (params: FormData) => {
  return http.post(PORT1 + `/other/show`, params);
};

// * 编辑公共便利
export const editOther = (params: FormData) => {
  return http.put(PORT1 + `/other/show`, params);
};

// * 删除公共便利
export const deleteOther = (id: number) => {
  return http.delete(PORT1 + `/other/show/${id}`);
};

// * 获取公共便利信息
export const getOtherById = (id: number) => {
  return http.get<Other.ResOther>(PORT1 + `/other/show/${id}`);
};

// * 批量删除公共便利
export const deleteMoreOther = (params: number[]) => {
  return http.post(PORT1 + `/other/show/delByIds`, params);
};

// * 获取宿舍公共便利数据
export const getOtherList = (params: Other.ReqOtherParams) => {
  return http.get<Other.ResOther[]>(PORT1 + `/other/show/list`, params);
};
