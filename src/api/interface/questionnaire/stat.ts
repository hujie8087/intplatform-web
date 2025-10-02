export namespace StatType {
  // 统计项目收集信息
  export interface ReportStats {
    msg: string;
    code: number;
    data: ReportStatsEntity;
  }
  // 项目收集情况按周查看
  export interface ReportSituation {
    msg: string;
    code: number;
    data: ReportSituationEntity;
  }
  // 项目收集设备统计
  export interface ReportDevice {
    msg: string;
    code: number;
    data: ReportDeviceEntity;
  }
  // 项目收集来源
  export interface ReportSource {
    msg: string;
    code: number;
    data: ReportSourceEntity;
  }
  // 项目数据分析
  export interface ReportAnalysis {
    msg: string;
    code: number;
    data: ReportAnalysisEntity;
  }
  // 项目排行榜
  export interface ReportRank {
    msg: string;
    code: number;
    data: ReportRankEntity;
  }

  // 返回的数据格式定义
  export interface ReportStatsEntity {
    viewCount: number;
    avgCompleteTime: number;
    completeCount: number;
  }

  export interface ReportSituationEntity {
    count: number;
    createTime: string | null;
  }

  export interface ReportDeviceEntity {
    osName: string | null;
    count: number;
  }

  export interface ReportSourceEntity {
    browserName: string | null;
    count: number;
  }

  export interface ReportAnalysisEntity {
    type: string | null;
    label: string | null;
    fieldName: string[];
    data: number[];
    map: any;
    chartType: string | null;
  }

  export interface ReportRankEntity {
    label: string | null;
    dataItemMap: any;
  }
}
