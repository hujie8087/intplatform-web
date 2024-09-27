// 系统通知接口管理
import { Notice } from "@/api/interface/system";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { ResPage } from "@/api/interface";

/**
 * @name 系统通知管理模块
 */

// * 新增系统通知
export const addNotice = (params: FormData) => {
  return http.post(PORT1 + `/system/notice`, params);
};

// * 编辑系统通知
export const editNotice = (params: FormData) => {
  return http.put(PORT1 + `/system/notice`, params);
};

// * 删除系统通知
export const deleteNotice = (id: number) => {
  return http.delete(PORT1 + `/system/notice/${id}`);
};
// * 获取系统通知详情
export const getNoticeById = (id: number) => {
  return http.get<Notice.ResNotice>(PORT1 + `/system/notice/${id}`);
};

// * 获取系统通知列表
export const getNoticeList = (params: Notice.ReqNoticeParams) => {
  return http.get<ResPage<Notice.ResNotice>>(PORT1 + `/system/notice/list`, params);
};

// * 导出系统通知
export const exportNotice = (params: Notice.ReqNoticeParams) => {
  return http.download(PORT1 + `/system/notice/export`, { params });
};

// * 发送消息推送
export const sendMessage = (params: Notice.pushMessage) => {
  return http.post(PORT1 + `/system/sendMessage/sendOne`, params);
};
