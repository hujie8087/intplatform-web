// 车辆信息模块

import { ReqPage } from "../..";

export namespace BasicCarInfo {
  export interface ReqBasicCarInfoParams extends ReqPage {
    fcId?: number;
    fcName?: string;
    nationType?: string;
  }
  export interface ResBasicCarInfo {
    createBy: string;
    createTime: string;
    delFlag: string;
    deleteBy: string;
    deleteTime: string;
    fcId: number;
    fcName: string;
    foodArrays: string;
    keyword: string;
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
