import { ReqPage } from "./index";
type VmTemplateKey = `${string}.vm`;
export namespace Gen {
  export interface ReqGenParams extends ReqPage {
    tableName: string;
    tableComment: string;
  }
  export interface ResGenList {
    remark: string | string;
    tableId: number;
    tableName: string;
    tableComment: string;
    subTableName: string | string;
    subTableFkName: string | string;
    className: string;
    tplCategory: string;
    tplWebType: string;
    packageName: string;
    moduleName: string;
    businessName: string;
    functionName: string;
    functionAuthor: string;
    genType: string;
    genPath: string;
    pkColumn: string | string;
    subTable: string | string;
    columns: Column[];
    options: string | string;
    treeCode: string | string;
    treeParentCode: string | string;
    treeName: string | string;
    parentMenuId: string | string;
    parentMenuName: string | string;
    crud: boolean;
    tree: boolean;
    sub: boolean;
  }

  export interface Column {
    createBy: string;
    createTime: string;
    updateBy: string;
    updateTime: string | string;
    remark: string | string;
    columnId: number | string;
    tableId: number;
    columnName: string | string;
    columnComment: string | string;
    columnType: string | null;
    javaType: string | null;
    javaField: string | null;
    isPk: boolean | null;
    isIncrement: boolean | null;
    isRequired: boolean | null;
    isInsert: boolean | null;
    isEdit: boolean | null;
    isList: boolean | null;
    isQuery: boolean | null;
    queryType: string | null;
    htmlType: string | null;
    dictType: string | null;
    sort: number | null;
    required: boolean;
    list: boolean;
    insert: boolean;
    edit: boolean;
    usableColumn: boolean;
    pk: boolean;
    superColumn: boolean;
    query: boolean;
    capJavaField: string | null;
    increment: boolean;
  }
  export interface Preview {
    [key: VmTemplateKey]: string;
  }
  export interface GenDetail {
    info: ResGenList;
    rows: DictDetail[];
    tables: TablesDetail[];
  }
  export interface DictDetail {
    createBy: string;
    createTime: string;
    updateBy: string;
    updateTime: string;
    remark: string;
    columnId: number;
    tableId: number;
    columnName: string;
    columnComment: string;
    columnType: string;
    javaType: string;
    javaField: string;
    isPk: string;
    isIncrement: string;
    isRequired: string;
    isInsert: string;
    isEdit: boolean;
    isList: boolean;
    isQuery: boolean;
    queryType: string;
    htmlType: string;
    dictType: string;
    sort: number;
    list: boolean;
    required: boolean;
    pk: boolean;
    insert: boolean;
    edit: boolean;
    usableColumn: boolean;
    superColumn: boolean;
    increment: true;
    query: boolean;
    capJavaField: string;
  }
  export interface TablesDetail {
    createBy: string;
    createTime: string;
    updateBy: string;
    updateTime: string;
    remark: string;
    tableId: number;
    tableName: string;
    tableComment: string;
    subTableName: string;
    subTableFkName: string;
    className: string;
    tplCategory: string;
    tplWebType: string;
    packageName: string;
    moduleName: string;
    businessName: string;
    functionName: string;
    functionAuthor: string;
    columns: Column[];
    genType: string;
    genPath: string;
    pkColumn: string;
    subTable: string;
    options: string;
    treeCode: string;
    treeParentCode: string;
    treeName: string;
    parentMenuId: string;
    parentMenuName: string;
    sub: false;
    tree: false;
    crud: true;
  }
}
