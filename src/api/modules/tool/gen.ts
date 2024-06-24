import { ResPage } from "@/api/interface/index";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { Gen } from "@/api/interface/tool";

/**
 * @name 生产表管理模块
 */
// 获取生产表列表
export const listTable = (params: Gen.ReqGenParams) => {
  return http.get<ResPage<Gen.ResGenList>>(PORT1 + `/tool/gen/list`, params);
};

// 查询db数据库列表
export const listDbTable = (params: Gen.ReqGenParams) => {
  return http.get<ResPage<Gen.ResGenList>>(PORT1 + `/tool/gen/db/list`, params);
};

// 查询表详细信息
export const getGenTable = (tableId: number) => {
  return http.get<Gen.GenDetail>(PORT1 + `/tool/gen/${tableId}`);
};

// 编辑生产表
export const editGenTable = (params: any) => {
  return http.put(PORT1 + `/tool/gen`, params);
};

// 导入生产表
export const importTable = (params: any) => {
  return http.post(PORT1 + `/tool/gen/importTable`, params);
};

// 新增生产表
export const createTable = (params: FormData) => {
  return http.post(PORT1 + `/tool/gen/createTable`, params);
};

// 预览表详细信息
export const previewTable = (tableId: number) => {
  return http.get<Gen.Preview>(PORT1 + `/tool/gen/preview/${tableId}`);
};

// 删除生产表
export const deleteGenTable = (tableId: number) => {
  return http.delete(PORT1 + `/tool/gen/${tableId}`);
};

// 生成代码（自定义路径）
export const genCode = (tableName: string) => {
  return http.get<ResPage<Gen.ResGenList>>(PORT1 + `/tool/gen/genCode/${tableName}`);
};

// 同步数据库
export const synchDb = (tableName: string) => {
  return http.get<ResPage<Gen.ResGenList>>(PORT1 + `/tool/gen/synchDb/${tableName}`);
};
