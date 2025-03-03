import { ReqPage } from "..";

// * 宿舍服务模块
export namespace Accommodation {
  export interface ReqProcessParams extends ReqPage {
    title?: string;
    isLogin?: number;
    status?: string;
  }
  export interface ResProcess {
    id: number;
    title: string;
    content: string;
    requirements: string;
    img: string;
    isLogin: number;
    sort: number;
    icon: string;
    views: number;
    status: string;
    delFlag: string;
    createBy: string;
    createTime: string;
    updateBy: string;
    updateTime: string;
    deleteBy: string;
    deleteTime: string;
    remark: string | null;
  }
  export interface ReqApplyParams extends ReqPage {
    title?: string;
    isLogin?: number;
    status?: string;
  }
  export interface ResApply {
    id: number; // 唯一标识
    title: string; // 标题
    type: string; // 申请类型
    url: string; // 表单链接
    getTokenUrl: string; // 获取 Token 的 URL
    checkTokenUrl: string; // 检查 Token 的 URL
    img: string; // 图片资源标识
    icon: string; // 图标资源（可为空）
    isLogin: string; // 是否需要登录 ("1" 表示需要)
    sort: string; // 排序
    formId: number;
    status: string; // 状态
    delFlag: string; // 删除标志
    createBy: string; // 创建人
    createTime: string; // 创建时间
    updateBy: string; // 更新人
    updateTime: string; // 更新时间
    deleteBy: string; // 删除人（可为空）
    deleteTime: string; // 删除时间（可为空）
    remark: string; // 备注（可为空）
    def1: string; // 自定义字段1
    def2: string; // 自定义字段2
  }
}
