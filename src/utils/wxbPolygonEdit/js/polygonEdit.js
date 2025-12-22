import { getPolygonAreaCenter, isPolygonsOverlap } from "./method.js";
let THREE = window.VgoMap.THREE;

export class PolygonEdit {
  map;

  enabled;
  fenceList;
  constructor(map, Edit) {
    this.map = map;
    const { status } = Edit;
    this.status = status;
    this.group = new THREE.Object3D();
    this.enabled = false;
    this.fenceList = [];
    map.object3d.add(this.group);
    this.group.name = "PolygonEdit";

    this.points = [];

    let isClick;
    this.map.el.addEventListener("pointerdown", evt => {
      console.log(evt);
      isClick = true;
    });

    this.map.el.addEventListener("pointermove", evt => {
      if (!this.enabled) {
        return;
      }
      this.mouseRes = this.map.interact.intersectObjectsBy2D(evt, [this.map.interact.plane])[0];
      isClick = false;
      this.updateTempWall();
    });

    this.map.el.addEventListener("pointerup", evt => {
      if (!this.enabled) {
        return;
      }
      if (!isClick) return;
      if (evt.button !== 0) return;
      const { point } = this.mouseRes;

      if (!this.points.length) {
        this.points.push(point);
      } else {
        if (point.distanceTo(this.points[this.points.length - 1]) < 0.1) {
          return;
        }
        this.points.push(point);
      }
    });

    this.handleContextMenu();
  }

  // 右键菜单
  handleContextMenu() {
    this.map.el.addEventListener("contextmenu", evt => {
      console.log(evt);
      if (!this.enabled) {
        return;
      }
      if (this.points.length === 0) return false;

      if (this.points.length < 2) {
        alert("少于二个点");
        this.cancel();
        return false;
      }
      this.save();
    });
  }

  cancel = () => {
    this.points = [];
    this.drawTempPolygon();
  };

  save = () => {
    if (this.points < 3) {
      alert("少于二个点");
      return;
    }

    if (this.onDrawCb) {
      this.onDrawCb({
        points: this.tempPoints,
        center: getPolygonAreaCenter(this.tempPoints)
      });
      this.cancel();

      return false;
    }
    let selectedArr = [];
    let polygonData = this.map.status.floor?.data.polygonData || this.map.mapData.polygonData;
    polygonData.forEach(i => {
      if (i.center) {
        let isSelected = isPolygonsOverlap(i.points, this.points);

        // console.log('🚀 ~ isSelected:', isSelected)
        if (isSelected) {
          selectedArr.push(i);
        }
      }
    });
    this.onSelectedCb && this.onSelectedCb(selectedArr);

    this.cancel();
  };

  onSelect(cb) {
    this.onSelectedCb = cb;
  }

  onDraw(cb) {
    this.onDrawCb = cb;
  }

  updateTempWall() {
    if (this.points.length < 1) return;

    let { point } = this.mouseRes;

    let points = [...this.points];

    points.push(point, this.points[0]);

    this.tempPoints = points;

    this.drawTempPolygon(points);
  }

  drawTempPolygon(points) {
    this.tempPolygon && this.tempPolygon.dispose();
    if (!points || !points.length) return;

    this.tempPolygon = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({
        color: "blue",
        depthTest: false,
        transparent: true
      })
    );
    this.tempPolygon.renderOrder = 999999;
    this.group.add(this.tempPolygon);
    this.tempPolygon.geometry.setFromPoints(points);
  }
}
