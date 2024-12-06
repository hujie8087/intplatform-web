import { ReqPage } from "..";

// * 订单监控管理模块
export namespace OrderMonitoring {
  export interface ReqOrderMonitoringParams extends ReqPage {
    name?: string;
    beginTime?: string;
    endTime?: string;
  }
  export interface ResOrderMonitoring {
    id: number;
    nick: string;
    name: string;
    num: string;
    tel: string;
    total: string;
  }
}
