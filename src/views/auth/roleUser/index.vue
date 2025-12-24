<template>
  <div class="main-box">
    <div class="main-content-split">
      <div class="tree-panel" :style="{ width: leftWidth + 'px' }">
        <TreeFilter
          ref="treeOrgRef"
          title="角色列表"
          label="roleName"
          id="roleId"
          :request-api="getRoleUserNumber"
          :default-value="initParam.roleId"
          @change="handleNodeClick"
          :default-expanded-keys="defaultExpandedKeys"
          :add-all="false"
        />
      </div>
      <div class="splitter" @mousedown="onSplitterMouseDown"></div>
      <div class="table-box">
        <div class="table-left">
          <TreeFilter ref="treeRef" title="角色权限列表" :data="menuList" :add-all="false" />
        </div>
        <div class="table-right">
          <div class="card card-info" style="margin-bottom: 10px">
            <div class="head">{{ roleDetail?.roleName }}</div>
            <div class="content">
              <div class="content-left">
                <div class="content-item">
                  <div class="content-item-left">角色名称：</div>
                  <div class="content-item-right">
                    <el-text type="primary" size="large">{{ roleDetail?.roleName }}</el-text>
                  </div>
                </div>
                <div class="content-item">
                  <div class="content-item-left">上级角色：</div>
                  <div class="content-item-right">{{ roleDetail?.parentName }}</div>
                </div>
                <div class="content-item">
                  <div class="content-item-left">人员数量：</div>
                  <div class="content-item-right">
                    <el-text type="danger" size="large">{{ roleDetail?.userCount }}人</el-text>
                  </div>
                </div>
              </div>
              <div class="content-right">
                <div class="content-item">
                  <div class="content-item-left">角色标识：</div>
                  <div class="content-item-right">{{ roleDetail?.roleKey }}</div>
                </div>
                <div class="content-item">
                  <div class="content-item-left">创建人：</div>
                  <div class="content-item-right">{{ roleDetail?.createBy }}</div>
                </div>
                <div class="content-item">
                  <div class="content-item-left">创建时间：</div>
                  <div class="content-item-right">{{ roleDetail?.createTime }}</div>
                </div>
              </div>
            </div>
          </div>
          <ProTable
            ref="proTable"
            :columns="columns"
            :request-api="getRoleUserList"
            :init-param="initParam"
            :data-callback="dataCallback"
            row-key="userName"
            :tool-button="false"
          >
            <template #tableHeader="scope">
              <!-- 新增 -->
              <el-button type="primary" icon="Plus" @click="handleAddAuth">新增授权</el-button>
              <el-button
                type="danger"
                icon="Delete"
                :disabled="!scope.isSelected"
                @click="handleCancelAuthAll(scope.selectedListIds)"
                >批量取消授权</el-button
              >
            </template>
            <template #operation="scope">
              <el-button type="danger" @click="handleCancelAuth(scope.row)">取消授权</el-button>
            </template>
          </ProTable>
        </div>
      </div>
    </div>
    <AddUserDrawer ref="addUserDrawer" />
  </div>
</template>

<script setup lang="tsx" name="authRoleUser">
import {
  addAuth,
  cancelAuth,
  cancelAuthAll,
  getRoleUserList,
  getRoleUserNumber,
  getRoleMenuTreeselect,
  getUserRole
} from "@/api/modules/system/role";
import { computed, reactive, ref, watch } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance } from "@/components/ProTable/interface";
import { ColumnProps } from "@/components/ProTable/interface";
import { Account, Menu, Role } from "@/api/interface/system";
import { User } from "@/api/interface";
import { ElMessage } from "element-plus";
import TreeFilter from "@/components/TreeFilter/index.vue";
import AddUserDrawer from "./components/AddUserDrawer.vue";
const proTable = ref<ProTableInstance>();
const initParam = ref<Account.ReqRoleUserParams>({ roleId: 0, pageSize: 10, pageNum: 1 });
const dataCallback = (data: any) => {
  return {
    list: data.rows,
    total: data.total,
    current: data.current,
    size: data.size
  };
};
const treeOrgRef = ref();
const defaultExpandedKeys = computed(() => {
  const keys = reactive<number[]>([]);
  treeOrgRef.value?.treeData.forEach(rootNode => {
    keys.push(rootNode.roleId); // 展开第一层节点
  });
  return keys;
});

