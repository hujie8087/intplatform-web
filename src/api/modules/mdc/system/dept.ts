import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { Dept } from "@/api/interface/mealDelivery/system/dept";

// 查询部门列表
export function listDept(query) {
  return http.getRow<Dept.ResDept>(PORT1 + "/system/mdc/dept/list", query);
}

// 查询部门树列表
export function listDeptTree(query) {
  return http.get<Dept.ResDept>(PORT1 + "/system/mdc/dept/deptTree", query);
}

// 查询部门列表（排除节点）
export function listDeptExcludeChild(deptId) {
  return http.get<Dept.ResDept>(PORT1 + "/system/mdc/dept/list/exclude/" + deptId);
}

// 查询部门详细
export function getDept(deptId) {
  return http.get<Dept.ResDept>(PORT1 + "/system/mdc/dept/" + deptId);
}

// 新增部门
export function addDept(data) {
  return http.post<Dept.ResDept>(PORT1 + "/system/mdc/dept", data);
}

// 修改部门
export function updateDept(data) {
  return http.put<Dept.ResDept>(PORT1 + "/system/mdc/dept", data);
}

// 删除部门
export function delDept(deptId) {
  return http.delete<any>(PORT1 + "/system/mdc/dept/" + deptId);
}
