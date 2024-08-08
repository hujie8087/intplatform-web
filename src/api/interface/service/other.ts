import { ReqPage } from "..";

// * 公共便利模块
export namespace Other {
  export interface ReqOtherParams extends ReqPage {
    showTitle?: string;
  }
  export interface ResOther {
    id: number;
    address: string;
    showTitle: string;
    region: string;
    regionId: number;
    businessHours: string;
    head: string;
    telephone: string;
    image: string;
    details: string;
    delFlag: string;
    def1: string;
    def2: string;
    def3: string;
    def4: string;
    def5: string;
    deleteBy: string;
    deleteTime: string;
    sourceNo: string;
    souceType: number;
    searchValue: string;
    createBy: string;
    createTime: string;
    updateBy: string;
    updateTime: string;
    remark: string;
  }
}
