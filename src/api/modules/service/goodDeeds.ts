// 公共便利服务
import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { GoodDeeds } from "@/api/interface/service/goodDeeds";

/**
 * @name 好人好事服务模块
 */

// * 新增好人好事
export const addGoodDeeds = (params: FormData) => {
  return http.post(PORT1 + `/other/deeds`, params);
};

// * 编辑好人好事
export const editGoodDeeds = (params: FormData) => {
  return http.put(PORT1 + `/other/deeds`, params);
};

// * 删除好人好事
export const deleteGoodDeeds = (id: number) => {
  return http.delete(PORT1 + `/other/deeds/${id}`);
};

// * 获取好人好事信息
export const getGoodDeedsById = (id: number) => {
  return http.get<GoodDeeds.ResGoodDeeds>(PORT1 + `/other/deeds/${id}`);
};

// * 获取好人好事数据
export const getGoodDeedsList = (params: GoodDeeds.ReqGoodDeedsParams) => {
  return http.getRow<GoodDeeds.ResGoodDeeds>(PORT1 + `/other/deeds/list`, params);
};

// * 导出好人好事数据
export const exportGoodDeeds = (params: GoodDeeds.ReqGoodDeedsParams) => {
  return http.get(PORT1 + `/other/deeds/export`, params);
};

// * 审核好人好事
export const reviewGoodDeeds = (params: { id: number; status: number; reviewContent: string }) => {
  return http.put(PORT1 + `/other/deeds/review`, params);
};
