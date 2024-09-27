// 服务指南类型
import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { GuideType } from "@/api/interface/serviceGuide";

/**
 * @name 服务指南类型服务模块
 */

// 获取服务指南类型类型列表
export const getGuideTypeList = (params: GuideType.ReqGuideType) => {
  return http.getRow<GuideType.ResGuideType>(PORT1 + `/other/guideType/list`, params);
};
// * 获取服务指南类型类型
export const getGuideTypeById = (id: number) => {
  return http.get<GuideType.ResGuideType>(PORT1 + `/other/guideType/${id}`);
};
// * 新增服务指南类型类型
export const addGuideType = (params: FormData) => {
  return http.post(PORT1 + `/other/guideType`, params);
};
// * 编辑服务指南类型类型
export const editGuideType = (params: FormData) => {
  return http.put(PORT1 + `/other/guideType`, params);
};
// * 删除服务指南类型类型
export const deleteGuideType = (id: number) => {
  return http.delete(PORT1 + `/other/guideType/${id}`);
};

// * 批量删除服务指南类型
export const deleteMoreGuide = (params: number[]) => {
  return http.post(PORT1 + `/other/guideType/delByIds`, params);
};
