// 公共便利服务
import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";
import { Book } from "@/api/interface/service/book";

/**
 * @name 图书服务模块
 */

// * 新增图书
export const addBook = (params: FormData) => {
  return http.post(PORT1 + `/other/books`, params);
};

// * 编辑图书
export const editBook = (params: FormData) => {
  return http.put(PORT1 + `/other/books`, params);
};

// * 删除图书
export const deleteBook = (id: number) => {
  return http.delete(PORT1 + `/other/books/${id}`);
};

// * 获取图书信息
export const getBookById = (id: number) => {
  return http.get<Book.ResBook>(PORT1 + `/other/books/${id}`);
};

// * 获取图书数据
export const getBookList = (params: Book.ReqBookParams) => {
  return http.getRow<Book.ResBook>(PORT1 + `/other/books/list`, params);
};

// * 导出图书数据
export const exportBook = (params: Book.ReqBookParams) => {
  return http.get(PORT1 + `/other/books/export`, params);
};

// * 导入图书数据
export const importBook = (params: FormData) => {
  return http.post(PORT1 + `/other/books/import`, params, { timeout: 300000 });
};

// * 下载图书模板
export const downloadBookTemplate = () => {
  return http.get(PORT1 + `/other/books/importTemplate`);
};
