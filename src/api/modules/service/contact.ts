// 公共便利服务
import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { Contact } from "@/api/interface/service/contact";

/**
 * @name 联系我们模块
 */

// * 新增联系人
export const addContact = (params: FormData) => {
  return http.post(PORT1 + `/system/connect`, params);
};

// * 编辑联系人
export const editContact = (params: FormData) => {
  return http.put(PORT1 + `/system/connect`, params);
};

// * 删除联系人
export const deleteContact = (id: number) => {
  return http.delete(PORT1 + `/system/connect/${id}`);
};

// * 获取联系人信息
export const getContactById = (id: number) => {
  return http.get<Contact.ResContact>(PORT1 + `/system/connect/${id}`);
};

// * 获取联系人数据
export const getContactList = (params: Contact.ReqContactParams) => {
  return http.getRow<Contact.ResContact>(PORT1 + `/system/connect/list`, params);
};
