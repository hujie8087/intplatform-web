// 公共便利服务
import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { Animals, OrganismType } from "@/api/interface/science/animals";

/**
 * @name 动物模块
 */

// * 新增动物
export const addAnimals = (params: FormData) => {
  return http.post(PORT1 + `/other/fauna`, params);
};

// * 编辑动物
export const editAnimals = (params: FormData) => {
  return http.put(PORT1 + `/other/fauna`, params);
};

// * 获取动物信息
export const getAnimalsById = (id: number) => {
  return http.get<Animals.ResAnimals>(PORT1 + `/other/fauna/${id}`);
};

// * 批量删除动物
export const deleteMoreAnimals = (ids: number[]) => {
  return http.delete(PORT1 + `/other/fauna/${ids}`);
};

// * 获取动物列表
export const getAnimalsList = (params: Animals.ReqAnimalsParams) => {
  return http.get<Animals.ResAnimals[]>(PORT1 + `/other/fauna/list`, params);
};

// * 上传图片
export const uploadImage = (params: FormData) => {
  return http.post(PORT1 + `/uploadFlora`, params);
};

// * 新增生物类型
export const addOrganismType = (params: FormData) => {
  return http.post(PORT1 + `/other/organismType`, params);
};

// * 编辑生物类型
export const editOrganismType = (params: FormData) => {
  return http.put(PORT1 + `/other/organismType`, params);
};

// * 获取生物类型信息
export const getOrganismTypeById = (id: number) => {
  return http.get<OrganismType.ResOrganismType>(PORT1 + `/other/organismType/${id}`);
};

// * 批量删除生物类型
export const deleteMoreOrganismType = (ids: number[]) => {
  return http.delete(PORT1 + `/other/organismType/${ids}`);
};

// * 获取生物类型列表
export const getOrganismTypeList = (params: OrganismType.ReqOrganismTypeParams) => {
  return http.getRow<OrganismType.ResOrganismType>(PORT1 + `/other/organismType/list`, params);
};

// * 获取生物类型树形列表
export const getOrganismTypeTreeList = (type: number) => {
  return http.getRow<OrganismType.ResOrganismType>(PORT1 + `/other/fauna/treeList/${type}`, { type: type });
};
