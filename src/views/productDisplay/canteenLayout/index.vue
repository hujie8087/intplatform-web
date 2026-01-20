<template>
  <div class="main-box">
    <div class="main-content-split">
      <div class="tree-panel" :style="{ width: leftWidth + 'px' }">
        <tree-filter
          ref="treeOrgRef"
          title="布局列表"
          label="canteen"
          id="id"
          :data="canteenLayoutList"
          @change="handleNodeClick"
          :add-all="false"
          :render-content-template="renderContentTemplate"
        >
          <template #title>
            <div style="display: flex; align-items: center; justify-content: space-between">
              <h4>布局列表</h4>
              <!-- 增加布局按钮 -->
              <el-button type="primary" size="small" icon="Plus" text @click="addcanteenLayout('add')"> 新增布局 </el-button>
            </div>
          </template>
        </tree-filter>
      </div>
      <div class="splitter" @mousedown="onSplitterMouseDown"></div>
      <div class="table-box">
        <div class="table-left card">
          <div class="template-title">桌台模板(拖拽添加)</div>
          <div class="table-template-list">
            <div
              v-for="item in tableTemplates"
              :key="item.type"
              class="table-template-item"
              draggable="true"
              @dragstart="onDragStart($event, item)"
            >
              <SvgIcon :name="item.icon" :icon-style="{ width: '40px', height: '40px', marginBottom: '8px', color: '#7c7c92' }" />
              <span>{{ item.label }}</span>
            </div>
          </div>
        </div>
        <div class="table-right card" ref="canvasWrapperRef">
          <!-- 工具栏 -->
          <div class="toolbar">
            <el-tag
              v-for="item in tableStatusOptions"
              :key="item.value"
              :type="item.tagType"
              effect="dark"
              style="margin-right: 10px"
            >
              {{ item.label }}
            </el-tag>
            <el-button-group>
              <el-button size="small" icon="Minus" @click="zoomOut" :disabled="scale <= 0.5"></el-button>
              <el-button size="small" disabled>{{ Math.round(scale * 100) }}%</el-button>
              <el-button size="small" icon="Plus" @click="zoomIn" :disabled="scale >= 2.0"></el-button>
            </el-button-group>
            <!-- 撤销按钮 -->
            <el-button size="small" type="danger" style="margin-left: 10px" @click="clearTableList">清除</el-button>
            <!-- 重做按钮 -->
            <el-button size="small" type="warning" style="margin-left: 10px" @click="resetTableList">重置</el-button>
            <!-- 保存按钮 -->
            <el-button size="small" type="primary" style="margin-left: 10px" @click="saveTableList">保存</el-button>
            <!-- 一键翻台 -->
            <el-button size="small" type="success" style="margin-left: 10px" @click="resetTableStatus">一键翻台</el-button>
          </div>

          <div
            class="canvas-area"
            ref="canvasRef"
            @dragover.prevent
            @drop="onDrop"
            :style="{
              transform: `scale(${scale})`,
              transformOrigin: '0 0',
              width: canteenLayoutDetail?.width + 'px', // Ensure enough space when zoomed out
              height: canteenLayoutDetail?.height + 'px'
            }"
          >
            <!-- 背景网格 -->
            <div class="grid-background"></div>

            <!-- 桌台列表 -->
            <div
              v-for="(table, index) in tableList"
              :key="table.id"
              class="table-item"
              :class="{ active: currentTableId === table.id }"
              :style="{
                left: table.x + 'px',
                top: table.y + 'px',
                width: table.width + 'px',
                height: table.height + 'px'
              }"
              @mousedown.stop="onTableMouseDown($event, index)"
            >
              <SvgIcon
                :name="table.icon || 'table-canzhuo4fang'"
                :icon-style="{
                  width: '100%',
                  height: '100%',
                  transform: `rotate(${table.rotation || 0}deg)`,
                  pointerEvents: 'none',
                  color: `var(--el-color-${tableStatusOptions.find(item => item.value === table.status)?.tagType})`
                }"
              />
              <el-popover
                :width="200"
                popper-style="box-shadow: rgb(14 18 22 / 35%) 0px 10px 38px -10px, rgb(14 18 22 / 20%) 0px 10px 20px -15px;"
                ><template #reference>
                  <div class="table-content" style="pointer-events: auto">
                    <span v-if="editingTableId !== table.id" class="label-text" @mousedown.stop="startEditLabel(table)">{{
                      table.label
                    }}</span>
                    <el-input
                      v-else
                      v-model="table.label"
                      size="small"
                      :style="{ width: '100px' }"
                      @blur="finishEditLabel"
                      @keydown.enter="finishEditLabel"
                      @mousedown.stop
                    />
                    <span class="capacity">({{ table.capacity }}人)</span>
                  </div>
                </template>
                <template #default>
                  <div class="table-popover" style="display: flex; align-items: center; justify-content: center; width: 100%">
                    <el-select
                      v-model="table.status"
                      size="small"
                      :teleported="false"
                      :style="{ width: '70px', marginRight: '10px', pointerEvents: 'auto' }"
                    >
                      <el-option v-for="item in tableStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                    <el-select
                      v-model="table.type"
                      size="small"
                      :teleported="false"
                      :style="{ width: '70px', pointerEvents: 'auto' }"
                    >
                      <el-option v-for="item in tableTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                  </div>
                </template>
              </el-popover>
              <!-- 操作按钮 (选中显示) -->
              <div v-show="currentTableId === table.id">
                <div class="delete-btn" @mousedown.stop="deleteTable(index)">×</div>
                <div class="rotate-btn" @mousedown.stop="rotateTable(index)">↻</div>
                <div class="resize-handle" @mousedown.stop="onResizeStart($event, table)"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <CanteenLayoutDrawer ref="canteenLayoutDrawerRef" />
  </div>
