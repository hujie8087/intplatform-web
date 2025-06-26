// 公司信息模块

import { ReqPage } from "../..";

export namespace Employee {
  export interface ReqEmployeeParams extends ReqPage {
    jobNumber?: string;
    username?: string;
    phone?: string;
    status?: string;
  }
  export interface ResEmployee {
    keyword: string | null;
    createBy: string;
    createTime: string;
    updateBy: string;
    updateTime: string;
    remark: string;
    deleteTime: string;
    deleteBy: string;
    userIdList: string[];
    strArrays: string[];
    statusArrays: string[];
    foodArrays: string[];
    orderArrays: string[];
    id: number;
    jobNumber: string;
    username: string;
    companyId: number;
    companyName: string;
    deptId: string;
    postId: number;
    postName: string;
    deptName: string;
    deptPath: string;
    phone: string;
    status: string;
    sex: string;
    delFlag: string;
    nationType: string;
    creator: string;
    religion: string;
  }
}
