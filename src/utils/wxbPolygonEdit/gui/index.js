export class ContextMenu {
  constructor() {
    // 创建菜单元素
    this.menu = document.createElement("div");
    this.menu.className = "mapMenu box-shadow";

    // 添加到文档
    document.body.appendChild(this.menu);

    // 状态变量
    this.isDown = false;
    this.isMove = false;
    this.locked = false;

    // 绑定全局事件
    this.bindEvents();
  }

  bindEvents() {
    // 点击关闭菜单
    document.addEventListener("click", () => {
      if (!this.locked) {
        this.close();
      }
    });

    // 鼠标按下
    document.addEventListener("pointerdown", e => {
      this.isDown = true;
      this.lastEvent = e;
    });

    // 鼠标移动
    document.addEventListener("pointermove", e => {
      this.lastEvent = e;
      if (this.isDown) {
        this.isMove = true;
        this.close();
        this.isDown = this.isMove = false;
      }
    });

    // 鼠标释放
    document.addEventListener("pointerup", e => {
      this.lastEvent = e;
      if (this.isDown && this.isMove) {
        this.close();
      }
      this.isDown = this.isMove = false;
    });
  }

  open(items, x, y) {
    if (this.locked) return;

    // 清空现有菜单项
    this.menu.innerHTML = "";

    // 添加新菜单项
    Object.entries(items).forEach(([label, action]) => {
      const item = document.createElement("div");
      item.className = "mapMenuItem";
      item.textContent = label;
      item.addEventListener("click", () => {
        this.locked = false;
        action();
        this.close();
      });
      this.menu.appendChild(item);
    });

    // 设置菜单位置
    this.menu.style.left = `${x}px`;
    this.menu.style.top = `${y}px`;

    // 显示菜单（使用动画）
    this.menu.classList.add("visible");
  }

  lock(items) {
    this.locked = true;
    this.open(items, this.lastEvent?.clientX, this.lastEvent?.clientY);
  }

  close() {
    this.menu.classList.remove("visible");
    this.locked = false;
  }
}
