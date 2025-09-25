import { ReqPage } from "..";

export namespace Contact {
  export interface ReqContactParams extends ReqPage {
    name?: string;
  }
  export interface ResContact {
    createBy: string;
    createTime: string;
    updateBy: string;
    updateTime: string;
    remark: string;
    id: number;
    name: string;
    details: string;
    tel: string;
    email: string;
    workTime: string;
    delFlag: string;
    def1: string;
    def2: string;
    def3: string;
    def4: string;
    def5: string;
    deleteBy: string;
    deleteTime: string;
    sourceNo: string;
    souceType: string;
  }
}
