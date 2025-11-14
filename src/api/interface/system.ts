import { ReqPage } from "./index";
// * 用户管理模块
export namespace Account {
  export interface ReqAccountParams extends ReqPage {
    roleIds: [];
    name: string;
    sex: number;
    tel: string;
    username: string;
  }
  export interface ResAccountList {
    createBy: string | null;
    createTime: string;
    canteenId: string;
    updateBy: string | null;
    updateTime: string | null;
    remark: string | null;
    userId: number;
    deptId: number;
    userName: string;
    nickName: string;
    userType: string | null;
    email: string;
    phonenumber: string;
    card: string;
    sex: string;
    avatar: string;
    password: string | null;
    status: string;
    delFlag: string;
    loginIp: string;
    loginDate: string;
    dept: ResDepartment;
    roles: ResRole[];
    roleIds: number[] | null;
    postIds: number[] | null;
    roleId: number | null;
    mobilePhoneId: string;
    admin: boolean;
  }
  export interface ResStatus {
    userLabel: string;
    userValue: number;
  }
  export interface ReqUpdatePassWord {
    password: string;
    newPassword: string;
    username: string;
  }
  export interface ResGender {
    genderLabel: string;
    genderValue: number;
  }
  export interface ResDepartment {
    createBy: string | null;
    createTime: string | null;
    updateBy: string | null;
    updateTime: string | null;
    remark: string | null;
    deptId: number;
    parentId: number | null;
    ancestors: string | null;
    deptName: string;
    orderNum: number | null;
    leader: string;
    phone: string | null;
    email: string | null;
    status: string | null;
    delFlag: string | null;
    parentName: string | null;
    children: ResDepartment[];
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
    dataScope: string | null;
    menuCheckStrictly: boolean;
    deptCheckStrictly: boolean;
    status: string;
    delFlag: string | null;
    flag: boolean;
    menuIds: number[] | null;
    deptIds: number[] | null;
    permissions: string[] | null;
    admin: boolean;
  }
  export interface ResRoleUser {
    user: ResAccountList;
    roles: ResRole[];
  }
  export interface RevokeAuthorizationMsg {
    data: string;
    code: number;
    msg: string;
  }
  export interface ReqRoleUserParams extends ReqPage {
    roleId: number;
  }
  export interface ResRoleUserList {
    roleId: number;
    roleName: string;
    userId: number;
    userName: string;
    nickName: string;
  }

  export interface ResThirdUser {
    id: number;
    account: string;
    avatar: string;
    name: string;
    sex: string;
    tel: string;
    postName: string;
    formatOrganizeName: string;
    status: number;
  }
}

// 部门管理模块
export namespace Dept {
  export interface ReqDeptParams extends ReqPage {
    name?: string;
    code?: string;
    type?: number;
  }
  export interface ResDept {
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
    children: ResDept[];
  }
  export interface ResDeptTree {
    depts: ResDept[];
    checkedKeys: number[];
  }
}

// 菜单管理模块
export namespace Menu {
  export type ReqMenuParams = ReqPage;
  export interface MenuOptions {
    path: string;
    name: string;
    hidden?: boolean;
    component?: string | (() => Promise<unknown>);
    redirect?: string;
    meta: MetaProps;
    children?: MenuOptions[];
  }
  export interface MetaProps {
    icon: string;
    title: string;
    activeMenu?: string;
    isLink?: string;
    isHide: boolean;
    isFull: boolean;
    isAffix: boolean;
    isKeepAlive: boolean;
    noCache?: boolean;
  }
  export interface ResMenu {
    createBy: string | null;
    createTime: string;
    updateBy: string | null;
    updateTime: string | null;
    remark: string | null;
    menuId: number;
    menuName: string;
    parentName: string | null;
    parentId: number;
    orderNum: number;
    path: string;
    component: string;
    query: string;
    isFrame: string;
    noCache: string;
    isCache: string;
    menuType: string;
    visible: string;
    status: string;
    perms: string;
    icon: string;
    children?: ResMenu[];
  }
  export interface ResMenuTree {
    menus: Menu.ResMenu[];
    checkedKeys: number[];
  }
}

