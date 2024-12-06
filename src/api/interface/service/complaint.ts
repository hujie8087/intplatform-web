import { ReqPage } from "..";

// * 投诉与建议模块
export namespace Complaint {
  export interface ReqComplaintMessageParams extends ReqPage {
    contacts?: string;
  }
  export interface ResComplaintMessage {
    id: number;
    content: string;
    type: number;
    typeId: string;
    contacts: string;
    phone: string;
    delFlag: string;
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
