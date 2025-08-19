// 系统角色接口管理
import { ResPage } from "@/api/interface/index";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { Role } from "@/api/interface/mealDelivery/system/role";
import { Menu } from "@/api/interface/mealDelivery/system/menu";
import { Dept } from "@/api/interface/system";
import { User } from "@/api/interface/mealDelivery/system/user";

// 查询角色列表
export function listRole(query) {
  return http.get<ResPage<Role.ResRole>>(PORT1 + "/system/mdc/role/list", query);
}

// 查询角色详细
export function getRole(roleId) {
  return http.get<Role.ResRole>(PORT1 + "/system/mdc/role/" + roleId);
}

// 新增角色
export function addRole(data) {
  return http.post<Role.ResRole>(PORT1 + "/system/mdc/role", data);
}

// 修改角色
export function updateRole(data) {
  return http.put<Role.ResRole>(PORT1 + "/system/mdc/role", data);
}

// 角色数据权限
export function dataScope(data) {
  return http.put<Role.ResRole>(PORT1 + "/system/mdc/role/dataScope", data);
}

// 角色状态修改
export function changeRoleStatus(roleId, status) {
  const data = {
    roleId,
    status
  };
  return http.put<Role.ResRole>(PORT1 + "/system/mdc/role/changeStatus", data);
}

// 删除角色
export function delRole(roleId) {
  return http.delete<Role.ResRole>(PORT1 + "/system/mdc/role/" + roleId);
}

// 查询角色已授权用户列表
export function allocatedUserList(query) {
  return http.get<ResPage<User.ResUser>>(PORT1 + "/system/mdc/role/authUser/allocatedList", query);
}

// 查询角色未授权用户列表
export function unallocatedUserList(query) {
  return http.get<ResPage<Role.ResRole>>(PORT1 + "/system/mdc/role/authUser/unallocatedList", query);
}

// 取消用户授权角色
export function authUserCancel(data) {
  return http.put<Role.ResRole>(PORT1 + "/system/mdc/role/authUser/cancel", data);
}

// 批量取消用户授权角色
export function authUserCancelAll({ roleId, userIds }: { roleId: number; userIds: string }) {
  return http.put<Role.ResRole>(PORT1 + `/system/mdc/role/authUser/cancelAll?roleId=${roleId}&userIds=${userIds}`);
}

// 授权用户选择
export function authUserSelectAll({ roleId, userIds }: { roleId: number; userIds: string }) {
  return http.put<Role.ResRole>(PORT1 + `/system/mdc/role/authUser/selectAll?roleId=${roleId}&userIds=${userIds}`);
}

// 根据角色ID查询部门树结构
export function roleMenuTreeSelect(roleId: number) {
  return http.getNoData<Menu.ResMenuTree>(PORT1 + "/system/mdc/menu/roleMenuTreeselect/" + roleId);
}

// 根据角色ID查询部门树结构
export function roleDeptTreeSelect(roleId: number) {
  return http.getNoData<Dept.ResDeptTree>(PORT1 + "/system/mdc/role/deptTree/" + roleId);
}
