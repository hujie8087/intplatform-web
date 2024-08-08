import { Dict } from "@/api/interface/system";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name 系统字典管理模块
 */

// * 新增系统字典类型
export const addDict = (params: FormData) => {
  return http.post(PORT1 + `/system/dict/type`, params);
};

// * 编辑系统字典类型
export const editDict = (params: FormData) => {
  return http.put(PORT1 + `/system/dict/type`, params);
};

// * 删除系统字典类型
export const deleteDict = (id: number) => {
  return http.delete(PORT1 + `/system/dict/type/${id}`);
};
// * 获取系统字典类型详情
export const getDictById = (id: number) => {
  return http.get<Dict.ResDict>(PORT1 + `/system/dict/type/${id}`);
};

// * 获取字典类型数据
export const getDictList = (params: Dict.ReqDictParams) => {
  return http.get<Dict.ResDict[]>(PORT1 + `/system/dict/type/list`, params);
};

// * 刷新字典缓存
export const refreshCache = () => {
  return http.delete(PORT1 + `/system/dict/type/refreshCache`);
};

// * 获取字典选择框列表
export const getDictSelect = () => {
  return http.get<Dict.ResDict[]>(PORT1 + `/system/dict/type/optionselect`);
};

// * 获取字典数据列表
export const getDictDataList = (params: Dict.ReqDictDataParams) => {
  return http.get<Dict.ResDictData[]>(PORT1 + `/system/dict/data/list`, params);
};

// * 新增字典数据
export const addDictData = (params: FormData) => {
  return http.post(PORT1 + `/system/dict/data`, params);
};

// * 编辑字典数据
export const editDictData = (params: FormData) => {
  return http.put(PORT1 + `/system/dict/data`, params);
};

// * 删除字典数据
export const deleteDictData = (dictCode: number) => {
  return http.delete(PORT1 + `/system/dict/data/${dictCode}`);
};

// * 获取字典数据详情
export const getDictDataById = (dictCode: number) => {
  return http.get<Dict.ResDictData>(PORT1 + `/system/dict/data/${dictCode}`);
};

// * 根据字典类型获取字典数据
export const getDictDataByType = (dictType: string) => {
  return http.get<Dict.ResDictData[]>(PORT1 + `/system/dict/data/type/${dictType}`);
};

// * 导出字典类型
export const exportDictInfo = (params: Dict.ReqDictParams) => {
  return http.download(PORT1 + `/system/dict/type/export`, params);
};

// * 导出字典数据
export const exportDictDataInfo = (params: Dict.ReqDictParams) => {
  return http.download(PORT1 + `/system/dict/data/export`, { ...params });
};
