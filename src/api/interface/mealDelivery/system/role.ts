// 用户信息模块

import { ReqPage } from "../..";

export namespace Role {
  export interface ReqRoleParams extends ReqPage {
    roleName?: string;
    status?: string;
    roleKey?: string;
  }
  export interface ResRole {
    keyword: string | null;
    createBy: string | null;
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
    roleId: number;
    roleName: string;
    roleKey: string;
    roleSort: number;
    dataScope: string;
    menuCheckStrictly: boolean;
    deptCheckStrictly: boolean;
    status: string;
    delFlag: string;
    flag: boolean;
    menuIds: number[] | null;
    deptIds: number[] | null;
    permissions: string[] | null;
    permIds: number[] | null;
    admin: boolean;
  }
}
