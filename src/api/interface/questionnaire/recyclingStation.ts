export namespace RecyclingStation {
  export interface ProjectList {
    total: number;
    rows: ListItem[];
    code: number;
    msg: string;
  }
  export interface Undelete {
    msg: string;
    code: number;
    data: string;
  }
  export interface DeleteItem {
    msg: string;
    code: number;
    data: string;
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
