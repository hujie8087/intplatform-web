<template>
  <div class="main-box">
    <div class="main-content-split">
      <div class="tree-panel" :style="{ width: leftWidth + 'px' }">
        <TreeFilter
          ref="treeFilterRef"
          title="部门列表"
          label="label"
          id="id"
          :request-api="listDeptTreeWithEmployeeCount"
          :default-value="treeFilterValues.deptId"
          @change="changeTreeFilter"
          :default-expanded-keys="defaultExpandedKeys"
        />
      </div>
      <div class="splitter" @mousedown="onSplitterMouseDown"></div>
      <div class="table-box" :style="{ flex: 1 }">
        <ProTable
          ref="proTable"
          highlight-current-row
          :columns="columns"
          :request-api="getEmployeeList"
          :init-param="treeFilterValues"
          :data-callback="dataCallback"
          :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
        >
          <!-- 表格 header 按钮 -->
          <template #tableHeader>
            <el-button type="primary" v-mealAuth="['system:employee:add']" :icon="CirclePlus" @click="openDrawer('新增')">
              新增员工
            </el-button>
            <el-button type="primary" v-mealAuth="['system:employee:import']" :icon="Upload" plain @click="batchAdd">
              批量添加员工
            </el-button>
            <el-button type="warning" v-mealAuth="['system:employee:export']" :icon="Download" plain @click="downloadFile">
              导出员工数据
            </el-button>
          </template>
          <!-- 表格操作 -->
          <template #operation="scope">
            <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
            <el-button
              type="warning"
              link
              v-if="scope.row.userId !== 1"
              :icon="EditPen"
              v-mealAuth="['system:employee:edit']"
              @click="openDrawer('编辑', scope.row)"
            >
              编辑
            </el-button>
            <el-button type="danger" link :icon="Delete" v-mealAuth="['system:employee:remove']" @click="deleteAccount(scope.row)"
              >删除</el-button
            >
          </template>
        </ProTable>
        <EmployeeDrawer ref="drawerRef" />
        <ImportExcel ref="dialogRef" />
      </div>
    </div>
  </div>
</template>
<script setup lang="tsx" name="MdcEmployee">
import { ref, reactive, watch, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useHandleData } from "@/hooks/useHandleData";
import { useDownload } from "@/hooks/useDownload";
import ProTable from "@/components/ProTable/index.vue";
import TreeFilter from "@/components/TreeFilter/index.vue";
import ImportExcel from "@/components/ImportExcel/index.vue";
import EmployeeDrawer from "./components/EmployeeDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, Download, Upload, View } from "@element-plus/icons-vue";
import {
  listEmployee,
  delEmployee,
  updateEmployee,
  addEmployee,
  getEmployee,
  changeEmployeeStatus,
  batchAddEmployee
} from "@/api/modules/mdc/system/employee";
import { Employee } from "@/api/interface/mealDelivery/system/employee";
import { genderType, religionOptions, userStatus } from "@/utils/serviceDict";
import { useAuthButtons } from "@/hooks/useAuthButtons";
import { DictOptions } from "@/api/interface";
import { listDeptTreeWithEmployeeCount } from "@/api/modules/mdc/system/dept";
import { queryCompanyOptionList } from "@/api/modules/mdc/system/company";
import { getPostList } from "@/api/modules/system/post";
import { useDict } from "@/hooks/useDict";
const { BUTTONS } = useAuthButtons();
const baseUrl = import.meta.env.VITE_API_URL;
// ProTable 实例
const proTable = ref<ProTableInstance>();
const dataCallback = (data: any) => {
  return {
    list: data.rows,
    total: data.total,
    current: data.current,
    size: data.size
  };
};

const getEmployeeList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  if (newParams.deptId === 0) {
    delete newParams.deptId;
  }
  if (Array.isArray(newParams.createTime) && newParams.createTime.length === 2) {
    newParams.params = {
      beginTime: newParams.createTime[0],
      endTime: newParams.createTime[1]
    };
    delete newParams.createTime;
  }
  return listEmployee(newParams);
};

// 获取国籍数据字典
const nationOptions = ref<DictOptions[]>([]);
useDict("sys_nationality").then(res => {
  nationOptions.value = res.sys_nationality;
});

// 获取公司列表
const companyOptions = ref<DictOptions[]>([]);
const getCompanyList = async () => {
  const res = await queryCompanyOptionList();
  companyOptions.value = res.data.map(item => ({ label: item.companyName, value: item.companyId }));
};
getCompanyList();

// 获取岗位列表
const postOptions = ref<DictOptions[]>([]);
const getPostOptions = async () => {
  const res = await getPostList({ pageNum: 1, pageSize: 9999 });
  postOptions.value = res.rows.map(item => ({ label: item.postName, value: item.postId }));
};
getPostOptions();

