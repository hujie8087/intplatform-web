import "../gui/index.css";
import { ContextMenu } from "../gui/index.js";
import { CircleEdit } from "./circle.js";
import { PolygonEdit } from "./polygonEdit.js";
import { PolygonShow } from "./polygonShow.js";

export class WxbPolygonEdit {
  map;
  status;
  polygonShow;
  polygonEdit;
  circleEdit;
  gui;

  constructor(map) {
    this.map = map;
    // 初始化状态
    this.status = {
      gui: null,
      editType: "", // 编辑状态
      activeBuild: null,
      activeFloor: null
    };

    this.gui = new ContextMenu();
    const buildChangeHandler = () => {
      this.status.activeBuild = this.map.status?.build?.data || null;
      this.status.activeFloor = this.map.status?.build?.curentFloor.data || null;
    };
    const floorChangeHandler = () => {
      this.status.activeFloor = this.map.status?.build?.curentFloor.data || this.map.status?.floor?.data || null;
    };

    // 初始化建筑/楼层默认值
    buildChangeHandler();
    floorChangeHandler();
    // 监听建筑切换事件
    this.map.on("buildChange", buildChangeHandler);
    this.map.on("floorChange", floorChangeHandler);

    this.initPolygonShow();
    this.initPolygonEdit();
    this.initCircleEdit();

    // 创建 Proxy 监听 status 对象
    this.status = new Proxy(this.status, {
      set: (target, property, value) => {
        const oldValue = target[property];
        target[property] = value;

        if (property === "editType" && oldValue !== value) {
          console.log(value, "value");
          this.polygonEdit.enabled = value === "polygonEdit";
          this.circleEdit.enabled = value === "circleEdit";
        }

        return true; // 表示设置成功
      }
    });
  }

  initPolygonShow() {
    // 初始化多边形显示
    this.polygonShow = new PolygonShow(this.map, this);
    // 监听多边形保存事件
    this.polygonShow.onSave(newPolygonInfo => {
      console.log(newPolygonInfo, "多边形保存回调");
      this.polygonShow.removeItem(newPolygonInfo);
      let createPolygonObj = {
        ...newPolygonInfo,
        color: newPolygonInfo.color,
        points: newPolygonInfo.points,
        height: newPolygonInfo.height,
        type: "polygonShow",
        center: newPolygonInfo.center,
        floorId: this.status.activeFloor?.id || this.status.activeBuild?.id,
        opacity: 0.5,
        name: newPolygonInfo.name
      };
      this.polygonShow.createPolygon(createPolygonObj);
    });
  }

  initPolygonEdit() {
    // 初始化多边形编辑
    this.polygonEdit = new PolygonEdit(this.map, this);
    // 监听绘制完成事件
    this.polygonEdit.onDraw(polygonInfo => {
      console.log(polygonInfo, "多边形编辑回调");
      const { points, center } = polygonInfo;
      let createPolygonObj = {
        color: "#409EFF",
        points,
        height: 0,
        type: "polygonShow",
        center,
        floorId: this.status.activeFloor?.id || this.status.activeBuild?.id,
        opacity: 0.4,
        name: "新建多边形123"
      };
      // 创建
      this.polygonShow.createPolygon(createPolygonObj);
    });
  }

  initCircleEdit() {
    // 初始化圆形编辑
    this.circleEdit = new CircleEdit(this.map, this);
    // 监听绘制完成事件
    this.circleEdit.onDraw(polygonInfo => {
      console.log(polygonInfo, "polygonInfo");
      const { points, center } = polygonInfo;
      let createPolygonObj = {
        color: "#409EFF",
        points,
        height: 10,
        type: "polygonShow",
        center,
        floorId: this.status.activeFloor?.id || this.status.activeBuild?.id,
        opacity: 0.5,
        name: "新建圆形"
      };

      // 创建
      this.polygonShow.createPolygon(createPolygonObj);
    });
  }
}
