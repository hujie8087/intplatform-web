import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

// 查询定时任务调度详细
export function queryUserTaskInfo(taskId: string) {
  return http.get<any>(PORT1 + "/schedule/usertask/queryusertaskinfo?taskId=" + taskId);
}

// 分页获取用户任务列表
export function queryUserTaskListWithPage(taskCategory: string, dataOperate: string, pageNum: number, pageSize: number) {
  return http.get<any>(
    PORT1 +
      "/schedule/usertask/queryusertasklistwithpage?taskCategory=" +
      taskCategory +
      "&dataOperate=" +
      dataOperate +
      "&pageNum=" +
      pageNum +
      "&pageSize=" +
      pageSize
  );
}
