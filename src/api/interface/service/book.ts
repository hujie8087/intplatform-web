import { ReqPage } from "..";

// * 图书模块
export namespace Book {
  export interface ReqBookParams extends ReqPage {
    bookName?: string;
  }
  export interface ResBook {
    id: number;
    code: string;
    bookName: string;
    bookNo: string;
    author: string;
    publisher: string;
    publicationDate: string;
    edition: string;
    size: number;
    discountedPrice: number;
    originalPrice: number;
    museumDate: string;
    typeNo: string;
    rCode: string;
    batch: string;
    status: number;
    delFlag: string;
    remark: string;
    createBy: string;
    createTime: string;
    updateBy: string;
    updateTime: string;
    deleteBy: string;
    deleteTime: string;
  }
}
