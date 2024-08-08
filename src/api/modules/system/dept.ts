// 系统组织接口管理
import { Dept } from "@/api/interface/system";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { ResPage } from "@/api/interface";

/**
 * @name 系统部门管理模块
 */

// * 新增系统部门
export const addDept = (params: FormData) => {
  return http.post(PORT1 + `/system/dept`, params);
};

// * 编辑系统部门
export const editDept = (params: FormData) => {
  return http.put(PORT1 + `/system/dept`, params);
};

// * 删除系统部门
export const deleteDept = (id: number) => {
  return http.delete(PORT1 + `/system/dept/${id}`);
};
// * 获取系统部门详情
export const getDeptById = (id: number) => {
  return http.get<Dept.ResDept>(PORT1 + `/system/dept/${id}`);
};

// * 获取部门数据
export const getDeptTree = (params: Dept.ReqDeptParams) => {
  return http.get<ResPage<Dept.ResDept>>(PORT1 + `/system/dept/tree`, params);
};

// * 获取部门数据
export const getDeptList = (params: Dept.ReqDeptParams) => {
  return http.get<Dept.ResDept[]>(PORT1 + `/system/dept/list`, params);
};
// * 查询部门列表（排除节点）
export const listDeptExcludeChild = (deptId: number) => {
  return http.get<Dept.ResDept[]>(PORT1 + `/system/dept/list/exclude/${deptId}`);
};
