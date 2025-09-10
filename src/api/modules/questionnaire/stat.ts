// 问卷统计api接口
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { StatType } from "@/api/interface/questionnaire/stat";

// 统计项目收集信息
export const getProjectReportStats = (projectKey?: string) => {
  return http.get<StatType.ReportStatsEntity>(PORT1 + `/survey/statistics/stats/${projectKey}`);
};

// 项目收集情况按周查看
export const getProjectReportSituation = (projectKey?: string) => {
  return http.get<StatType.ReportSituationEntity>(PORT1 + `/survey/statistics/situation/${projectKey}`);
};

// 项目收集情况按设备统计
export const getProjectReportDevice = (projectKey?: string) => {
  return http.get<StatType.ReportDeviceEntity>(PORT1 + `/survey/statistics/device/${projectKey}`);
};

// 项目收集来源统计
export const getProjectReportSource = (projectKey?: string) => {
  return http.get<StatType.ReportSourceEntity>(PORT1 + `/survey/statistics/source/${projectKey}`);
};

// 数据分析
export const getProjectReportAnalysis = (projectKey?: string) => {
  return http.get<StatType.ReportAnalysisEntity>(PORT1 + `/survey/statistics/analysis/${projectKey}`);
};

// 排行榜
export const getProjectReportRank = (projectKey?: string) => {
  return http.get<StatType.ReportRankEntity>(PORT1 + `/survey/statistics/rank/${projectKey}`);
};

// 回答列表
