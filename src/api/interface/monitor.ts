import { ReqPage } from "./index";
// * 定时管理模块
export namespace Task {
  export interface ReqTaskParams extends ReqPage {
    jobName?: string;
    jobGroup?: string;
    status?: string;
  }
  export interface ResTask {
    createBy: string;
    createTime: string;
    updateBy: string | null;
    updateTime: string | null;
    remark: string;
    jobId: number;
    jobName: string;
    jobGroup: string;
    invokeTarget: string;
    cronExpression: string;
    misfirePolicy: string;
    concurrent: string;
    status: string;
    nextValidTime: string;
  }
  export interface ResTaskLogParams {
    jobName?: string;
    jobGroup?: string;
    status?: string;
    beginTime?: string;
    endTime?: string;
  }
  export interface ResTaskLog {
    jobLogId: number;
    jobName: string;
    jobGroup: string;
    invokeTarget: string;
    jobMessage: string;
    status: string;
    createTime: string;
  }
}
// * 在线用户模块

/**
 * "tokenId": "9150f79c-93b5-4f23-a3dc-177c08f13d81",
            "userName": "admin",
            "ipaddr": "10.40.10.231",
            "loginLocation": null,
            "browser": null,
            "os": null,
            "loginTime": 1734566579210
 */
export namespace Online {
  export interface ReqOnlineParams extends ReqPage {
    ipaddr?: string;
    userName?: string;
  }
  export interface ResOnline {
    tokenId: string;
    userName: string;
    deptName: string;
    ipaddr: string;
    loginTime: string;
    loginLocation: string;
    browser: string;
    os: string;
  }
}
