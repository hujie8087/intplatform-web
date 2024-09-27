// 系统用户接口管理
import { ResPage } from "@/api/interface/index";
import { Account } from "@/api/interface/system";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name 用户管理模块
 */
// * 获取用户列表
export const getUserList = (params: Account.ReqAccountParams) => {
  return http.get<ResPage<Account.ResAccountList>>(PORT1 + `/system/user/list`, params);
};

// * 新增用户
export const addUser = (params: FormData) => {
  return http.post<ResPage<Account.ResAccountList>>(PORT1 + `/system/user`, params);
};

// * 获取用户详情
export const getUserInfo = (id: number) => {
  return http.get<ResPage<Account.ResAccountList>>(PORT1 + `/system/user/${id}`);
};

// * 批量添加用户
export const BatchAddUser = (params: FormData) => {
  return http.post(PORT1 + `/system/user/import`, params);
};

// * 编辑用户
export const editUser = (params: FormData) => {
  return http.post(PORT1 + `/system/user/edit`, params);
};

// * 删除用户
export const deleteUser = (id: number) => {
  return http.delete(PORT1 + `/system/user/${id}`);
};
// * 批量用户
export const deleteMoreUser = (params: number[]) => {
  return http.post(PORT1 + `/system/user/delByIds`, params);
};

// * 获取用户部门列表
export const getUserDepartment = () => {
  return http.get<Account.ResDepartment[]>(PORT1 + `/system/user/deptTree`);
};

// * 重置用户密码
export const resetPassWord = (ids: number[]) => {
  return http.put(PORT1 + `/system/user/resetPwd`, ids);
};

// * 获取用户角色列表
export const getRoleSelect = () => {
  return http.get<Account.ResRole[]>(PORT1 + `/system/role/listAll`);
};
//  * 获取用户角色
export const getUserRole = (id: number) => {
  return http.getNoData<Account.ResRoleUser>(PORT1 + `/system/user/authRole/${id}`);
};
// * 设置用户角色
export const updateRole = ({ userId, roleIds }) => {
  return http.put(PORT1 + `/system/user/authRole?userId=${userId}&roleIds=${roleIds}`);
};

// * 修改用户状态
export const changeUserStatus = ({ userId, status }) => {
  return http.put(PORT1 + `/system/user/changeStatus`, { userId, status });
};

// * 修改用户密码
export const updatePassWord = (params: Account.ReqUpdatePassWord) => {
  return http.put(PORT1 + `/system/user/UpdatePwd`, params);
};
