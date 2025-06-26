// 公司信息模块

import { ReqPage } from "../..";

export namespace Company {
  export interface ReqCompanyParams extends ReqPage {
    companyName?: string;
    companyCode?: string;
    status?: string;
  }
  export interface ResCompany {
    companyCode: string;
    companyId: number;
    companyName: string;
    gmtCreate: string;
    gmtModified: string;
    remark: string;
    sort: number;
    status: number;
  }
}
