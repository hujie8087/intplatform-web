import { ResPage } from "@/api/interface/index";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { Online } from "@/api/interface/monitor";

/**
 * @name 在线用户模块
 */

// * 获取在线用户列表
export const getOnlineList = (params: Online.ReqOnlineParams) => {
  return http.get<ResPage<Online.ResOnline>>(PORT1 + `/system/online/list`, params);
};

// * 强制下线
export const forceOffline = (params: { tokenId: string }) => {
  return http.delete(PORT1 + `/system/online/${params.tokenId}`);
};