</template>

<script lang="ts" setup>
import { ref, resolveComponent } from "vue";
import { CanteenLayout } from "@/api/interface/productDisplay/canteenLayout";
import TreeFilter from "@/components/TreeFilter/index.vue";
import CanteenLayoutDrawer from "./components/CanteenLayoutDrawer.vue";
import SvgIcon from "@/components/SvgIcon/index.vue";
import {
  getCanteenLayoutList,
  createCanteenLayout,
  updateCanteenLayout,
  deleteCanteenLayout,
  getCanteenLayoutDetail,
  resetTableStatusById
} from "@/api/modules/productDisplay/canteenLayout";
import { DictOptions } from "@/api/interface";
import { getCanteenListOptions } from "@/api/modules/productDisplay/marketCanteen";
import { useDict } from "@/hooks/useDict";
import { useHandleData } from "@/hooks/useHandleData";
import { ElMessage } from "element-plus";

// 所属餐厅
const canteenOptions = ref<DictOptions[]>([]);
const getCanteenList = async () => {
  const res = await getCanteenListOptions();
  canteenOptions.value = res.data.map(item => ({ label: item.name, value: item.id }));
};
getCanteenList();

// 获取作为类型数据字典
const tableTypeOptions = ref<DictOptions[]>([]);
const tableStatusOptions = ref<DictOptions[]>([]);
useDict("table_type_options", "table_status_options").then(res => {
  tableTypeOptions.value = res.table_type_options;
  tableStatusOptions.value = res.table_status_options;
});

// --- Data ---
const canteenLayoutList = ref<CanteenLayout.ResCanteenLayout[]>([]);
const canteenLayoutDetail = ref<CanteenLayout.ResCanteenLayout>();
const tableList = ref<CanteenLayout.ResTable[]>([]);

const currentTableId = ref<number>(0);
const editingTableId = ref<number>(0); // 当前正在编辑名称的桌台ID
const canvasWrapperRef = ref<HTMLElement>();
const canvasRef = ref<HTMLElement>();
const scale = ref(1.0);

