<template>
  <el-dialog v-model="drawerVisible" :destroy-on-close="true" size="450px" :title="`${drawerProps.title}区域楼栋`">
    <el-form
      ref="ruleFormRef"
      label-width="120px"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="drawerProps.rowData"
      :hide-required-asterisk="drawerProps.isView"
    >
      <el-form-item v-if="drawerProps.isAdd" label="是否创建多个" prop="isBatch">
        <el-radio-group v-model="isBatch">
          <el-radio :label="false">单个创建</el-radio>
          <el-radio :label="true">批量创建</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-radio-group v-model="type">
          <el-radio :label="false">区域/楼栋/楼层</el-radio>
          <el-radio :label="true">房间</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="所属楼栋" prop="pid">
        <el-tree-select
          v-model="drawerProps.rowData.pid"
          lazy
          :load="loadNode"
          check-strictly
          :props="buildingTreeProps"
          :cache-data="cacheData"
          node-key="id"
        />
      </el-form-item>
      <el-form-item label="楼栋/房间名" prop="title">
        <el-input
          v-model="drawerProps.rowData!.title"
          placeholder="请填写区域/楼栋/房间名,批量创建:填写第一个名称"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="新建数量" prop="quantity" v-if="isBatch && drawerProps.isAdd">
        <el-input-number v-model="quantity"></el-input-number>
      </el-form-item>
      <el-form-item label="编码" prop="code" v-if="!type">
        <el-input v-model="drawerProps.rowData!.code" placeholder="请填写编码" clearable></el-input>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="drawerProps.rowData!.sort" placeholder="请填写排序" :min="0" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-switch
          v-model="drawerProps.rowData!.status"
          inline-prompt
          :active-value="1"
          :inactive-value="0"
          :default-value="1"
          :active-text="`${$t('dict.enable')}`"
          :inactive-text="`${$t('dict.disable')}`"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="drawerProps.rowData!.remark" placeholder="请填写备注" clearable></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">取消</el-button>
      <el-button type="primary" v-show="!drawerProps.isView" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="RoomDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import type Node from "element-plus/es/components/tree/src/model/node";
import { useI18n } from "vue-i18n";
import { Building } from "@/api/interface/productDisplay/building";
// import { getBuildingNode, getBuildingTree } from "@/api/modules/dormitory/building";
import { findChildrenById } from "@/utils/index";
import { BuildingStore } from "@/stores/modules/building";
const { t } = useI18n(); // 解构出t方法
const buildingStore = BuildingStore();
const validateQuantity = (rule: any, value: any, callback: any) => {
  if (quantity.value === 0 && isBatch.value) {
    callback(new Error("新建数量需大于0"));
  }
  callback();
};

const rules = reactive({
  title: [{ required: true, message: "请填写区域/楼栋/房间名,批量创建:填写第一个名称" }],
  quantity: [{ validator: validateQuantity, trigger: "blur" }],
  sort: [{ required: true, message: "请填写排序" }]
});

// 是否批量生成
const isBatch = ref(false);
const quantity = ref(0);
const type = ref(false);
interface DrawerProps {
  title: string;
  isView: boolean;
  isAdd: boolean;
  rowData?: any;
  api?: (params: any) => Promise<any>;
  getTableList?: () => Promise<any>;
  tableData?: Building.ResBuilding;
  updateBuilding?: (id: number) => Promise<any>;
}

const buildingTreeProps = {
  label: "title",
  children: "children",
  isLeaf: "hasChildren"
};
// drawer框状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  isAdd: false
});
interface CacheData {
  id: number;
  title: string;
}
let cacheData: CacheData[] = [];
// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps): void => {
  ruleFormRef.value?.resetFields();
  drawerProps.value = params;
  drawerVisible.value = true;
  const data = findChildrenById(params.rowData.id, buildingStore.allBuildingList);
  type.value = data && data.length > 0 ? false : true;
  if (drawerProps.value.rowData.pid === 0) {
    cacheData = [{ id: 0, title: "维达贝" }];
  } else {
    cacheData = [{ id: drawerProps.value.tableData?.id as number, title: params.tableData?.title as string }];
  }
};
const loadNode = async (node: Node, resolve: (data: Building.ResBuilding[]) => void) => {
  if (node.level === 0) {
    const data = findChildrenById(0, buildingStore.allBuildingList);
    return resolve(data!.map(item => ({ ...item, hasChildren: item.children && item.children.length > 0 })));
  } else {
    const data = findChildrenById(node.data.id, buildingStore.allBuildingList);
    resolve(data!);
  }
};
// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    const data = drawerProps.value.rowData;
    if (!drawerProps.value.rowData.pid) {
      drawerProps.value.rowData = { ...drawerProps.value.rowData, pid: 0 };
    }
    try {
      if (isBatch.value && drawerProps.value.isAdd) {
        const promises: any = [];
        const match = data.title.match(/\d+/);
        if (match) {
          const strNum = match[0];
          const num = parseInt(strNum);
          for (let i = 0; i < quantity.value; i++) {
            let str = "";
            let code = "";
            if (i < 9) {
              str = data.title.replace(num, (num + i).toString());
              code = data.code ? data.code.slice(0, -1) + (num + i) : "";
            } else {
              str = data.title.replace(new RegExp(`(${num})(?=[^${num}]*$)`), (num + i).toString());
              code = data.code
                ? strNum.length > 1
                  ? data.code.slice(0, -2) + (num + i)
                  : data.code.slice(0, -1) + (num + i)
                : "";
            }
            promises.push(drawerProps.value.api!({ ...data, title: str, code, sort: i + data.sort }));
          }
          Promise.all(promises)
            .finally(() => {
              ElMessage.success({
                message: t("main.successMsg", { title: "楼栋房间", method: `${drawerProps.value.title}` })
              });
              drawerProps.value.getTableList!();
              // drawerProps.value.updateBuilding!(drawerProps.value.rowData.pid);
              drawerVisible.value = false;
            })
            .then(() => {
              drawerProps.value.getTableList!();
            });
        }
      } else {
        await drawerProps.value.api!(drawerProps.value.rowData);
        ElMessage.success({
          message: t("main.successMsg", { title: "楼栋房间", method: `${drawerProps.value.title}` })
        });
        drawerProps.value.getTableList!();
        drawerVisible.value = false;
      }
    } catch (error) {
      console.log(error);
    }
  });
};

defineExpose({
  acceptParams
});
</script>
