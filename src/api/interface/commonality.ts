import { ReqPage } from "./index";

export namespace Supermarket {
  export interface ReqSupermarket extends ReqPage {
    name?: string;
    address?: string;
  }
  export interface ResSupermarket {
    id: number;
    name?: string;
    address?: string;
    businessHours?: string;
    principal?: string;
    tel?: string;
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
    sourceNo?: string;
    souceType?: string;
  }
}

export namespace CommonalityType {
  export interface ReqCommonalityType extends ReqPage {
    name?: string;
    code?: string;
  }
  export interface ResCommonalityType {
    id: number;
    code?: string;
    name?: string;
    photo?: string;
    remark?: string;
    delFlag?: string;
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
    sourceNo?: string;
    souceType?: string;
  }
}

export namespace Goods {
  export interface ReqGoods extends ReqPage {
    name?: string;
    code?: string;
  }
  export interface ResGoods {
    id: number;
    code?: string;
    name?: string;
    photo?: string;
    price?: string;
    spec?: string;
    listImage?: string;
    detailImage?: string;
    indexImage?: string;
    remark?: string;
    delFlag?: string;
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
    sourceNo?: string;
    souceType?: string;
  }
}
