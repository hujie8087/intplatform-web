import { Upload } from "@/api/interface/index";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name 文件上传模块
 */
// 图片上传
export const uploadImg = (params: FormData) => {
  return http.post<Upload.ResFileUrl>(PORT1 + `/file/upload`, params, { cancel: false });
};

// 视频上传
export const uploadVideo = (params: FormData) => {
  return http.post<Upload.ResFileUrl>(PORT1 + `/file/uploadVideo`, params, { cancel: false });
};

// 动植物图片上传
export const uploadFlora = (params: FormData) => {
  return http.post<Upload.ResFileUrl>(PORT1 + `/file/uploadFlora`, params, { cancel: false });
};

// 图片上传带文件夹
export const uploadByfName = (params: { file: File; fName: string }) => {
  return http.post<Upload.ResFileUrl>(PORT1 + `/file/uploadByfName`, params, { cancel: false });
};

// 问卷调查图片上传
export const uploadSurvey = (params: FormData) => {
  return http.post<Upload.ResFileUrl>(PORT1 + `/file/uploadSurvey`, params, { cancel: false });
};
