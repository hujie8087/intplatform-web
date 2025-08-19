// 用户信息模块

import { ReqPage } from "../..";
import { Role } from "../../system";
import { Dept } from "./dept";

export namespace User {
  export interface ReqUserParams extends ReqPage {
    userName?: string;
    nickName?: string;
    deptId?: number;
    status?: string;
  }
  export interface ResUser {
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
    userId: number;
    deptId: number;
    userName: string;
    nickName: string;
    deptPath: string;
    postName: string | null;
    accountType: string;
    nationality: string;
    roleName: string | null;
    phonenumber: string;
    email: string;
    sex: string;
    avatar: string;
    password: string | null;
    status: string;
    delFlag: string;
    loginIp: string;
    loginDate: string | null;
    dept: Dept.ResDept[];
    roles: Role.ResRole[];
    roleIds: string[] | null;
    postIds: string[] | null;
    postNames: string[];
    roleId: string | null;
    postClerkSortNum: number;
    creator: string;
    admin: boolean;
  }
}
