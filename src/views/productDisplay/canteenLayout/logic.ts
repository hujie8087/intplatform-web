import { CanteenLayout } from "@/api/interface/productDisplay/canteenLayout";
import { ref } from "vue";

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

export { rotateTable, onResizeStart, onResizeMove, onResizeUp };
