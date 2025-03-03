import { ReqPage } from "..";

// * 配送员模块
export namespace DeliveryStation {
  export interface ReqDeliveryStationParams extends ReqPage {
    sourceType?: string;
    sourceStation?: string;
    status?: string;
  }
  export interface ResDeliveryStation {
    sourceType: string;
    sourceStation: string;
    id: number;
    code: string;
    status: string;
    delFlag: string;
    createBy: string;
    createTime: string;
    updateBy: string;
    updateTime: string;
    deleteBy: string;
    deleteTime: string;
    address: string;
    name: string;
    tel: string;
    remark: string;
    longitude: string;
    latitude: string;
    contacts: string;
  }
}
