import { ReqPage } from "./index";

export namespace GuideType {
  export interface ReqGuideType extends ReqPage {
    title?: string;
  }
  export interface ResGuideType {
    id: number;
    title: string;
    isLogin?: number;
    status?: string;
    delFlag?: string;
    remark?: string;
    def1?: string;
    def2?: string;
    def3?: string;
    def4?: string;
    def5?: string;
    createBy?: string;
    createTime?: Date;
    updateBy?: string;
    updateTime?: Date;
    deleteBy?: string;
    deleteTime?: Date;
    img?: string;
    content?: string;
  }
}

export namespace Guide {
  export interface ReqGuide extends ReqPage {
    title?: string;
  }
  export interface ResGuide {
    id: number;
    typeId: number;
    title?: string;
    isLogin?: number;
    status?: string;
    delFlag?: string;
    remark?: string;
    def1?: string;
    def2?: string;
    def3?: string;
    def4?: string;
    def5?: string;
    createBy?: string;
    createTime?: Date;
    updateBy?: string;
    updateTime?: Date;
    deleteBy?: string;
    deleteTime?: Date;
    img?: string;
    content?: string;
  }
}
