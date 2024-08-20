// 系统角色接口管理
import { ResPage } from "@/api/interface/index";
import { Account } from "@/api/interface/system";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { Building } from "@/api/interface/food/building";

/**
 * @name 角色管理模块
 */
// * 获取角色列表
export const getRoleList = (params: Account.ReqAccountParams) => {
  return http.get<ResPage<Account.ResAccountList>>(PORT1 + `/system/role/list`, params);
};

// * 新增角色
export const addRole = (params: FormData) => {
  return http.post<ResPage<Account.ResAccountList>>(PORT1 + `/system/role`, params);
};

// * 获取角色详情
export const getRoleInfo = (id: number) => {
  return http.get<ResPage<Account.ResAccountList>>(PORT1 + `/system/role/${id}`);
};

// * 编辑角色
export const editRole = (params: FormData) => {
  return http.put(PORT1 + `/system/role`, params);
};

// * 删除角色
export const deleteRole = (id: number) => {
  return http.delete(PORT1 + `/system/role/${id}`);
};
// * 批量角色
export const deleteMoreRole = (params: number[]) => {
  return http.post(PORT1 + `/system/role/delByIds`, params);
};

// * 角色状态修改
export const changeRoleStatus = (params: { roleId: number; status: number }) => {
  return http.post(PORT1 + `/system/role/changeStatus`, params);
};

// * 获取生活区域第一级列表
export const getBuildingFirstList = () => {
  return http.get<Building.ResBuilding[]>(PORT1 + `/maintenance/food/building/firstlist`);
};
