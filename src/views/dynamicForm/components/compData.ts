import Icon from "./compIcon";
// 组件类型
export enum CompType {
  // 展示组件
  formTitle = "FormTitle",
  img = "Img",
  // 基础组件
  input = "Input",
  radio = "Radio",
  checkout = "Checkout",
  // 布局组件
  divider = "Divider", // 分割线
  paging = "Paging", // 分页
  button = "Button", // 按钮
  select = "Select"
}
// 忽略行号类型组件
export const IgnoreLineNumberTypeList = [CompType.formTitle, CompType.img, CompType.divider, CompType.paging];

// 组件元素类型
export interface CompItemType {
  name: string;
  label: string;
  type: CompType;
  icon?: string;
}

enum CompListType {
  //基本类型
  basic = "Basic Component",
  //展示类型
  show = "Show Component"
}

// 组件分类列表类型
interface CompCategoryType {
  name: string;
  label: string;
  type: CompListType;
  tooltip?: string;
  children: CompItemType[];
}

// 仅展示组件类型
export const JustShowCompType: string[] = [CompType.formTitle, CompType.img, CompType.divider, CompType.paging, CompType.button];

// 显示组件
const ShowComponentList: CompItemType[] = [
  {
    label: "标题",
    name: "标题",
    type: CompType.formTitle,
    icon: Icon.Title
  },
  {
    label: "图片",
    name: "图片",
    type: CompType.img,
    icon: Icon.Img
  }
];

// 基础组件
const BasicComponentList: CompItemType[] = [
  {
    label: "单行输入",
    name: "单行输入",
    type: CompType.input,
    icon: Icon.Input
  },
  {
    label: "单选",
    name: "单选",
    type: CompType.radio,
    icon: Icon.Radio
  },
  {
    label: "多选",
    name: "多选",
    type: CompType.checkout,
    icon: Icon.Checkout
  }
];

export const CompListData: CompCategoryType[] = [
  {
    name: "展示",
    label: "展示",
    tooltip: "提示",
    type: CompListType.show,
    children: [...ShowComponentList]
  },
  {
    name: "基础",
    label: "基础",
    type: CompListType.basic,
    children: [...BasicComponentList]
  }
];
