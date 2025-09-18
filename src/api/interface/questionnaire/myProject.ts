export namespace MyProject {
  export interface ProjectList {
    row: ProjectItem[];
    msg: string;
    code: number;
  }
  export interface DeleteItem {
    msg: string;
    code: number;
  }
  export interface SaveTemplate {
    msg: string;
    code: number;
    data: string;
  }
  export interface PublishItem {
    msg: string;
    code: number;
  }
}

interface ProjectItem {
  createBy: string;
  createTime: string;
  updateBy: string | null;
  updateTime: string | null;
  remark: string | null;
  startQueryTime: string | null;
  endQueryTime: string | null;
  id: number;
  projectKey: string;
  projectName: string;
  projectType: number;
  projectDesc: string;
  sourceType: number;
  sourceId: string | null;
  userId: string | null;
  status: number;
  delFlag: string;
  collectCount: number;
}
