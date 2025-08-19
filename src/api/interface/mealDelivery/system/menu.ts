// 用户信息模块

import { ReqPage } from "../..";

export namespace Menu {
  export interface ReqMenuParams extends ReqPage {
    menuName?: string;
    status?: string;
  }
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
  }
  export interface ResMenu {
    children: [];
    component: string | null;
    createBy: string | null;
    createTime: string;
    deleteBy: string | null;
    deleteTime: string | null;
    foodArrays: string[] | null;
    icon: string;
    isCache: string;
    isFrame: string;
    keyword: string | null;
    menuId: number;
    menuName: string;
    menuType: string;
    orderArrays: string[] | null;
    orderNum: number;
    parentId: number;
    parentName: string | null;
    path: string;
    perms: string;
    query: string;
    remark: string | null;
    status: string;
    statusArrays: string[] | null;
    strArrays: string[] | null;
    updateBy: string | null;
    updateTime: string | null;
    userIdList: string[] | null;
    visible: string;
  }
  export interface ResMenuTree {
    menus: Menu.ResMenu[];
    checkedKeys: number[];
  }
}
