import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { RecyclingStation } from "@/api/interface/questionnaire/recyclingStation";
// 获取回收站问卷列表
export const getProjectList = (params: { projectName?: string; status?: string; pageNum: number; pageSize: number }) => {
  return http.get<RecyclingStation.ProjectList>(PORT1 + `/survey/project/recycle/list`, { ...params });
};
// 删除回收站项目
export const deleteProject = (projectKey: string) => {
  return http.delete<RecyclingStation.DeleteItem>(PORT1 + `/survey/project/recycle/del/${projectKey}`);
};
// 恢复回收站项目
export const undeleteQuestionnaire = (projectKey: string) => {
  return http.put<RecyclingStation.Undelete>(PORT1 + `/survey/project/recycle/restore/${projectKey}`);
};
