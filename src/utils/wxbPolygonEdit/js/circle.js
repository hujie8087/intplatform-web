import { getPolygonAreaCenter } from "./method.js";
const { THREE } = window.VgoMap;
const { MathUtils, Object3D, Vector2, Vector3 } = THREE;

export class CircleEdit {
  map;
  group;
  p1;
  tempPoints;
  constructor(map, Edit) {
    const { status, gui } = Edit;
    this.status = status;
    this.gui = gui;
    this.map = map;

    this.enabled = false;
    this.group = new Object3D();
    this.group.name = "CircleEdit";
    map.object3d.add(this.group);

    let isClick;
    this.map.el.addEventListener("pointerdown", evt => {
      console.log(evt);
      isClick = true;
    });

    this.map.el.addEventListener("pointermove", evt => {
      if (!this.enabled) return;
      let mouseRes = this.map.interact.intersectObjectsBy2D(evt, [this.map.interact.plane])[0];
      isClick = false;
      this.updateTempWall(mouseRes);
    });

    this.map.el.addEventListener("pointerup", evt => {
      if (!this.enabled) return;
      if (!isClick) return;
      if (evt.button !== 0) return;
      let mouseRes = this.map.interact.intersectObjectsBy2D(evt, [this.map.interact.plane])[0];
      const { point } = mouseRes;

      if (!this.p1) {
        this.p1 = point;
      } else {
        if (point.distanceTo(this.p1) < 0.1) {
          alert("距离太短!");
          return;
        }
        this.createCircle();
      }
    });

    this.handleContextMenu();
  }

  onDraw(cb) {
    this.onDrawCb = cb;
  }

  // 右键菜单
  handleContextMenu() {
    this.map.el.addEventListener("rightclick", () => {
      if (!this.enabled) return;
      if (!this.p1) return;
      this.gui.open({
        取消: this.cancel
      });
    });
  }

  cancel = () => {
    this.p1 = null;
    this.drawTempPolygon();
  };

  // 绘制线框
  updateTempWall(mouseRes) {
    if (!this.p1) return;

    let { point } = mouseRes;

    let points = [];

    let dis = this.p1.distanceTo(point);
    let steps = Math.round((2 * Math.PI * dis) / 0.3);
    steps = MathUtils.clamp(steps, 20, 30);

    let stepAngle = (360 / steps) * MathUtils.DEG2RAD;

    let center = new Vector2(0, 0);
    let startV = new Vector2(1, 0).multiplyScalar(dis);

    for (let i = 0; i < steps; i++) {
      let dir = startV.clone().rotateAround(center, i * stepAngle);
      let p = this.p1.clone().add(new Vector3(dir.x, dir.y, 0));
      points.push(p);
    }

    this.tempPoints = points;

    this.drawTempPolygon([...points, points[0], this.p1]);
  }

  // 通过中心点和半径创建圆
  createCircleByCenterAndRadius(position, radius) {
    let points = [];
    let p1 = new Vector3(position.x, position.y, 0);
    let steps = Math.round((2 * Math.PI * radius) / 0.3);
    steps = MathUtils.clamp(steps, 20, 30);

    let stepAngle = (360 / steps) * MathUtils.DEG2RAD;

    let center = new Vector2(0, 0);
    let startV = new Vector2(1, 0).multiplyScalar(radius);

    for (let i = 0; i < steps; i++) {
      let dir = startV.clone().rotateAround(center, i * stepAngle);
      let p = p1.clone().add(new Vector3(dir.x, dir.y, 0));
      points.push(p);
    }

    this.onDrawCb({
      points: points,
      center: p1
    });
  }

  // 创建模型
  createCircle() {
    this.onDrawCb({
      points: this.tempPoints,
      center: getPolygonAreaCenter(this.tempPoints)
    });
    this.cancel();
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
