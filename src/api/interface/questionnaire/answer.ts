import { ReqPage } from "..";
export namespace AnswerType {
  // 查询答题项目列表
  export interface AnswerList {
    row: AnswerEntity[];
    msg: string;
    code: number;
  }
  // 删除回答
  export interface DeleteAnswer {
    msg: string;
    code: number;
  }

  export interface ReqAnswerParams extends ReqPage {
    projectKey?: string;
    beginDateTime?: string;
    endDateTime?: string;
    conditions?: [];
  }

  // 回答对象
  export interface AnswerEntity {
    id: number;
    projectKey: string | null;
    serialNumber: number;
    completeTime: number;
    fingerprint: string | null;
    submitUa: string | null;
    submitOs: string | null;
    submitBrowser: string | null;
    submitRequestIp: string | null;
    submitAddress: string | null;
    submitUserId: string | null;
    submitUserName: string | null;
    createBy: string | null;
    createTime: string | null;
    updateBy: string | null;
    updateTime: string | null;
  }
}
