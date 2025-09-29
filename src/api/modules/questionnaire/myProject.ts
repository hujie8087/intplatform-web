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
export const addProject = params => {
  return http.post<MyProject.SaveTemplate>(PORT1 + `/survey/project`, params);
};
export const editProject = params => {
  return http.put<MyProject.SaveTemplate>(PORT1 + `/survey/project`, params);
};
export const getProjectDetail = projectKey => {
  return http.get<MyProject.SaveTemplate>(PORT1 + `/survey/project/detail/${projectKey}`);
};
export const publishProject = projectKey => {
  return http.put<MyProject.PublishItem>(PORT1 + `/survey/project/publish/${projectKey}`);
};
export const stopProject = projectKey => {
  return http.put<MyProject.StopItem>(PORT1 + `/survey/project/stop/${projectKey}`);
};

export const copyProject = projectKey => {
  return http.post<MyProject.SaveTemplate>(PORT1 + `survey/project/copy/${projectKey}`);
};
// /survey/project/saveAs/tpl/{projectKey}
