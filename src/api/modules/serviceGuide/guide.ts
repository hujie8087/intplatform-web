// 服务指南内容
import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { Guide } from "@/api/interface/serviceGuide";

/**
 * @name 服务指南内容服务模块
 */

// 获取服务指南内容列表
export const getGuideList = (params: Guide.ReqGuide) => {
  return http.getRow<Guide.ResGuide>(PORT1 + `/other/guideArticle/list`, params);
};
// * 获取服务指南内容
export const getGuideById = (id: number) => {
  return http.get<Guide.ResGuide>(PORT1 + `/other/guideArticle/${id}`);
};
// * 新增服务指南内容
export const addGuide = (params: FormData) => {
  return http.post(PORT1 + `/other/guideArticle`, params);
};
// * 编辑服务指南内容
export const editGuide = (params: FormData) => {
  return http.put(PORT1 + `/other/guideArticle`, params);
};
// * 删除服务指南内容
export const deleteGuide = (id: number) => {
  return http.delete(PORT1 + `/other/guideArticle/${id}`);
};

// * 批量删除服务指南内容
export const deleteMoreGuide = (params: number[]) => {
  return http.post(PORT1 + `/other/guideArticle/delByIds`, params);
};
