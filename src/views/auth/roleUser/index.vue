<template>
  <div class="main-box">
    <div class="table-box">
      <div class="card table-search">
        <div>
          <div class="el-form-item el-form-item--small" style="width: 200px">
            <label class="el-form-item__label">搜索：</label>
            <div class="el-form-item__content">
              <div class="el-input el-input--small el-input--suffix">
                <div class="el-input__wrapper">
                  <input
                    type="text"
                    class="el-input__inner"
                    v-model="keyword"
                    placeholder="请输入搜索内容"
                    @keydown.enter="filter"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <vue3-tree-org
        ref="treeOrgRef"
        :data="data"
        :props="{ label: 'roleName', children: 'children', id: 'roleId', pid: 'prId', sysUser: 'sysUser' }"
        :horizontal="false"
        :center="true"
        :collapsable="true"
        :label-style="style"
        :node-draggable="false"
        :only-one-node="onlyOneNode"
        :default-expand-level="1"
        :clone-node-drag="cloneNodeDrag"
        :disabled="true"
        :filter-node-method="filterNodeMethod"
        @on-node-click="onNodeClick"
      >
        <!-- 自定义节点内容 -->
        <template #default="{ node }">
          <div class="tree-org-node__text node-label">
            {{ node.label }}({{ node.$$data.sysUser ? node.$$data.sysUser.length : 0 }})
          </div>
        </template>
        <!-- 自定义展开按钮 -->
        <template #expand="{ node }">
          <div>{{ node.children.length }}</div>
        </template>
      </vue3-tree-org>
    </div>
    <el-dialog v-model="dialogVisible" title="人员列表" width="1200px">
      <div style="height: 600px">
        <ProTable ref="proTable" :columns="columns" :data="userList" row-key="userId" :tool-button="false" :pagination="false" />
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="tsx" name="authRoleUser">
import { getRoleUserNumber } from "@/api/modules/system/role";
import { computed, ref } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance } from "@/components/ProTable/interface";
import { ColumnProps } from "@/components/ProTable/interface";
import { User } from "@/api/interface";
const dialogVisible = ref(false);
const proTable = ref<ProTableInstance>();

const data = ref({});
const style = ref({});
const onlyOneNode = ref(false);
const cloneNodeDrag = ref(false);
const keyword = ref("");
const userList = ref<User.ResUserList[]>([]);
const columns = computed((): ColumnProps<User.ResUserList>[] => [
  { type: "selection", fixed: "left", width: 50 },
  {
    prop: "userName",
    label: "用户工号"
  },
  {
    prop: "nickName",
    label: "用户姓名"
  },
  {
    prop: "email",
    label: "邮箱"
  },
  {
    prop: "phonenumber",
    label: "手机号"
  },
  {
    prop: "status",
    label: "状态",
    render: scope => {
      return (
        <span>
          <el-tag type={scope.row.status === "0" ? "success" : "danger"}>{scope.row.status === "0" ? "启用" : "禁用"}</el-tag>
        </span>
      );
    }
  }
]);

const getRoleUserList = () => {
  getRoleUserNumber().then(res => {
    data.value = {
      roleId: 0,
      roleName: "IWIP后勤综合服务平台",
      children: res.rows || [],
      sysUser: []
    };
    console.log(data.value);
  });
};
getRoleUserList();
const treeOrgRef = ref();
const filter = () => {
  treeOrgRef.value?.filter(keyword.value);
};
const filterNodeMethod = (value, data) => {
  console.log(value, data);
  if (!value) return true;
  return data.label.indexOf(value) !== -1;
};
const onNodeClick = (e, data) => {
  console.log(data.sysUser.length);
  userList.value = data.sysUser;
  dialogVisible.value = true;
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
</style>
