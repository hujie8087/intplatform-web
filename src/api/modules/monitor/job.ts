import { ResPage } from "@/api/interface/index";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { Gen } from "@/api/interface/tool";
import { Task } from "@/api/interface/monitor";

/**
 * @name 定时任务模块
 */
// 获取定时任务列表
export const listJob = (params: Task.ReqTaskParams) => {
  return http.get<ResPage<Gen.ResGenList>>(PORT1 + `/monitor/job/list`, params);
};

// 查询表详细信息
export const getJob = (jobId: number) => {
  return http.get<Gen.GenDetail>(PORT1 + `/monitor/job/${jobId}`);
};

// 新增定时任务
export const addJob = (params: FormData) => {
  return http.post(PORT1 + `/monitor/job`, params);
};

// 编辑定时任务
export const updateJob = (params: any) => {
  return http.put(PORT1 + `/monitor/job`, params);
};

// 删除定时任务
export const delJob = (jobId: number) => {
  return http.delete(PORT1 + `/monitor/job/${jobId}`);
};

// 导入定时任务
export const importTable = (params: any) => {
  return http.post(PORT1 + `/monitor/job/importTable`, params);
};

// 任务状态修改
export const changeJobStatus = (params: Task.ResTask) => {
  return http.put(PORT1 + `/monitor/job/changeStatus`, {
    jobId: params.jobId,
    status: params.status
  });
};
// 定时任务立即执行一次
export const runJob = (params: Task.ResTask) => {
  return http.put(PORT1 + `/monitor/job`, {
    jobId: params.jobId,
    jobGroup: params.jobGroup
  });
};
