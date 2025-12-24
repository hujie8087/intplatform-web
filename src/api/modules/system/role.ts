// 系统角色接口管理
import { ResPage } from "@/api/interface/index";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { Building } from "@/api/interface/productDisplay/building";
import { Account, Menu, Role } from "@/api/interface/system";

/**
 * @name 角色管理模块
 */
// * 获取角色列表
export const getRoleList = (params: Role.ReqRoleParams) => {
  return http.getNoData<ResPage<Role.ResRole>>(PORT1 + `/system/role/list`, params);
};

// * 新增角色
export const addRole = (params: FormData) => {
  return http.post<ResPage<Role.ResRole>>(PORT1 + `/system/role`, params);
};

// * 获取角色详情
export const getRoleInfo = (id: number) => {
  return http.get<ResPage<Role.ResRole>>(PORT1 + `/system/role/${id}`);
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
  return http.get<Building.ResBuilding[]>(PORT1 + `/maintenance/building/firstlist`);
};

// * 获取角色下拉列表
export const getRoleSelectList = () => {
  return http.get<Role.ResRole[]>(PORT1 + `/system/role/listAll`);
};

// * 获取角色帐号树结构
export const getRoleUserNumber = () => {
  return http.get<Role.ResRoleUser[]>(PORT1 + `/system/user/role/list`);
};

// * 获取角色下用户列表
export const getRoleUserList = (params: Account.ReqRoleUserParams) => {
  return http.getRow<Account.ResRoleUserList>(PORT1 + `/system/role/userList/${params.roleId}`, params);
};

// * 取消用户授权角色
export const cancelAuth = ({ roleId, userName }: { roleId: number; userName: string }) => {
  return http.put(PORT1 + `/system/role/authUser/cancel`, { roleId, userName });
};

// * 批量取消用户授权角色
export const cancelAuthAll = ({ roleId, userIds }: { roleId: string; userIds: string[] }) => {
  return http.put(PORT1 + `/system/role/authUser/cancelAll?roleId=${roleId}`, userIds);
};

// * 新增用户授权角色
export const addAuth = (params: any) => {
  return http.put(PORT1 + `/system/role/authUser/selectAll?roleId=${params.roleId}`, params.userInfo);
};

// * 获取角色详情
export const getRoleMenuTreeselect = (roleId: number) => {
  return http.get<Menu.ResMenu[]>(PORT1 + `/system/menu/roleMenu/${roleId}`);
};

// * 获取角色详情
export const getUserRole = (roleId: number) => {
  return http.get<Role.ResRoleUserDetail>(PORT1 + `/system/role/getUserRole/${roleId}`);
};
