<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTable"
        highlight-current-row
        :columns="columns"
        :request-api="getUserList"
        :data-callback="dataCallback"
        :search-col="{ xs: 1, sm: 1, md: 3, lg: 6, xl: 6 }"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader>
          <el-button type="warning" v-auth="['system:user:export']" :icon="Download" plain @click="downloadFile">
            导出用户数据
          </el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
          <el-button type="success" link :icon="Lock" v-auth="['system:user:edit']" @click="getUserInfo(scope.row)"
            >关联账号</el-button
          >
        </template>
      </ProTable>
      <UserDrawer ref="drawerRef" />
      <!-- 🔔 解绑原因弹窗 -->
      <el-dialog v-model="unbindDialogVisible" :title="isAuthorize ? '用户授权' : '解除绑定'" width="600px" @close="cancelUnbind">
        <div v-if="isAuthorize">
          <el-form ref="authorizeFormRef" :model="authorizeForm" :rules="rules" label-width="60">
            <el-form-item label="用户名" prop="username">
              <el-input v-model.trim="authorizeForm.username" placeholder="请输入用户名" clearable />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input type="password" v-model="authorizeForm.password" placeholder="请输入密码" show-password />
            </el-form-item>
          </el-form>
        </div>
        <div v-else>
          <el-descriptions class="margin-top" title="" :column="2" border>
            <el-descriptions-item :span="2">
              <template #label>
                <div class="cell-item">
                  <el-icon>
                    <office-building />
                  </el-icon>
                  部门
                </div>
              </template>
              {{ userInfo.deptName }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon>
                    <user />
                  </el-icon>
                  用户姓名
                </div>
              </template>
              {{ userInfo?.nickName }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon>
                    <user />
                  </el-icon>
                  用户帐号
                </div>
              </template>
              {{ userInfo?.userName }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <template #footer>
          <el-button @click="cancelUnbind">取消</el-button>
          <el-button type="danger" @click="submitUnbind"> {{ isAuthorize ? "账户授权" : "解除绑定" }}</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>
<script setup lang="tsx" name="useSelectFilter">
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useDownload } from "@/hooks/useDownload";
import ProTable from "@/components/ProTable/index.vue";
import UserDrawer from "./components/UserDrawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { View, Lock, OfficeBuilding, Download } from "@element-plus/icons-vue";
import { getUserList, editUser, addUser } from "@/api/modules/user";
import { Account, Role } from "@/api/interface/system";
import { getUserRole, revokeAuthorization, userAuthorization } from "@/api/modules/system/user";
import { getRoleSelectList } from "@/api/modules/system/role";
import { getConfigData } from "@/api/modules/system/config";
import { DictOptions } from "@/api/interface";
const baseUrl = import.meta.env.VITE_API_URL;
// ProTable 实例
const proTable = ref<ProTableInstance>();
const dataCallback = (data: any) => {
  console.log(data);
  return {
    list: data.data.list,
    total: data.data.total
  };
};
const userStatus = ref<DictOptions[]>([
  { label: "未知", value: 0, tagType: "danger" },
  { label: "未激活", value: 1, tagType: "success" },
  { label: "正常", value: 2, tagType: "primary" },
  { label: "禁用", value: 3, tagType: "danger" },
  { label: "锁定", value: 4, tagType: "warning" },
  { label: "离职", value: 5, tagType: "info" },
  { label: "退休", value: 6, tagType: "info" },
  { label: "黑名单", value: 7, tagType: "danger" }
]);
// 表格配置项
const columns = reactive<ColumnProps<Account.ResAccountList>[]>([
  { type: "selection", fixed: "left", width: 50 },
  {
    prop: "account",
    label: "用户帐号",
    width: 120,
    search: { el: "input" }
  },
  {
    prop: "name",
    label: "用户姓名",
    width: 160,
    search: { el: "input" }
  },
  {
    prop: "sex",
    label: "性别",
    width: 100
  },
  {
    prop: "tel",
    label: "电话",
    width: 120
  },
  {
    prop: "postName",
    label: "岗位",
    width: 160
  },
  {
    prop: "formatOrganizeName",
    label: "所属组织"
  },
  {
    prop: "status",
    label: "状态",
    enum: userStatus,
    width: 100,
    tag: true,
    search: { el: "select", props: { filterable: true } }
  },
  { prop: "operation", label: "操作", width: 230, fixed: "right" }
]);

const roleList = ref<Role.ResRole[]>([]);
const getRolesList = async () => {
  const res = await getRoleSelectList();
  roleList.value = res.data;
};
getRolesList();
// 导出用户列表
const downloadFile = async () => {
  ElMessageBox.confirm("确认导出用户数据?", "温馨提示", { type: "warning" }).then(() =>
    useDownload(`${baseUrl}/system/user/export`, "用户列表", true, ".xlsx", "post", proTable.value?.searchParam)
  );
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof UserDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<Account.ResThirdUser> = {}) => {
  const params = {
    title,
    isView: title === "查看",
    rowData: row,
    api: title === "新增" ? addUser : title === "编辑" ? editUser : undefined,
    getTableList: proTable.value?.getTableList,
    userStatus: userStatus.value
  };
  drawerRef.value?.acceptParams(params);
};

const userInfo = reactive({
  deptName: "",
  nickName: "",
  userName: ""
});
let authorizationID = 0; // 当前选中的ID
const unbindDialogVisible = ref(false);
const isAuthorize = ref(true);
const authorizeFormRef = ref();
const authorizeForm = reactive({
  username: "",
  password: ""
});
const rules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [
    {
      required: true,
      message: "请输入密码",
      trigger: "change"
    }
  ]
};

const getUserInfo = async params => {
  authorizationID = params.account;
  const response: any = await getUserRole(authorizationID);
  let mealRole = response.mealRole;
  // mealId有值证明是历史用户，走解绑逻辑，没值则走授权逻辑
  if (mealRole) {
    let user = mealRole?.user ?? {};
    isAuthorize.value = false;
    userInfo.nickName = user.nickName;
    userInfo.userName = user.userName;
    userInfo.deptName = user?.dept?.deptName ?? "--";
  } else {
    isAuthorize.value = true;
    const res = await getConfigData("sys.mealuser.initPassword");
    let userMesg = response.user;
    authorizeForm.username = userMesg.userName;
    authorizeForm.password = res.msg;
  }
  unbindDialogVisible.value = true;
};

const submitUnbind = async () => {
  if (isAuthorize.value) {
    // 授权
    authorizeFormRef.value.validate(async (valid, fields) => {
      if (valid) {
        await userAuthorization({ username: authorizeForm.username, password: authorizeForm.password });
        unbindDialogVisible.value = false;
        ElMessage.success("授权成功");
        authorizeForm.username = "";
        authorizeForm.password = "";
        proTable.value?.getTableList();
      } else {
        console.log("error submit!", fields);
      }
    });
  } else {
    // 解绑
    await revokeAuthorization(userInfo.userName);
    unbindDialogVisible.value = false;
    ElMessage.success("解绑成功");
    proTable.value?.getTableList();
  }
};
const cancelUnbind = () => {
  if (isAuthorize.value) {
    authorizeFormRef.value.resetFields();
    authorizeForm.username = "";
    authorizeForm.password = "";
  }
  unbindDialogVisible.value = false;
};
</script>
