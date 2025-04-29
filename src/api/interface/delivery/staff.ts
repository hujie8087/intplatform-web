import { ReqPage } from "..";
import { DeliveryStation } from "./station";

// * 配送员模块
export namespace DeliveryStaff {
  export interface ReqDeliveryStaffParams extends ReqPage {
    nickName?: string;
    tel?: string;
    status?: string;
  }
  export interface ResDeliveryStaff {
    createBy: string;
    createTime: string;
    def1: string;
    def2: string;
    def3: string;
    deleteBy: string;
    deleteTime: string;
    delFlag: string;
    id: number;
    nickName: string;
    staffType: number;
    remark: string;
    sourceMsgIds: number[];
    sourceMsgs: DeliveryStation.ResDeliveryStation[];
    startQueryTime: string;
    status: string;
    tel: string;
    type: string;
    updateBy: string;
    updateTime: string;
    userId: number;
    userName: string;
  }
}
