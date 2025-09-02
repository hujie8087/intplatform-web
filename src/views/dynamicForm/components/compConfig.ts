import { CompType } from "./compData";

type ClassifyList = "personal";
interface CompConfig {
  name: string;
  type: string; // 类型
  title: string; // 标题
  description: string | null; // 描述
  dataValue: any; // 赋值，因为value和vue的绑定冲突，所以改成dataValue
  dividerValue?: string; // 分割线文本
  dividerBorderType?: string; // 分割线类型 'none' | 'solid' | 'hidden' | 'dashed' |
  pagingValue?: string; // 分页内容
  defaultValue: string | null; // 默认值
  dataList?: any[]; // 列表数据，包括单选，多选，下拉选择
  dataOtherList?: any[]; // 其他数据
  useOtherDataList?: boolean; // 是否使用其他数据
  layoutType?: "horizontal" | "vertical"; // 横向布局，纵向布局
  isRequired?: boolean; // 必填
  placeholder?: string; // 占位符
  placeholderRange?: [string, string]; // 占位符-范围场景
  isCustomErrorMessage?: boolean; // 自定义报错
  customErrorMessage?: string; // 自定义报错
  formValidationFormat?: string; // 表单校验格式
  formValidationFormatRegex?: string; // 表单正则校验内容
  classify?: ClassifyList[]; // 分类
  // NPS满意度
  startValue?: number; // 开始值
  startValueList?: number[]; // 开始值List
  // 标题
  titleValue?: string;
  titleSize?: string;
  titleDescription?: string;
  titleImageUrl?: string;
  // 按钮
  buttonText?: string; // 按钮文本
  size?: "large" | "middle" | "small"; // 按钮大小
  position?: "left" | "right" | "center"; // 按钮位置
  buttonIconShowBool?: boolean; // 按钮图标
  // 地址
  address?: string[]; // 地址
  address_detail?: string; // 详细地址
  address_default?: string[]; // 默认地址
  address_detail_default?: string; // 默认详细地址
  address_placeholder?: string; // 地址占位符
  address_detail_placeholder?: string; // 详细地址占位符
  // 电子签名
  sign_create_type?: "png" | "jpg";
  // 扩展字段
  minValue?: number; // 最小值
  maxValue?: number; // 最大值
  // 布局组件
  isLayoutComp?: boolean; // 布局组件
}
export const disableInputByDev = "编辑模式不支持输入";
export const hasOwnPropertyFunction = (object: Object, key: string) => {
  return object && Object.prototype.hasOwnProperty.call(object, key);
};

export const HasSettingTypeList = ["Radio", "Checkout", "Select"];
export const defaultConfig: CompConfig = {
  name: "",
  type: "",
  description: null,
  dataValue: null,
  defaultValue: null,
  customErrorMessage: "",
  title: ""
};
export const isFormTitle: CompType[] = [CompType.formTitle];
export const dataListType: CompType[] = [CompType.checkout, CompType.radio, CompType.select]; // 数组列表
export const hasPlaceholderType: CompType[] = [
  CompType.input,
  CompType.textarea,
  CompType.date,
  CompType.time,
  CompType.name,
  CompType.phone,
  CompType.wx,
  CompType.workNumber,
  CompType.select,
  CompType.number
]; //有Placeholder的类型
export const isLayoutType: CompType[] = [CompType.paging, CompType.divider];
export const hasIgnoreRequireType: CompType[] = [CompType.img, CompType.paging, CompType.divider, CompType.button]; // 忽略类型
export const isRate: CompType[] = [CompType.rate];
export const isNPS: CompType[] = [CompType.nps];

export const getCompConfig = (type: CompType) => {
  let compConfig: any = {};

  if (dataListType.includes(type)) {
    compConfig = {
      ...compConfig,
      layoutType: "vertical",
      dataList: [
        {
          label: "选项一",
          value: "选项一",
          _index: 0
        },
        {
          label: "选项二",
          value: "选项二",
          _index: 1
        },
        {
          label: "选项三",
          value: "选项三",
          _index: 2
        }
      ]
    };
  }

  // 忽略必填组件
  if (!hasIgnoreRequireType.includes(type)) {
    compConfig = {
      ...compConfig,
      isRequired: false,
      isCustomErrorMessage: false,
      description: "描述"
    };
  }

  // 布局组件
  if (isLayoutType.includes(type)) {
    const isPageBool = CompType.paging === type;
    const data = isPageBool
      ? {
          pagingValue: "分页",
          pageSubTitle: "",
          pageSubDescription: ""
        }
      : {
          dividerValue: "分割线",
          position: "center",
          dividerBorderType: "solid"
        };
    compConfig = {
      ...compConfig,
      ...data,

      isLayoutComp: true
    };
  }

  // 有描述信息的组件
  if (hasPlaceholderType.includes(type)) {
    compConfig = {
      ...compConfig,
      placeholder: getCompPlaceHolderDataByType(type) || "请输入"
    };
  }

  // 标题
  if (isFormTitle.includes(type)) {
    compConfig = {
      type,
      titleValue: "标题名称",
      titleSize: "middle",
      titleDescription:
        "为了给您提供更好的服务，希望您能抽出几分钟时间，将您的感受和建议告诉我们，我们非常重视每位 用户的宝贵意见，期待您的参与！现在我们就马上开始吧！",
      titleImageUrl: "bg.png",
      titleDescriptionShow: true,
      titleImageShow: true,
      titleDescriptionPosition: "center"
    };
    return compConfig;
  }

  // 展示图片
  if (CompType.img === type) {
    compConfig = {
      ...compConfig,
      value: ""
    };
  }

  // 评分
  if (isRate.includes(type)) {
    compConfig = {
      ...compConfig,
      value: 0,
      rateCount: 5,
      rateCharacter: "",
      rateAllowHalf: false
    };
  }

  // NPS组件
  if (isNPS.includes(type)) {
    compConfig = {
      ...compConfig,
      defaultValue: 0,
      startValue: 0,
      rateCount: 10,
      startValueList: [0, 1]
    };
  }

  return compConfig;
};

export const getCompPlaceHolderDataByType = (type: string) => {
  const placeholderObject: any = {
    Name: "请输入名称",
    Gender: "请选择性别",
    Phone: "请输入手机号",
    TelePhone: "请输入固话",
    IDCard: "请输入身份证",
    Email: "请输入邮件",
    WX: "请输入微信",
    Select: "请选择"
  };
  return placeholderObject[type];
};

export const getDefaultConfig = (type: CompType | CompType[], ignoreDefault: boolean = false) => {
  let configData = ignoreDefault
    ? {}
    : {
        ...defaultConfig
      };
  if (Array.isArray(type)) {
    type.map(itemType => {
      const compConfig = getCompConfig(itemType);
      configData = {
        ...configData,
        ...compConfig
      };
    });
  } else {
    const compConfig = getCompConfig(type);
    configData = {
      ...configData,
      ...compConfig
    };
  }

  return { ...configData };
};

// 有正则配置的组件
export const verifyRegularityCompList = () => {
  return [CompType.input];
};
