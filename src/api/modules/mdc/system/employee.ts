import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { Employee } from "@/api/interface/mealDelivery/system/employee";

// 查询员工列表
export function listEmployee(query) {
  return http.getUrl<Employee.ResEmployee>(PORT1 + "/system/mdc/employee/list", query);
}

// 查询员工树列表
export function listEmployeeTree(query) {
  return http.get<Employee.ResEmployee>(PORT1 + "/system/mdc/employee/employeeTree", query);
}

// 查询员工列表（排除节点）
export function listEmployeeExcludeChild(employeeId) {
  return http.get<Employee.ResEmployee>(PORT1 + "/system/mdc/employee/list/exclude/" + employeeId);
}

// 查询员工详细
export function getEmployee(employeeId) {
  return http.get<Employee.ResEmployee>(PORT1 + "/system/mdc/employee/" + employeeId);
}

// 新增员工
export function addEmployee(data) {
  return http.post<Employee.ResEmployee>(PORT1 + "/system/mdc/employee", data);
}

// 修改员工
export function updateEmployee(data) {
  return http.put<Employee.ResEmployee>(PORT1 + "/system/mdc/employee", data);
}

// 删除部门
export function delEmployee(employeeId) {
  return http.delete<any>(PORT1 + "/system/mdc/employee/" + employeeId);
}

// 修改员工状态
export function changeEmployeeStatus(employeeId) {
  return http.put<Employee.ResEmployee>(PORT1 + "/system/mdc/employee/enable/" + employeeId);
}

// 批量添加员工
export function batchAddEmployee(data) {
  return http.post<Employee.ResEmployee>(PORT1 + "/system/mdc/employee/importData", data);
}
