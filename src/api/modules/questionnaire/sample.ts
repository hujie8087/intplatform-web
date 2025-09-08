import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { SampleType } from "@/api/interface/questionnaire/sample";
// 获取问卷样本列表
export const getSampleList = (params: { projectName?: string; status?: string; pageNum: number; pageSize: number }) => {
  return http.get<SampleType.SampleList>(PORT1 + `/survey/project/sample/list`, { ...params });
};
// 添加样本
export const addSample = params => {
  return http.post<SampleType.AddSample>(PORT1 + `/survey/project/sample`, params);
};
// 修改项目样本
export const editSample = params => {
  return http.put<SampleType.EditSample>(PORT1 + `/survey/project/recycle/restore/`, params);
};
// 项目样本详情
export const sampleDeatil = (ids: string) => {
  return http.get<SampleType.SampleDetail>(PORT1 + `/survey/project/sample/${ids}`);
};
// 删除项目样本
export const deleteSample = (ids: string) => {
  return http.delete<SampleType.DeleteSample>(PORT1 + `/survey/project/sample/${ids}`);
};
// 导入项目样本
export const importSample = params => {
  return http.post(PORT1 + `/survey/project/sample/import`, params);
};
