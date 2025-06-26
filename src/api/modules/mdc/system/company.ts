import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { Company } from "@/api/interface/mealDelivery/system/company";

// 查询公司列表
export function listCompany(query) {
  return http.getRow<Company.ResCompany>(PORT1 + "/system/mdc/company/list", query);
}

// 查询公司树列表
export function queryCompanyOptionList() {
  return http.get<Company.ResCompany[]>(PORT1 + "/system/mdc/company/options");
}

// 查询公司列表（排除节点）
export function listCompanyExcludeChild(companyId) {
  return http.get<Company.ResCompany>(PORT1 + "/system/mdc/company/list/exclude/" + companyId);
}

// 查询公司详细
export function getCompany(companyId) {
  return http.get<Company.ResCompany>(PORT1 + "/system/mdc/company/" + companyId);
}

// 新增公司
export function addCompany(data) {
  return http.post<Company.ResCompany>(PORT1 + "/system/mdc/company", data);
}

// 修改公司
export function updateCompany(data) {
  return http.put<Company.ResCompany>(PORT1 + "/system/mdc/company", data);
}

// 删除公司
export function delCompany(companyId) {
  return http.delete<any>(PORT1 + "/system/mdc/company/" + companyId);
}
