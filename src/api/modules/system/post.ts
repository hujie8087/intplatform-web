// 系统组织接口管理
import { Post } from "@/api/interface/system";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name 系统岗位管理模块
 */

// * 新增系统岗位
export const addPost = (params: FormData) => {
  return http.post(PORT1 + `/system/post`, params);
};

// * 编辑系统岗位
export const editPost = (params: FormData) => {
  return http.put(PORT1 + `/system/post`, params);
};

// * 删除系统岗位
export const deletePost = (id: number) => {
  return http.delete(PORT1 + `/system/post/${id}`);
};
// * 获取系统岗位详情
export const getPostById = (id: number) => {
  return http.get<Post.ResPost>(PORT1 + `/system/post/${id}`);
};

// * 获取岗位数据
export const getPostList = (params: Post.ReqPostParams) => {
  // return http.getRow<Post.ResPost>(PORT1 + `/system/post/list`, params);
  return http.getRow<Post.ResPost>(PORT1 + `/system/mdc/post/list`, params);
};
