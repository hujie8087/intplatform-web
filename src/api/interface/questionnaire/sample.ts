export namespace SampleType {
  export interface SampleList {
    total: number;
    rows: ListItem[];
    code: number;
    msg: string;
  }
  export interface AddSample {
    msg: string;
    code: number;
    data: string;
  }
  export interface EditSample {
    msg: string;
    code: number;
    data: string;
  }
  export interface DeleteSample {
    msg: string;
    code: number;
    data: string;
  }
  export interface SampleDetail {
    rows: ListItem[];
  }
}

interface ListItem {
  createBy: string;
  createTime: string;
  updateBy?: string | null;
  updateTime?: string | null;
  remark: string | null;
  startQueryTime: string | null;
  endQueryTime: string | null;
  id: number;
  projectKey: string;
  projectName: string;
  projectType: string | null;
  projectDesc: string;
  sourceType: number;
  sourceId: string;
  userId: string | null;
  status: number;
  delFlag: string;
}
