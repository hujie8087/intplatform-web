// 系统参数接口管理
import { Config } from "@/api/interface/system";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name 系统参数管理模块
 */

// * 新增系统参数
export const addConfig = (params: FormData) => {
  return http.post(PORT1 + `/system/config`, params);
};

// * 编辑系统参数
export const editConfig = (params: FormData) => {
  return http.put(PORT1 + `/system/config`, params);
};

// * 删除系统参数
export const deleteConfig = (id: number) => {
  return http.delete(PORT1 + `/system/config/${id}`);
};
// * 获取系统参数详情
export const getConfigById = (id: number) => {
  return http.get<Config.ResConfig>(PORT1 + `/system/config/${id}`);
};

// * 获取系统参数列表
export const getConfigList = (params: Config.ReqConfigParams) => {
  return http.get<Config.ResConfig>(PORT1 + `/system/config/list`, params);
};

// * 导出系统参数
export const exportConfig = (params: Config.ReqConfigParams) => {
  return http.download(PORT1 + `/system/config/export`, { params });
};
// * 刷新系统缓存
export const refreshCache = () => {
  return http.delete(PORT1 + `/system/config/refreshCache`);
};