watch(defaultExpandedKeys, () => {
  initParam.value.roleId = defaultExpandedKeys.value.length > 0 ? defaultExpandedKeys.value[0] : 0;
  handleRoleMenuTreeselect(initParam.value.roleId);
  handleUserRole(initParam.value.roleId);
});

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
// 默认 treeFilter 参数
const checkRole = ref<Account.ResRoleUserList>();
const handleNodeClick = (row: Account.ResRoleUserList) => {
  proTable.value!.pageable.pageNum = 1;
  initParam.value.roleId = row.roleId;
  checkRole.value = row;
  handleRoleMenuTreeselect(row.roleId);
  handleUserRole(row.roleId);
};
const columns = computed((): ColumnProps<User.ResUserList>[] => [
  { type: "selection", fixed: "left", width: 50 },
  {
    prop: "roleName",
    label: "角色名称"
  },
  {
    prop: "userName",
    label: "用户帐号"
  },
  {
    prop: "nickName",
    label: "用户姓名"
  },
  {
    prop: "operation",
    label: "操作",
    width: 120,
    fixed: "right"
  }
]);

const handleCancelAuth = async (row: Account.ResRoleUserList) => {
  const result = await cancelAuth({ roleId: row.roleId, userName: row.userName });
  if (result.code === 200) {
    ElMessage.success("取消授权成功");
    initParam.value.roleId = row.roleId;
    proTable.value?.getTableList();
  } else {
    ElMessage.error("取消授权失败");
  }
};

const handleCancelAuthAll = async (selectedListIds: number[]) => {
  const result = await cancelAuthAll({
    roleId: initParam.value.roleId.toString(),
    userIds: selectedListIds.map(item => item.toString())
  });
  if (result.code === 200) {
    ElMessage.success("批量取消授权成功");
    proTable.value?.getTableList();
  } else {
    ElMessage.error("批量取消授权失败");
  }
};

const addUserDrawer = ref<InstanceType<typeof AddUserDrawer> | null>(null);
const handleAddAuth = async () => {
  if (!checkRole.value) {
    ElMessage.warning("请选择角色");
    return;
  }
  const params = {
    title: "新增授权",
    isView: false,
    api: addAuth,
    rowData: checkRole.value,
    getTableList: proTable.value?.getTableList
  };
  addUserDrawer.value?.acceptParams(params);
};
const menuList = ref<Menu.ResMenu[]>([]);
const handleRoleMenuTreeselect = async (id: number) => {
  const { data } = await getRoleMenuTreeselect(id);
  menuList.value = data;
};
const roleDetail = ref<Role.ResRoleUserDetail>();
const handleUserRole = async (id: number) => {
  const { data } = await getUserRole(id);
  roleDetail.value = data;
};
</script>

<style scoped lang="scss">
:deep(.tree-org-node) {
  .node-label {
    display: block;
    cursor: pointer;
    border-radius: 4px;
    box-shadow: 0 0 0 1px #dcdfe6;
    transition: all 0.3s;
    &:hover {
      background-color: #f0f2f5;
      border-radius: 4px;
      box-shadow: 0 0 0 1px #dcdfe6;
      .tree-org-node__text {
        color: #303133;
      }
    }
  }
}
.main-content-split {
  display: flex;
  width: 100%;
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
  display: flex;
  flex: 1;
  flex-direction: row;
  min-width: 0;
  padding: 1px;
  margin-left: 0;
  overflow: auto;
  background: #ffffff;
  .table-left {
    width: 230px;
    height: 100%;
    margin-right: 10px;
  }
  .table-right {
    flex: 1;
    .card-info {
      padding: 10px;
      .head {
        margin-bottom: 5px;
        font-size: 18px;
        font-weight: bold;
        line-height: 36px;
        border-bottom: 1px solid #eeeeee;
      }
      .content {
        display: flex;
        padding: 5px;
        font-size: 14px;
        color: #606266;
        .content-left {
          width: 250px;
          padding-right: 10px;
          border-right: 1px solid #eeeeee;
        }
        .content-right {
          padding-left: 40px;
        }
        .content-item {
          display: flex;
          width: 100%;
          line-height: 28px;
          .content-item-left {
            width: 80px;
          }
          .content-item-right {
            flex: 1;
            font-size: 14px;
            font-weight: bold;
          }
        }
      }
    }
    :deep(.table-main) {
      height: calc(100% - 170px);
    }
  }
}
</style>
