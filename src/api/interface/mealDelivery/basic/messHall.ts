// 车辆信息模块

import { ReqPage } from "../..";

export namespace BasicMessHall {
  export interface ReqBasicMessHallParams extends ReqPage {
    fcId?: number;
    fcName?: string;
    nationType?: string;
  }
  export interface ResBasicMessHall {
    createBy: string;
    createTime: string;
    delFlag: string;
    deleteBy: string;
    deleteTime: string;
    fcId: number;
    fcName: string;
    fdId: number;
    fdName: string;
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
