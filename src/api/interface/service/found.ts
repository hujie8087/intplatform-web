import { ReqPage } from "..";

// * 失物招领模块
export namespace Found {
  export interface ReqFoundParams extends ReqPage {
    contacts?: string;
  }
  export interface ResFound {
    id: number;
    tel: string;
    photo: string;
    lostName: string;
    lostNum: number;
    foundName: string;
    foundTime: string;
    foundPlace: string;
    receiveName: string;
    receiveTime: string;
    receivePlace: string;
    isFound: string;
    delFlag: string;
    reviewStatus: string;
    remark: string;
    def1: string;
    def2: string;
    def3: string;
    def4: string;
    def5: string;
    createBy: string;
    createTime: string;
    updateBy: string | null;
    updateTime: string | null;
  }
}
