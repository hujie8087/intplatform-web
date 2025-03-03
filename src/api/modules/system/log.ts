// 系统日志接口管理
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { OperaLog } from "@/api/interface/system";

/**
 * @name 系统日志管理模块
 */

// * 删除系统日志
export const deleteOperaLog = (id: string) => {
  return http.delete(PORT1 + `/system/operlog/${id}`);
};
// * 获取系统日志列表
export const getOperaLogList = (params: OperaLog.ReqOperaLogParams) => {
  return http.get<OperaLog.ResOperaLog>(PORT1 + `/system/operlog/list`, params);
};

// * 清空系统日志
export const cleanOperaLog = () => {
  return http.delete(PORT1 + `/system/operlog/clean`);
};

// * 导出系统日志
export const exportOperaLog = (params: OperaLog.ReqOperaLogParams) => {
  return http.download(PORT1 + `/system/operlog/export`, params);
};

// * 获取登录日志列表
export const getLoginLogList = (params: OperaLog.ReqOperaLogParams) => {
  return http.get<OperaLog.ResOperaLog>(PORT1 + `/system/operlog/loginLog`, params);
};

// * 导出登录日志
export const exportLoginLog = (params: OperaLog.ReqOperaLogParams) => {
  return http.download(PORT1 + `/system/logininfor/export`, params);
};

// * 删除登录日志
export const deleteLoginLog = (id: string) => {
  return http.delete(PORT1 + `/system/logininfor/${id}`);
};

// * 清空登录日志
export const cleanLoginLog = () => {
  return http.delete(PORT1 + `/system/logininfor/clean`);
};

// * 解锁用户
export const unlockUser = (params: { userId: string }) => {
  return http.get(PORT1 + `/system/logininfor/unlock/${params.userId}`);
};
