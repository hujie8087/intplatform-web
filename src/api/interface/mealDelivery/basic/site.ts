// 水单结算模块

import { ReqPage } from "../..";

export namespace BasicSite {
  export interface ReqBasicSiteParams extends ReqPage {
    orderNo?: string;
    orderStatus?: string;
  }
  export interface ResBasicSite {
    createBy: string;
    createTime: string;
    delFlag: string;
    deleteBy: string;
    deleteTime: string;
    fcId: number;
    fcName: string;
    foodArrays: string;
    fsAddressCn: string;
    fsAddressEn: string;
    fsAddressId: string;
    fsId: number;
    fsMessHall: string;
    fsMessHallId: number;
    keyword: string;
    nationType: string;
    orderArrays: string;
    remark: string;
    status: string;
    statusArrays: string;
    strArrays: string;
    updateBy: string;
    updateTime: string;
    userIdList: string;
  }
}
