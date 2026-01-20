// 组织管理模块
import http from "@/api";
import { Organize } from "../interface/organize";
const baseURL = import.meta.env.VITE_API_HOME_URL;
/**
 * @name 组织管理模块
 */

// * 获取组织主节点
export const getOrganizeTree = (params: Organize.ReqOrganizeParams) => {
  return http.get<Organize.ResOrganize[]>(`/mis/upms/mis/organize/tree`, params, { baseURL: baseURL });
};

// * 编辑组织信息
export const editOrganize = (params: FormData) => {
  return http.put(`/mis/upms/mis/organize/put`, params, { baseURL: baseURL });
};

// * 获取组织信息详情
export const getOrganizeById = (id: number) => {
  return http.get<Organize.ResOrganize>(`/mis/upms/mis/organize/find/${id}`, { baseURL: baseURL });
};

// * 懒加载子节点
export const getOrganizeChildren = (pid: number) => {
  return http.get<Organize.ResOrganize[]>(`/mis/upms/mis/organize/tree/children/${pid}`, {}, { baseURL: baseURL });
};
