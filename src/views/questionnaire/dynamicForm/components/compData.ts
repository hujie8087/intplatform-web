import Icon from "./compIcon";
// 组件类型
export enum CompType {
  // 展示组件
  formTitle = "formTitle",
  img = "img",
  // 基础组件
  input = "input",
  textarea = "textarea",
  radio = "radio",
  checkout = "checkout",
  select = "select",
  number = "number",
  // 布局组件
  divider = "divider", // 分割线
  paging = "paging", // 分页
  button = "button", // 按钮
  // 评分组件
  rate = "rate",
  nps = "nps", // nps
  selectRate = "selectRate", // 下拉评分

  // 日期
  date = "date",
  dateRange = "dateRange", // 日期范围
  time = "time",
  timeRange = "timeRange", // 时间范围

  // 联系人组件
  name = "name", // 姓名
  phone = "phone", // 手机
  wx = "wx", // 微信/wechat
  workNumber = "workNumber", // 工号
  email = "email", // 电子邮箱

  // 高级组件
  electronicSignature = "ElectronicSignature" // 电子签名
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
  show = "Show Component",
  // 评分类型
  rate = "Rate Component",
  // 时间类型
  time = "time Component",
  // 布局类型
  layout = "layout Component",
  // 个人信息类型
  personal = "layout Componet"
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
    label: "图片展示",
    name: "图片展示",
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
    label: "多行输入",
    name: "多行输入",
    type: CompType.textarea,
    icon: Icon.Textarea
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
  },
  {
    label: "下拉选择",
    name: "下拉选择",
    type: CompType.select,
    icon: Icon.Select
  },
  {
    label: "数字",
    name: "数字",
    type: CompType.number,
    icon: Icon.Number
  }
];

// 评分组件
const RateComponentList: CompItemType[] = [
  {
    label: "评分",
    name: "评分",
    type: CompType.rate,
    icon: Icon.Rate
  },
  {
    label: "NPS",
    name: "NPS",
    type: CompType.nps,
    icon: Icon.NPS
  },
  {
    label: "下拉评分",
    name: "下拉评分",
    type: CompType.selectRate,
    icon: Icon.Select
  }
];

// 日期组件
const TimeComponentList: CompItemType[] = [
  {
    label: "日期",
    name: "日期",
    type: CompType.date,
    icon: Icon.Date
  },
  {
    label: "日期范围",
    name: "日期范围",
    type: CompType.dateRange,
    icon: Icon.DateRange
  },
  {
    label: "时间",
    name: "时间",
    type: CompType.time,
    icon: Icon.Time
  },
  {
    label: "时间范围",
    name: "时间范围",
    type: CompType.timeRange,
    icon: Icon.TimeRange
  }
];

// 布局组件
const LayoutComponentList: CompItemType[] = [
  {
    label: "分割线",
    name: "分割线",
    type: CompType.divider,
    icon: Icon.Divider
  }
];

const PersonalComponentList: CompItemType[] = [
  {
    label: "姓名",
    name: "姓名",
    type: CompType.name,
    icon: Icon.Name
  },
  {
    label: "工号",
    name: "工号",
    type: CompType.workNumber,
    icon: Icon.WorkNumber
  },
  {
    label: "手机号",
    name: "手机号",
    type: CompType.phone,
    icon: Icon.Phone
  },
  {
    label: "微信号",
    name: "微信号",
    type: CompType.wx,
    icon: Icon.WX
  },
  {
    label: "邮箱",
    name: "邮箱",
    type: CompType.email,
    icon: Icon.email
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
  },
  {
    name: "评分和满意度",
    label: "评分和满意度",
    type: CompListType.rate,
    children: [...RateComponentList]
  },
  {
    name: "日期和时间",
    label: "日期和时间",
    type: CompListType.time,
    children: [...TimeComponentList]
  },
  {
    name: "布局",
    label: "布局",
    type: CompListType.layout,
    children: [...LayoutComponentList]
  },
  {
    name: "个人信息",
    label: "个人信息",
    type: CompListType.personal,
    children: [...PersonalComponentList]
  }
];
