// 系统菜单接口管理
import { ResPage } from "@/api/interface/index";
import { Menu } from "@/api/interface/system";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name 菜单管理模块
 */
// * 获取菜单列表
export const getRoleList = (params: Menu.ReqMenuParams) => {
  return http.get<ResPage<Menu.ResMenu>>(PORT1 + `/system/menu/list`, params);
};

// * 新增菜单
export const addRole = (params: FormData) => {
  return http.post<ResPage<Menu.ResMenu>>(PORT1 + `/system/menu`, params);
};

// * 获取菜单详情
export const getRoleInfo = (id: number) => {
  return http.get<ResPage<Menu.ResMenu>>(PORT1 + `/system/menu/${id}`);
};

// * 编辑菜单
export const editRole = (params: FormData) => {
  return http.put(PORT1 + `/system/menu`, params);
};

// * 删除菜单
export const deleteRole = (id: number) => {
  return http.delete(PORT1 + `/system/menu/${id}`);
};
// * 批量菜单
export const deleteMoreRole = (params: number[]) => {
  return http.post(PORT1 + `/system/menu/delByIds`, params);
};

// * 根据角色获取菜单
export const getMenuSelect = (roleId: number) => {
  return http.getNoData<Menu.ResMenuTree>(PORT1 + `/system/menu/roleMenuTreeselect/` + roleId);
};

// * 获取菜单树
export const getMenuTree = () => {
  return http.get<Menu.ResMenu[]>(PORT1 + `/system/menu/treeselect`);
};
