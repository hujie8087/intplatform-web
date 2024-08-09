// 系统组织接口管理
import { AppVersion } from "@/api/interface/system";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name app版本管理模块
 */

// * 新增app版本
export const addAppVersion = (params: FormData) => {
  return http.post(PORT1 + `/other/app`, params);
};

// * 编辑app版本
export const editAppVersion = (params: FormData) => {
  return http.put(PORT1 + `/other/app`, params);
};

// * 删除app版本
export const deleteAppVersion = (id: number) => {
  return http.delete(PORT1 + `/other/app/${id}`);
};
// * 获取app版本详情
export const getAppVersionById = (id: number) => {
  return http.get<AppVersion.ResAppVersion>(PORT1 + `/other/app/${id}`);
};

// * 获取app版本列表数据
export const getAppVersionList = (params: AppVersion.ReqAppVersionParams) => {
  return http.get<AppVersion.ResAppVersion[]>(PORT1 + `/other/app/list`, params);
};

// * 上传APP安装包
export const uploadApp = (params: FormData) => {
  return http.post(PORT1 + `/file/uploadAPK`, params);
};