// 部门树形选择实例
const treeFilterRef = ref<InstanceType<typeof TreeFilter>>();
// 表格配置项
const columns = reactive<ColumnProps<Employee.ResEmployee>[]>([
  { type: "selection", label: "", width: 50 },
  { prop: "jobNumber", label: "employee.jobNumber", search: { el: "input" }, width: 100 },
  { prop: "username", label: "employee.username", search: { el: "input" }, width: 120 },
  { prop: "deptPath", label: "employee.dept", width: 120 },
  { prop: "companyName", label: "employee.company", width: 80 },
  { prop: "nationType", label: "employee.nationType", enum: nationOptions },
  { prop: "postId", label: "employee.post", width: 100, enum: postOptions },
  { prop: "phone", label: "employee.phone", width: 120, search: { el: "input" } },
  { prop: "sex", label: "employee.sex", enum: genderType },
  { prop: "religion", label: "employee.religion", enum: religionOptions },
  {
    prop: "status",
    label: "employee.status",
    tag: true,
    enum: userStatus,
    width: 80,
    search: { el: "select" },
    render: scope => {
      return (
        <span>
          {BUTTONS.value["*:*:*"] || BUTTONS.value["system:employee:edit"] ? (
            <el-switch
              model-value={scope.row.status}
              active-value={"0"}
              inactive-value={"1"}
              onClick={() => changeStatus(scope.row)}
            />
          ) : (
            <el-tag type={scope.row.status === "0" ? "success" : "danger"}>{scope.row.status ? "启用" : "禁用"}</el-tag>
          )}
        </span>
      );
    }
  },
  { prop: "creator", label: "main.createBy", width: 100 },
  {
    prop: "createTime",
    label: "main.createTime",
    width: 140,
    search: {
      span: 2,
      el: "date-picker",
      props: {
        type: "daterange",
        valueFormat: "YYYY-MM-DD"
      }
    }
  },
  { prop: "operation", label: "main.operation", width: 200, fixed: "right" }
]);

// 默认 treeFilter 参数
const treeFilterValues = reactive({ deptId: 0, pageSize: 50 });
const changeTreeFilter = (val: number) => {
  proTable.value!.pageable.pageNum = 1;
  treeFilterValues.deptId = val;
};
const defaultExpandedKeys = computed(() => {
  const keys = [];
  treeFilterRef.value?.treeData.forEach(rootNode => {
    keys.push(rootNode.id); // 展开第一层节点
  });
  return keys;
});
watch(
  () => proTable.value?.radio,
  () => proTable.value?.radio && ElMessage.success(`选中 id 为【${proTable.value?.radio}】的数据`)
);
// 切换员工状态
const changeStatus = async (row: Employee.ResEmployee) => {
  await useHandleData(changeEmployeeStatus, row.id, `切换【${row.username}】员工状态`);
  proTable.value?.getTableList();
};
// 删除员工信息
const deleteAccount = async (params: Employee.ResEmployee) => {
  await useHandleData(delEmployee, { id: [params.id] }, `删除【${params.username}】员工`);
  proTable.value?.getTableList();
};

// 导出员工列表
const downloadFile = async () => {
  ElMessageBox.confirm("确认导出员工数据?", "温馨提示", { type: "warning" }).then(() =>
    useDownload(`${baseUrl}/system/mdc/employee/export`, "员工列表", true, ".xlsx", "post", proTable.value?.searchParam)
  );
};

// 批量添加员工
const dialogRef = ref<InstanceType<typeof ImportExcel> | null>(null);
const batchAdd = () => {
  const params = {
    title: "员工",
    tempApi: "intplatform-stage-api/system/user/importTemplate",
    importApi: batchAddEmployee,
    getTableList: proTable.value?.getTableList
  };
  dialogRef.value?.acceptParams(params);
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof EmployeeDrawer> | null>(null);
const transformDeptList = list => {
  return list.map(item => ({
    ...item,
    shortLabel: item.label, // 下拉展示用
    label: item.deptPath || item.label, // 输入框展示用
    children: item.children ? transformDeptList(item.children) : []
  }));
};
const openDrawer = async (title: string, row: Partial<Employee.ResEmployee> = {}) => {
  let rowData = { ...row };
  if (rowData.id) {
    const res = await getEmployee(rowData.id);
    rowData = res.data;
    rowData.deptId = Number(rowData.deptId);
  } else {
    // 如果左边部门树选择值了带过去
    if (treeFilterValues.deptId) {
      rowData.deptId = treeFilterValues.deptId;
    }
    rowData.status = "0";
  }
  const params = {
    title,
    isView: title === "查看",
    rowData: { ...rowData },
    api: title === "新增" ? addEmployee : title === "编辑" ? updateEmployee : undefined,
    getTableList: proTable.value?.getTableList,
    deptList: transformDeptList(JSON.parse(JSON.stringify(treeFilterRef.value?.treeData))),
    nationOptions: nationOptions.value,
    companyOptions: companyOptions.value,
    postOptions: postOptions.value
  };
  drawerRef.value?.acceptParams(params);
};

const leftWidth = ref(260); // 初始宽度
let dragging = false;

const onSplitterMouseDown = (e: MouseEvent) => {
  dragging = true;
  document.body.style.cursor = "col-resize";
  const startX = e.clientX;
  const startWidth = leftWidth.value;

  const onMouseMove = (moveEvent: MouseEvent) => {
    if (!dragging) return;
    const delta = moveEvent.clientX - startX;
    let newWidth = startWidth + delta;
    // 限制最小/最大宽度
    newWidth = Math.max(180, Math.min(newWidth, 600));
    leftWidth.value = newWidth;
  };

  const onMouseUp = () => {
    dragging = false;
    document.body.style.cursor = "";
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
};
</script>

<style scoped>
.main-content-split {
  display: flex;
  min-width: 0;
  height: 100%;
}
.tree-panel {
  min-width: 180px;
  max-width: 600px;
  overflow: auto;
  background: #ffffff;
  border-right: 1px solid #eeeeee;
  transition: width 0.1s;
}
.splitter {
  z-index: 2;
  width: 6px;
  cursor: col-resize;
  background: #f5f5f5;
  transition: background 0.2s;
}
.splitter:hover {
  background: #b3d8fd;
}
.table-box {
  flex: 1;
  min-width: 0;
  margin-left: 0;
  overflow: auto;
  background: #ffffff;
}
</style>
