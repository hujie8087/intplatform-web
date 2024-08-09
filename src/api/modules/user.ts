import { ResPage, User } from "@/api/interface/index";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { Menu } from "../interface/system";

/**
 * @name 用户管理模块
 */
// 获取用户列表
export const getUserList = (params: User.ReqUserParams) => {
  return http.get<ResPage<User.ResUserList>>(PORT1 + `/system/user/list`, params);
};

// 获取树形用户列表
export const getUserTreeList = (params: User.ReqUserParams) => {
  return http.post<ResPage<User.ResUserList>>(PORT1 + `/system/user/tree/list`, params);
};

// 新增用户
export const addUser = (params: FormData) => {
  return http.post(PORT1 + `/system/user`, params);
};

// 批量添加用户
export const BatchAddUser = (params: FormData) => {
  return http.post(PORT1 + `/system/user/importData`, params);
};

// 编辑用户
export const editUser = (params: { id: string }) => {
  return http.post(PORT1 + `/system/user/edit`, params);
};

// 删除用户
export const deleteUser = (params: { id: string[] }) => {
  return http.delete(PORT1 + `/system/user`, params);
};

// 切换用户状态
export const changeUserStatus = (params: { id: string; status: number }) => {
  return http.post(PORT1 + `/system/user/change`, params);
};

// 重置用户密码
export const resetUserPassWord = (params: { userId: number; password: string }) => {
  return http.put(PORT1 + `/system/user/resetPwd`, params);
};

// 导出用户数据
export const exportUserInfo = (params: User.ReqUserParams) => {
  return http.download(PORT1 + `/system/user/export`, params);
};

// 获取用户状态字典
export const getUserStatus = () => {
  return http.get<User.ResStatus[]>(PORT1 + `/system/user/status`);
};

// 获取用户性别字典
export const getUserGender = () => {
  return http.get<User.ResGender[]>(PORT1 + `/system/user/gender`);
};

// 获取用户部门列表
export const getUserDepartment = () => {
  return http.get<User.ResDepartment[]>(PORT1 + `/system/user/deptTree`, {}, { cancel: false });
};

// 获取用户角色字典
export const getUserRole = () => {
  return http.get<User.ResRole[]>(PORT1 + `/system/user/role`);
};

// 查询菜单列表
export const getMenuList = () => {
  return http.get<Menu.MenuOptions[]>(PORT1 + `/system/menu/list`);
};

// 查询菜单详情
export const getMenuById = (id: number) => {
  return http.get<Menu.MenuOptions>(PORT1 + `/system/menu/${id}`);
};

// 新增菜单
export const addMenu = (params: Menu.MetaProps) => {
  return http.post(PORT1 + `/system/menu`, params);
};

// 编辑菜单
export const editMenu = (params: Menu.MetaProps) => {
  return http.put(PORT1 + `/system/menu`, params);
};

// 删除菜单
export const deleteMenu = (id: string) => {
  return http.delete(PORT1 + `/system/menu/${id}`);
};
