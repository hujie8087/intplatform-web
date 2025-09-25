import { ReqPage } from "..";

// * 好人好事模块
export namespace GoodDeeds {
  export interface ReqGoodDeedsParams extends ReqPage {
    personName?: string;
    status?: number;
  }
  export interface ResGoodDeeds {
    id: number;
    title: string;
    description: string;
    personName: string;
    contactInfo: string;
    status: number;
    likesCount: number;
    auditTime: string;
    auditUser: string;
    reviewContent: string;
    createTime: string;
    updateTime: string;
    updateBy: string;
    deleteBy: string;
    deleteTime: string;
    createBy: string;
  }
}
