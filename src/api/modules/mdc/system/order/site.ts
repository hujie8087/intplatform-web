import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

// 查询站点列表
export function listSite(params: any) {
  return http.get<any>(PORT1 + "/system/mdc/site/list", params);
}

// 查询所有站点名称列表
export function queryAllSiteNameList() {
  return http.get<any>(PORT1 + "/system/mdc/site/queryAllSiteNameList");
}

export function queryAllSiteAddressList() {
  return http.get<any>(PORT1 + "/system/mdc/site/queryAllSiteAddressList");
}

// 查询站点详细
export function getSite(siteId: string) {
  return http.get<any>(PORT1 + "/system/mdc/site/" + siteId);
}

// 新增站点
export function addSite(data: any) {
  return http.post<any>(PORT1 + "/system/mdc/site", data);
}

// 修改站点
export function updateSite(data: any) {
  return http.put<any>(PORT1 + "/system/mdc/site", data);
}

// 删除站点
export function delSite(siteId: string) {
  return http.delete<any>(PORT1 + "/system/mdc/site/" + siteId);
}

// 状态修改
export function changeSiteStatus(siteId) {
  return http.put<any>(PORT1 + "/system/mdc/site/enable/" + siteId);
}
