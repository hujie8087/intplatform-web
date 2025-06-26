// 车辆信息模块

import { ReqPage } from "../..";

export namespace Dept {
  export interface ReqDeptParams extends ReqPage {
    deptName?: string;
    status?: string;
  }
  export interface ResDept {
    keyword: string | null;
    createBy: string;
    createTime: string;
    updateBy: string | null;
    updateTime: string | null;
    remark: string | null;
    deleteTime: string | null;
    deleteBy: string | null;
    userIdList: string[] | null;
    strArrays: string[] | null;
    statusArrays: string[] | null;
    foodArrays: string[] | null;
    orderArrays: string[] | null;
    deptId: number;
    parentId: number;
    ancestors: string;
    deptName: string;
    orderNum: number;
    leader: string;
    phone: string;
    email: string;
    status: string;
    delFlag: string;
    parentName: string | null;
    children: ResDept[];
  }
}
