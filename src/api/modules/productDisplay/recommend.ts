import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { Recommend } from "@/api/interface/productDisplay/recommend";

// * 获取菜品推荐列表
export const getRecommendList = (params: Recommend.ReqRecommendParams) => {
  return http.get<Recommend.ResRecommend[]>(PORT1 + `/productdisplay/recommend/list`, params);
};

// * 新增菜品推荐
export const addRecommend = (params: Recommend.CreateRecommend) => {
  return http.post(PORT1 + `/productdisplay/recommend`, params);
};

// * 编辑菜品推荐
export const editRecommend = (params: Recommend.ResRecommend) => {
  return http.put(PORT1 + `/productdisplay/recommend`, params);
};

// * 删除菜品推荐
export const deleteRecommend = (id: number) => {
  return http.delete(PORT1 + `/productdisplay/recommend/${id}`);
};

// * 获取菜品推荐信息
export const getRecommendById = (id: number) => {
  return http.get<Recommend.ResRecommend>(PORT1 + `/productdisplay/recommend/${id}`);
};

// * 批量删除菜品推荐
export const deleteMoreRecommend = (params: number[]) => {
  return http.post(PORT1 + `/productdisplay/recommend/delByIds`, params);
};