// 桌台模板定义
const tableTemplates: {
  label: string;
  type: string;
  shape: CanteenLayout.ResTable["shape"];
  icon: string;
  capacity: number;
  width: number;
  height: number;
}[] = [
  // 2人
  { label: "2人桌", type: "canzhuo2", shape: "rect", icon: "canzhuo2", capacity: 2, width: 80, height: 80 },
  { label: "2人桌(遮阳)", type: "canzhuo2c", shape: "circle", icon: "canzhuo2c", capacity: 2, width: 80, height: 80 },
  { label: "4人方桌", type: "canzhuo4f", shape: "rect", icon: "canzhuo4f", capacity: 4, width: 100, height: 80 },
  { label: "4人长桌", type: "canzhuo4c", shape: "circle", icon: "canzhuo4c", capacity: 4, width: 100, height: 80 },
  { label: "4人圆桌", type: "canzhuo4", shape: "circle", icon: "canzhuo4", capacity: 4, width: 100, height: 80 },
  { label: "6人方桌", type: "canzhuo6f", shape: "rect", icon: "canzhuo6f", capacity: 6, width: 100, height: 80 },
  { label: "6人长桌", type: "canzhuo6c", shape: "rect", icon: "canzhuo6c", capacity: 6, width: 100, height: 80 },
  { label: "6人圆桌", type: "canzhuo6", shape: "circle", icon: "canzhuo6", capacity: 6, width: 100, height: 80 },
  { label: "8人方桌", type: "canzhuo8f", shape: "rect", icon: "canzhuo8f", capacity: 8, width: 100, height: 80 },
  { label: "8人长桌", type: "canzhuo8c", shape: "rect", icon: "canzhuo8c", capacity: 8, width: 100, height: 80 },
  { label: "8人圆桌", type: "canzhuo8", shape: "circle", icon: "canzhuo8", capacity: 8, width: 100, height: 80 },
  { label: "10人方桌", type: "canzhuo10f", shape: "rect", icon: "canzhuo10f", capacity: 10, width: 100, height: 80 },
  { label: "10人长桌", type: "canzhuo10c", shape: "rect", icon: "canzhuo10c", capacity: 10, width: 100, height: 80 },
  { label: "10人圆桌", type: "canzhuo10", shape: "circle", icon: "canzhuo10", capacity: 10, width: 100, height: 80 },
  { label: "12人方桌", type: "canzhuo12f", shape: "rect", icon: "canzhuo12f", capacity: 12, width: 100, height: 80 },
  { label: "12人长桌", type: "canzhuo12c", shape: "rect", icon: "canzhuo12c", capacity: 12, width: 100, height: 80 },
  { label: "12人圆桌", type: "canzhuo12", shape: "circle", icon: "canzhuo12", capacity: 12, width: 100, height: 80 }
];