// 角色管理模块
export namespace Role {
  export interface ReqRoleParams extends ReqPage {
    level?: string;
    name?: string;
    sort?: number;
  }
  export interface ResRole {
    createBy?: string;
    createTime?: string;
    updateBy?: string;
    updateTime?: string;
    remark: string;
    roleId: number;
    roleName: string;
    roleKey: string;
    roleSort: number;
    dataScope?: string;
    menuCheckStrictly?: boolean;
    deptCheckStrictly?: boolean;
    status: string;
    delFlag?: string;
    flag?: boolean;
    menuIds?: number[];
    deptIds?: number[];
    permissions?: string[];
    admin?: boolean;
    repairAreaId?: string;
    prId?: number;
    children?: ResRole[];
    sysUser?: Account.ResAccountList[];
  }
  export interface ResMenu {
    id: number;
    auth?: string;
    icon?: string;
    name?: string;
    path?: string;
    pid?: number;
    remark?: string;
    routing?: string;
    sort?: number;
    title?: string;
    status?: number;
    type?: number;
    children?: ResMenu[];
  }
  export interface ResRoleUser {
    roleId: number;
    prId: number;
    roleName: string;
    level: number;
    num: number;
    children: ResRoleUser[];
  }
}

// 岗位管理模块
export namespace Post {
  export interface ReqPostParams extends ReqPage {
    postName?: string;
    postCode?: string;
    status?: string;
  }
  export interface ResPost {
    createBy: string;
    createTime: string;
    updateBy: string | null;
    updateTime: string | null;
    remark: string;
    postId: number;
    postCode: string;
    postName: string;
    postSort: number;
    status: string;
    flag: boolean;
  }
}

// 字典管理模块
export namespace Dict {
  export interface ReqDictParams extends ReqPage {
    dictName?: string;
    dictType?: string;
  }
  export interface ReqDictDataParams extends ReqPage {
    dictType?: string;
    dictLabel?: string;
    status?: string;
  }
  export interface ResDict {
    createBy: string;
    createTime: string;
    updateBy: string | null;
    updateTime: string | null;
    remark: string;
    dictId: number;
    dictName: string;
    dictType: string;
    status: string;
  }
  export interface ResDictData {
    createBy: string;
    createTime: string;
    updateBy: string | null;
    updateTime: string | null;
    remark: string;
    dictCode: number;
    dictSort: number;
    dictLabel: string;
    dictLabelEn: string;
    dictLabelId: string;
    dictValue: string;
    dictType: string;
    cssClass: string;
    listClass: string;
    isDefault: string;
    status: string;
    default: boolean;
  }
}

// 参数配置模块
export namespace Config {
  export interface ReqConfigParams extends ReqPage {
    configName?: string;
    configKey?: string;
    configType?: string;
  }
  export interface ResConfig {
    createBy: string;
    createTime: string;
    updateBy: string | null;
    updateTime: string | null;
    remark: string;
    configId: number;
    configName: string;
    configKey: string;
    configValue: string;
    configType: string;
  }
}

// 系统通知模块
export namespace Notice {
  export interface ReqNoticeParams extends ReqPage {
    title?: string;
    type?: string;
    status?: string;
  }
  export interface ReqCreateNoticeParams {
    noticeTitle: string;
    noticeContent: string;
    noticeType: string;
    createDept?: string;
    status: string;
    remark?: string;
    img?: string;
    file?: string;
    video?: string;
    sort?: number;
    url?: string;
  }
  export interface ResNotice {
    createBy?: string;
    createTime?: string;
    updateBy?: string | null;
    updateTime?: string | null;
    remark?: string;
    img?: string;
    file?: string;
    video?: string;
    noticeId: number;
    noticeTitle: string;
    noticeType: string;
    noticeGrade: string;
    noticeContent: string;
    createDept: string;
    sort: number;
    nextApprovalFlag: number;
    papeView: string;
    status: string;
    approvalStatus: number;
    approvalFirstMessage: string;
    approvalSecondMessage: string;
    approvalThirdMessage: string;
    approvalMessage: string;
    approvalDeptId?: number;
    approvalDeptMessage?: string;
    url?: string;
  }
  export interface pushMessage {
    title: string;
    body: string;
    payload: string;
    type: string;
    equipmentToken: string;
    userName: string;
  }
}

