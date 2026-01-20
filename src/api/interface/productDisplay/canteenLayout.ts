// 桌台布局

export namespace CanteenLayout {
  export interface ResTable {
    id: number; // 唯一标识
    label: string; // 桌号显示的文字，如 "A01"
    type: string; // 桌台类型：卡座、圆桌、方桌、包间
    capacity: number; // 容纳人数
    x: number; // 画布上的X坐标
    y: number; // 画布上的Y坐标
    width: number; // 宽度
    height: number; // 高度
    shape: string; // 渲染形状
    status?: string; // 运行时状态
    rotation?: number; // 旋转角度 (进阶功能)
    icon?: string;
  }
  export interface ResCanteenLayout {
    id: string;
    canteen: string; // 区域名称，如“一楼大厅”、“二楼包厢”
    canteenId: string;
    width: number; // 画布总宽
    height: number; // 画布总高
    status: number; // 运行时状态
    remark: string; // 备注
    createTime: string;
    updateTime: string;
    createBy: string;
    updateBy: string;
    delFlag: string;
    foodCanteenLayoutDeskList?: ResTable[];
  }
  export type CreateCanteenLayout = Optional<ResCanteenLayout, "id" | "foodCanteenLayoutDeskList">;
}