const renderContentTemplate = (h: any, { node }: any) => {
  return h(
    "div",
    { class: "tree-item", style: { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" } },
    [
      h("span", node.data.canteen),
      h("div", {}, [
        h(resolveComponent("el-button"), {
          type: "warning",
          size: "small",
          icon: "Edit",
          onClick: async (e: Event) => {
            e.stopPropagation();
            addcanteenLayout("edit", node.data);
          }
        }),
        h(resolveComponent("el-button"), {
          type: "danger",
          size: "small",
          icon: "Delete",
          onClick: async (e: Event) => {
            e.stopPropagation();
            try {
              await useHandleData(deleteCanteenLayout, node.data.id, "删除布局");
              getCanteenLayout();
            } catch (error) {
              console.log(error);
            }
          }
        })
      ])
    ]
  );
};

const handleNodeClick = async row => {
  const res = await getCanteenLayoutDetail(row.id);
  canteenLayoutDetail.value = res.data;
  tableList.value = res.data.foodCanteenLayoutDeskList || [];
  if (tableList.value.length > 0) {
    tableList.value.forEach((item, index) => {
      item.id = index + 1;
    });
  }
};
const leftWidth = ref(260); // 初始宽度

// --- Methods ---
const canteenLayoutDrawerRef = ref<InstanceType<typeof CanteenLayoutDrawer>>();

const addcanteenLayout = (type: string, row?: CanteenLayout.ResCanteenLayout) => {
  if (row?.id) {
    row = row;
  }
  const params = {
    title: type === "add" ? "新增布局" : "编辑布局",
    isView: false,
    rowData: { ...row },
    api: type === "add" ? createCanteenLayout : updateCanteenLayout,
    getTableList: getCanteenLayout,
    canteenOptions: canteenOptions.value
  };
  canteenLayoutDrawerRef.value?.acceptParams(params);
};

const getCanteenLayout = async () => {
  const res = await getCanteenLayoutList();
  canteenLayoutList.value = res.rows;
};
getCanteenLayout();

const zoomIn = () => {
  scale.value = Math.min(scale.value + 0.1, 2.0);
};

const zoomOut = () => {
  scale.value = Math.max(scale.value - 0.1, 0.5);
};

const GRID_SIZE = 20;
const saveTableList = async () => {
  if (!canteenLayoutDetail.value) return;
  canteenLayoutDetail.value.foodCanteenLayoutDeskList = tableList.value;
  console.log("saveTableList", canteenLayoutDetail.value);
  await updateCanteenLayout(canteenLayoutDetail.value);
  getCanteenLayout();
  ElMessage.success("保存成功");
};
const clearTableList = () => {
  tableList.value = [];
};
const resetTableList = () => {
  handleNodeClick(canteenLayoutDetail.value);
};

const resetTableStatus = async () => {
  if (!canteenLayoutDetail.value?.id) return;
  await useHandleData(resetTableStatusById, canteenLayoutDetail.value.id, "一键翻台");
  resetTableList();
};

// 拖拽开始 (模板)
const onDragStart = (e: DragEvent, item: (typeof tableTemplates)[0]) => {
  if (e.dataTransfer) {
    e.dataTransfer.setData("table-template", JSON.stringify(item));
    e.dataTransfer.effectAllowed = "copy";
  }
};

// 放置 (画布)
const onDrop = (e: DragEvent) => {
  const dataStr = e.dataTransfer?.getData("table-template");
  if (!dataStr || !canvasRef.value) return;

  const template = JSON.parse(dataStr);
  const rect = canvasRef.value.getBoundingClientRect();

  // 计算相对坐标，考虑缩放
  let clientX = e.clientX;
  let clientY = e.clientY;

  // rect.left/top are the screen coordinates of the top-left of the canvas
  let x = (clientX - rect.left) / scale.value;
  let y = (clientY - rect.top) / scale.value;

  // 网格吸附
  x = Math.round(x / GRID_SIZE) * GRID_SIZE;
  y = Math.round(y / GRID_SIZE) * GRID_SIZE;

  // 边界检查
  if (x < 0) x = 0;
  if (y < 0) y = 0;
  let id = tableList.value.length > 0 ? tableList.value.map(item => item.id).sort((a, b) => b - a)[0] + 1 : 1;
  const newTable: CanteenLayout.ResTable = {
    id,
    ...template,
    x,
    y,
    status: "0",
    type: "0"
  };

  tableList.value.push(newTable);
  currentTableId.value = newTable.id;
};

// 移动桌台
const onTableMouseDown = (e: MouseEvent, index: number) => {
  currentTableId.value = tableList.value[index].id;

  const table = tableList.value[index];
  const startX = e.clientX;
  const startY = e.clientY;
  const initialLeft = table.x;
  const initialTop = table.y;

  const onMouseMove = (moveEvent: MouseEvent) => {
    const deltaX = moveEvent.clientX - startX;
    const deltaY = moveEvent.clientY - startY;

    // Apply scale to delta to get unscaled movement
    let newX = initialLeft + deltaX / scale.value;
    let newY = initialTop + deltaY / scale.value;

    // 网格吸附
    newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
    newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;

    // 边界限制 (可选)
    if (newX < 0) newX = 0;
    if (newY < 0) newY = 0;

    table.x = newX;
    table.y = newY;
  };

  const onMouseUp = () => {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
};

const deleteTable = (index: number) => {
  tableList.value.splice(index, 1);
  currentTableId.value = 0;
};

// 编辑标签
const startEditLabel = (table: CanteenLayout.ResTable) => {
  editingTableId.value = table.id;
  currentTableId.value = table.id; // Also select it
};

const finishEditLabel = () => {
  editingTableId.value = 0;
};

// 旋转桌台
const rotateTable = (index: number) => {
  const table = tableList.value[index];
  table.rotation = (table.rotation || 0) + 90;
  if (table.rotation >= 360) table.rotation = 0;

  // 交换宽高
  const temp = table.width;
  table.width = table.height;
  table.height = temp;
};

// 调整大小逻辑
const resizingTable = ref<CanteenLayout.ResTable | null>(null);
const resizeStartPos = ref({ x: 0, y: 0 });
const resizeStartSize = ref({ width: 0, height: 0 });

const onResizeStart = (e: MouseEvent, table: CanteenLayout.ResTable) => {
  e.stopPropagation();
  e.preventDefault();
  resizingTable.value = table;
  resizeStartPos.value = { x: e.clientX, y: e.clientY };
  resizeStartSize.value = { width: table.width, height: table.height };

  document.addEventListener("mousemove", onResizeMove);
  document.addEventListener("mouseup", onResizeUp);
};

const onResizeMove = (e: MouseEvent) => {
  if (!resizingTable.value) return;
  const dx = (e.clientX - resizeStartPos.value.x) / scale.value;
  const dy = (e.clientY - resizeStartPos.value.y) / scale.value;

  let newWidth = resizeStartSize.value.width + dx;
  let newHeight = resizeStartSize.value.height + dy;

  // 最小尺寸限制
  if (newWidth < 40) newWidth = 40;
  if (newHeight < 40) newHeight = 40;

  // 网格吸附 (20px)
  newWidth = Math.round(newWidth / 20) * 20;
  newHeight = Math.round(newHeight / 20) * 20;

  resizingTable.value.width = newWidth;
  resizingTable.value.height = newHeight;
};

const onResizeUp = () => {
  resizingTable.value = null;
  document.removeEventListener("mousemove", onResizeMove);
  document.removeEventListener("mouseup", onResizeUp);
};

// Splitter Logic
let draggingSplitter = false;
const onSplitterMouseDown = (e: MouseEvent) => {
  draggingSplitter = true;
  document.body.style.cursor = "col-resize";
  const startX = e.clientX;
  const startWidth = leftWidth.value;

  const onMouseMove = (moveEvent: MouseEvent) => {
    if (!draggingSplitter) return;
    const delta = moveEvent.clientX - startX;
    let newWidth = startWidth + delta;
    newWidth = Math.max(180, Math.min(newWidth, 600));
    leftWidth.value = newWidth;
  };

  const onMouseUp = () => {
    draggingSplitter = false;
    document.body.style.cursor = "";
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
};
</script>

<style lang="scss" scoped>
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
  padding: 0;
  margin-left: 0;
  overflow: hidden; /* 防止溢出 */
  background: #ffffff;
  .table-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 200px;
    height: 100%;
    padding: 10px 5px;
    margin-right: 10px;
    border-right: 1px solid #eeeeee;
    .template-title {
      margin: 10px 0;
      font-size: 14px;
      font-weight: bold;
      color: #606266;
    }
    .table-template-list {
      display: flex;
      flex-flow: row wrap;
      gap: 10px;
      width: 100%;
    }
    .table-template-item {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 45%;
      padding: 10px;
      cursor: grab;
      background: #ffffff;
      border: 1px solid #dcdfe6;
      border-radius: 8px;
      transition: all 0.3s;
      &:hover {
        box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
      }
      span {
        font-size: 12px;
        color: #606266;
      }
    }
  }
  .table-right {
    position: relative;
    flex: 1;
    height: 100%;
    overflow: auto; /* Allow scrolling if zoomed/content large */
    background: #ffffff;
    .toolbar {
      position: sticky;
      top: 0;
      right: 0;
      z-index: 100;
      float: right;
      width: 660px;
      padding: 5px;
      background: #ffffff;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
    }
    .canvas-area {
      position: relative;

      /* width/height controlled by style binding or CSS for large canvas */
    }
    .grid-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      background-image: linear-gradient(90deg, #f0f0f0 1px, transparent 1px), linear-gradient(#f0f0f0 1px, transparent 1px);
      background-size: 20px 20px; /* 20px grid */
    }
    .table-item {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #606266;
      cursor: move;
      background: #eecfca; /* Default color */
      border: 2px solid transparent;
      box-shadow: 0 4px 6px rgb(0 0 0 / 10%);
      transition:
        box-shadow 0.2s,
        border-color 0.2s;
      &.rect {
        background: #d9ecff;
        border-color: #409eff;
        border-radius: 8px;
      }
      &.circle {
        background: #e1f3d8;
        border-color: #67c23a;
        border-radius: 50%;
      }

      /* Styles for icon rendering */
      .iconfont {
        color: #606266;
        pointer-events: none;
      }
      .delete-btn {
        position: absolute;
        top: -10px;
        right: -10px;
        width: 20px;
        height: 20px;
        line-height: 18px;
        color: #ffffff;
        text-align: center;
        cursor: pointer;
        background: #f56c6c;
        border-radius: 50%;
      }
      .rotate-btn {
        position: absolute;
        top: -10px;
        left: 50%;
        width: 20px;
        height: 20px;
        margin-left: -10px;
        line-height: 18px;
        color: #ffffff;
        text-align: center;
        cursor: pointer;
        background: #409eff;
        border-radius: 50%;
      }
      .resize-handle {
        position: absolute;
        right: -5px;
        bottom: -5px;
        width: 10px;
        height: 10px;
        cursor: nwse-resize;
        background: #409eff;
        border: 1px solid #ffffff;
      }
    }
    &.rect .iconfont {
      color: #409eff;
    }
    &.circle .iconfont {
      color: #67c23a;
    }
    &.active {
      z-index: 10;
      border-color: #f56c6c;
      box-shadow: 0 0 10px rgb(245 108 108 / 50%);
    }
    .table-content {
      position: absolute;
      top: 50%;
      left: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      text-shadow: 0 0 2px white; /* Ensure text readable over icon */
      pointer-events: none; /* Make clicks pass through to parent for drag */
      transform: translate(-50%, -50%);
      span {
        font-size: 14px;
        font-weight: bold;
        color: #333333;
        pointer-events: auto; /* Allow clicking on text */
      }
      .label-text {
        cursor: text;
        &:hover {
          color: #409eff;
        }
      }
      .capacity {
        font-size: 12px;
        font-weight: normal;
        color: #606266;
      }

      /* Allow input interaction */
      :deep(.el-input) {
        pointer-events: auto;
      }
    }
    .delete-btn {
      position: absolute;
      top: -10px;
      right: -10px;
      width: 20px;
      height: 20px;
      font-size: 16px;
      line-height: 18px;
      color: #ffffff;
      text-align: center;
      cursor: pointer;
      background: #f56c6c;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgb(0 0 0 / 20%);
      &:hover {
        background: #ff4949;
      }
    }
  }
}
</style>
