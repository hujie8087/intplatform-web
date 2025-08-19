// 系统菜单接口管理
import { ResPage } from "@/api/interface/index";
import { Menu } from "@/api/interface/mealDelivery/system/menu";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
// 查询菜单列表
export function listMenu(query) {
  return http.get<ResPage<Menu.ResMenu>>(PORT1 + "/system/mdc/menu/list", query);
}

// 查询菜单详细
export function getMenu(menuId: number) {
  return http.get<Menu.ResMenu>(PORT1 + "/system/mdc/menu/" + menuId);
}

// 查询菜单下拉树结构
export function treeselect() {
  return http.get<Menu.ResMenu[]>(PORT1 + "/system/mdc/menu/treeselect");
}

// 根据角色ID查询菜单下拉树结构
export function roleMenuTreeselect(roleId) {
  return http.get<Menu.ResMenu>(PORT1 + "/system/mdc/menu/roleMenuTreeselect/" + roleId);
}

// 新增菜单
export function addMenu(data) {
  return http.post<Menu.ResMenu>(PORT1 + "/system/mdc/menu", data);
}

// 修改菜单
export function updateMenu(data) {
  return http.put<Menu.ResMenu>(PORT1 + "/system/mdc/menu", data);
}

// 删除菜单
export function delMenu(menuId) {
  return http.delete<Menu.ResMenu>(PORT1 + "/system/mdc/menu/" + menuId);
}
