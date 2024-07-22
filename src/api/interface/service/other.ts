import { ReqPage } from "..";

// * 保修管理模块
export namespace Other {
  export interface ReqOtherParams extends ReqPage {
    showTitle?: string;
  }
  export interface ResOther {
    id: number;
    address: string;
    showTitle: String;
    region: String;
    regionId: number;
    businessHours: String;
    head: String;
    telephone: String;
    details: String;
    delFlag: String;
    def1: String;
    def2: String;
    def3: String;
    def4: String;
    def5: String;
    deleteBy: String;
    deleteTime: String;
    sourceNo: String;
    souceType: number;
    searchValue: String;
    createBy: String;
    createTime: String;
    updateBy: String;
    updateTime: String;
    remark: String;
  }
}
