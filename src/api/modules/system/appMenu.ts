// app菜单管理
import { AppMenu, AppMenuType } from "@/api/interface/system";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name app菜单管理模块
 */

// * 新增app菜单
export const addAppMenu = (params: FormData) => {
  return http.post(PORT1 + `/other/icon/article`, params);
};

// * 编辑app菜单
export const editAppMenu = (params: AppMenu.ResAppMenu) => {
  return http.put(PORT1 + `/other/icon/article`, params);
};

// * 删除app菜单
export const deleteAppMenu = (id: number) => {
  return http.delete(PORT1 + `/other/icon/article/${id}`);
};
// * 获取app菜单详情
export const getAppMenuById = (id: number) => {
  return http.get<AppMenu.ResAppMenu>(PORT1 + `/other/icon/article/${id}`);
};

// * 获取app菜单列表数据
export const getAppMenuList = (params: AppMenu.ReqAppMenuParams) => {
  return http.get<AppMenu.ResAppMenu[]>(PORT1 + `/other/icon/article/list`, params);
};

// * 获取app菜单类型列表数据
export const getAppMenuTypeList = (params: AppMenuType.ReqAppMenuTypeParams) => {
  return http.getRow<AppMenuType.ResAppMenuType>(PORT1 + `/other/icon/type/list`, params);
};

// * 新增app菜单类型
export const addAppMenuType = (params: FormData) => {
  return http.post(PORT1 + `/other/icon/type`, params);
};

// * 编辑app菜单类型
export const editAppMenuType = (params: AppMenuType.ResAppMenuType) => {
  return http.put(PORT1 + `/other/icon/type`, params);
};

// * 删除app菜单类型
export const deleteAppMenuType = (id: number) => {
  return http.delete(PORT1 + `/other/icon/type/${id}`);
};

// * 获取app菜单类型详情
export const getAppMenuTypeById = (id: number) => {
  return http.get<AppMenuType.ResAppMenuType>(PORT1 + `/other/icon/type/${id}`);
};

// * 获取app菜单类型列表数据
export const getAppMenuTypeAllList = () => {
  return http.get<AppMenuType.ResAppMenuType>(PORT1 + `/other/icon/type/iconAllList`);
};
