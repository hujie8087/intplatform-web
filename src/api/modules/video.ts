import http from "@/api";
import { Gather, VideoLabel, VideoType } from "../interface/video";
import { ResPage } from "../interface";
import { PORT1 } from "../config/servicePort";

/**
 * @name 视频类型管理模块
 */
// 获取视频类型列表
export const getVideoTypeList = (params: VideoType.ReqVideoType) => {
  return http.getNoData<{ rows: VideoType.ResVideoType[] }>(PORT1 + `/video/type/list`, params);
};

// 新增视频类型
export const addVideoType = (params: VideoType.ResVideoType) => {
  return http.post(PORT1 + `/video/type`, params);
};

// 编辑视频类型信息
export const editVideoType = (params: VideoType.ResVideoType) => {
  return http.put(PORT1 + `/video/type`, params);
};

// 删除视频类型信息
export const deleteVideoType = (ids: string[]) => {
  return http.delete(PORT1 + `/video/type/${ids.join(",")}`);
};
/**
 * @name 视频管理模块
 */
// 获取视频列表
export const getGatherList = (params: Gather.ReqGather) => {
  return http.get<ResPage<Gather.ResGather>>(PORT1 + `/video/gather/list`, params);
};

// 新增视频
export const addGather = (params: Gather.CreateGather) => {
  return http.post(PORT1 + `/video/gather`, params);
};

// 编辑视频信息
export const editGather = (params: Gather.ResGather) => {
  return http.put(PORT1 + `/video/gather`, params);
};

// 删除视频信息
export const deleteGather = (ids: string[]) => {
  return http.delete(PORT1 + `/video/gather/${ids.join(",")}`);
};

// 获取视频详情
export const getGatherDetail = (id: string) => {
  return http.get<Gather.ResGather>(PORT1 + `/video/gather/${id}`);
};

/**
 * @name 视频标签管理模块
 */
// 获取视频标签列表
export const getVideoLabelList = (params: VideoLabel.ReqVideoLabel) => {
  return http.getNoData<{ rows: VideoLabel.ResVideoLabel[] }>(PORT1 + `/video/label/list`, params);
};

// 新增视频标签
export const addVideoLabel = (params: VideoLabel.ResVideoLabel) => {
  return http.post(PORT1 + `/video/label`, params);
};

// 编辑视频标签信息
export const editVideoLabel = (params: VideoLabel.ResVideoLabel) => {
  return http.put(PORT1 + `/video/label`, params);
};

// 删除视频标签信息
export const deleteVideoLabel = (ids: string[]) => {
  return http.delete(PORT1 + `/video/label/${ids.join(",")}`);
};
