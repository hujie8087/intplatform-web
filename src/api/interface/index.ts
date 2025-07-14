import { EpPropMergeType } from "element-plus/es/utils";

// 请求响应参数（不包含data）
export interface Result {
  code: string;
  msg: string;
}

// 请求响应参数（包含data）
export interface ResultData<T = any> extends Result {
  data: T;
}

// 分页响应参数
export interface ResPage<T> {
  rows: T[];
  pageNum: number;
  pageSize: number;
  total: number;
}

// 分页请求参数
export interface ReqPage {
  pageNum: number;
  pageSize: number;
}

// 文件上传模块
export namespace Upload {
  export interface ResFileUrl {
    fileUrl: string;
  }
}

// 登录模块
export namespace Login {
  export interface ReqLoginForm {
    username: string;
    password: string;
  }
  export interface ResLogin {
    access_token: string;
  }
  export interface ResAuthButtons {
    [key: string]: string[];
  }
  export interface ResUserInfo {
    permissions: string[];
    roles: string[];
    user: {
      createBy: string;
      createTime: string;
      updateBy: null;
      updateTime: null;
      remark: string;
      userId: number;
      deptId: number;
      userName: string;
      nickName: string;
      userType: string;
      email: string;
      phonenumber: string;
      card: string;
      sex: string;
      avatar: string;
      status: string;
      delFlag: string;
      loginIp: string;
      loginDate: string;
      dept: User.ResDepartment;
      roles: User.ResRole[];
      roleIds: string;
      postIds: string;
      roleId: string;
      admin: boolean;
    };
  }
}

// 用户管理模块
export namespace User {
  export interface ReqUserParams extends ReqPage {
    username: string;
    gender: number;
    idCard: string;
    email: string;
    address: string;
    createTime: string[];
    status: number;
  }
  export interface ResUserList {
    id: string;
    username: string;
    gender: number;
    user: { detail: { age: number } };
    idCard: string;
    email: string;
    address: string;
    createTime: string;
    status: number;
    avatar: string;
    photo: any[];
    children?: ResUserList[];
  }
  export interface ResStatus {
    userLabel: string;
    userValue: number;
  }
  export interface ResGender {
    genderLabel: string;
    genderValue: number;
  }
  export interface ResDepartment {
    createBy: string;
    createTime: string;
    updateBy: string | null;
    updateTime: string | null;
    remark: string | null;
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
    children?: ResDepartment[];
  }
  export interface ResRole {
    createBy: string | null;
    createTime: string | null;
    updateBy: string | null;
    updateTime: string | null;
    remark: string | null;
    roleId: number;
    roleName: string;
    roleKey: string;
    roleSort: number;
    dataScope: string;
    menuCheckStrictly: boolean;
    deptCheckStrictly: boolean;
    status: string;
    delFlag: string | null;
    flag: boolean;
    menuIds: number[] | null;
    deptIds: number[] | null;
    permissions: string[] | null;
    admin: boolean;
    children?: ResDepartment[];
  }
}

export interface DictOptions {
  label: string;
  value: number | string | boolean;
  tagType?: EpPropMergeType<StringConstructor, "primary" | "danger" | "warning" | "success" | "info", unknown>;
  cssClass?: string;
}

// 取餐类型
export interface DictOptionsType {
  name: string;
  id: number;
  price?: number;
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