// 系统日志模块
export namespace OperaLog {
  export interface ReqOperaLogParams extends ReqPage {
    title?: string;
    operIp?: string;
    operName?: string;
    businessType?: string;
    status?: string;
  }
  export interface ResOperaLog {
    createBy: string | null;
    createTime: string | null;
    updateBy: string | null;
    updateTime: string | null;
    remark: string | null;
    operId: number;
    title: string;
    businessType: number;
    businessTypes: any | null;
    method: string;
    requestMethod: string;
    operatorType: number;
    operName: string;
    deptName: string;
    operUrl: string;
    operIp: string;
    operLocation: string;
    operParam: string;
    jsonResult: any | null;
    status: number;
    errorMsg: string | null;
    operTime: string;
    costTime: number;
  }
}

// app版本管理模块
export namespace AppVersion {
  export interface ReqAppVersionParams extends ReqPage {
    versionCode?: number;
    versionName?: string;
  }

  export interface ResAppVersion {
    id: number;
    apkSize: number;
    apkUrl: string;
    apkMd5: string;
    createTime: string;
    hasUpdate: string;
    isIgnorable: string;
    remark: string;
    system: string;
    updateLog: string;
    updateType: string;
    versionCode: number;
    versionName: string;
    def1: string;
    def2: string;
  }
}

// 登录日志模块
export namespace LoginLog {
  export interface ReqLoginLogParams extends ReqPage {
    userName?: string;
    ipaddr?: string;
    status?: string;
    loginTime?: string;
  }
  export interface ResLoginLog {
    browser: string;
    createBy: string;
    createTime: string;
    infoId: number;
    ipaddr: string;
    loginLocation: string;
    loginTime: string;
    msg: string;
    os: string;
    remark: string;
    status: string;
    updateBy: string;
    updateTime: string;
    userName: string;
  }
}

// app菜单管理模块
export namespace AppMenu {
  export interface ReqAppMenuParams extends ReqPage {
    cname?: string;
    status?: string;
  }
  export interface ResAppMenu {
    id: number;
    cname: string;
    uname: string;
    yname: string;
    sort: number;
    status: number;
    icon: string;
    isMic: number;
    router: string;
    permissions: string;
    delFlag: string;
    createBy: string;
    remark: string;
    createTime: string;
    updateBy: string;
    updateTime: string;
    deleteBy: string;
    deleteTime: string;
    isLogin: number;
    typeId: number;
  }
}

// app菜单类型管理模块
export namespace AppMenuType {
  export interface ReqAppMenuTypeParams extends ReqPage {
    cname?: string;
    status?: string;
  }
  export interface ResAppMenuType {
    id: number;
    cname: string;
    uname: string;
    yname: string;
    sort: number;
    status: number;
    icon: string;
    permissions: string;
    delFlag: string;
    createBy: string;
    createTime: string;
    updateBy: string;
    updateTime: string;
    deleteBy: string;
    deleteTime: string;
    isLogin: number;
    remark: string;
  }
}

// app资源管理模块
export namespace AppResource {
  export interface ReqAppResourceParams extends ReqPage {
    resourceType?: string;
    resourceKey?: string;
    resourceName?: string;
    contentType?: number;
    content?: string;
    sortOrder?: number;
    status?: number;
  }
  export interface ResAppResource {
    id: number;
    resourceType: string;
    resourceKey: string;
    resourceName: string;
    contentType: string;
    content: string;
    sortOrder: number;
    status: number;
    startTime: string;
    endTime: string;
    platform: number;
    extInfo: string;
    create_by: string;
    createTime: string;
    updateBy: string;
    updateTime: string;
  }
}
