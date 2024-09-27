// 系统菜单接口管理
import { ResPage } from "@/api/interface/index";
import { Menu } from "@/api/interface/system";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name 菜单管理模块
 */
// * 获取菜单列表
export const getMenuList = (params: Menu.ReqMenuParams) => {
  return http.get<ResPage<Menu.ResMenu>>(PORT1 + `/system/menu/list`, params);
};

// * 新增菜单
export const addMenu = (params: FormData) => {
  return http.post<ResPage<Menu.ResMenu>>(PORT1 + `/system/menu`, params);
};

// * 获取菜单详情
export const getMenuInfo = (id: number) => {
  return http.get<ResPage<Menu.ResMenu>>(PORT1 + `/system/menu/${id}`);
};

// * 编辑菜单
export const editMenu = (params: FormData) => {
  return http.put(PORT1 + `/system/menu`, params);
};

// * 删除菜单
export const deleteMenu = (id: number) => {
  return http.delete(PORT1 + `/system/menu/${id}`);
};
// * 批量菜单
export const deleteMoreMenu = (params: number[]) => {
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
