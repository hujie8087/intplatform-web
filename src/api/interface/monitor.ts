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
