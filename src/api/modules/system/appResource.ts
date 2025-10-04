// app菜单管理
import { AppResource } from "@/api/interface/system";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name app资源管理模块
 */

// * 新增app资源
export const addAppResource = (params: FormData) => {
  return http.post(PORT1 + `/other/appResource`, params);
};

// * 编辑app资源
export const editAppResource = (params: AppResource.ResAppResource) => {
  return http.put(PORT1 + `/other/appResource`, params);
};

// * 删除app菜单
export const deleteAppResource = (id: number) => {
  return http.delete(PORT1 + `/other/appResource/${id}`);
};
// * 获取app资源详情
export const getAppResourceById = (id: number) => {
  return http.get<AppResource.ResAppResource>(PORT1 + `/other/appResource/${id}`);
};

// * 获取app资源列表数据
export const getAppResourceList = (params: AppResource.ReqAppResourceParams) => {
  return http.get<AppResource.ResAppResource[]>(PORT1 + `/other/appResource/list`, params);
};
