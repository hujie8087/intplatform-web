import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { MyProject } from "@/api/interface/questionnaire/myProject";
export const getProjectList = (params: { projectName?: string; status?: string; pageNum: number; pageSize: number }) => {
  return http.get<MyProject.ProjectList>(PORT1 + `/survey/project/list`, { ...params });
};
export const deleteProject = (projectKey: string) => {
  return http.delete<MyProject.DeleteItem>(PORT1 + `/survey/project/${projectKey}`);
};
export const saveTemplate = (params: { projectKey: string }) => {
  return http.post<MyProject.SaveTemplate>(PORT1 + `/survey/project/saveAs/tpl`, params);
};

// /survey/project/saveAs/tpl/{projectKey}
