// 水单结算模块

import { ReqPage } from "../..";

export namespace BasicTime {
  export interface ReqBasicTimeParams extends ReqPage {
    keyword?: string;
  }
  export interface ResBasicTime {
    beginTime: string;
    createBy: string;
    createTime: string;
    deleteBy: string;
    deleteTime: string;
    deptBeginTime: string;
    deptEndTime: string;
    endTime: string;
    foodArrays: string;
    keyword: string;
    orderArrays: string;
    remark: string;
    statusArrays: string;
    strArrays: string;
    tId: number;
    tType: string;
    updateBy: string;
    updateTime: string;
    userIdList: string;
  }
}
