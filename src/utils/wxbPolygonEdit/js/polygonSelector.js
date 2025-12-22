let THREE = VgoMap.THREE;

window.PolygonEdit = class PolygonEdit {
  map;
  constructor(map) {
    this.map = map;
    this.group = new THREE.Object3D();
    map.object3d.add(this.group);
    this.group.name = "PolygonEdit";
    this.enabled = false;

    /** @type {THREE.Vector3[]} 鼠标点 */
    this.points = [];

    let isClick;
    this.map.renderer.domElement.addEventListener("pointerdown", evt => {
      console.log(evt);
      isClick = true;
    });

    this.map.renderer.domElement.addEventListener("pointermove", evt => {
      if (!this.enabled) {
        return;
      }
      /** @type {THREE.Intersection} 鼠标移动时当前墙的点 */
      this.mouseRes = this.map.interact.intersectObjectsBy2D(evt, [this.map.interact.plane])[0];
      isClick = false;
      this.updateTempWall();
    });

    this.map.renderer.domElement.addEventListener("pointerup", evt => {
      if (!this.enabled) {
        return;
      }
      if (!isClick) return;
      if (evt.button !== 0) return;
      const { point } = this.mouseRes;

      if (!this.points.length) {
        /** @type {THREE.Vector3}  */
        this.points.push(point);
      } else {
        if (point.distanceTo(this.points[this.points.length - 1]) < 0.1) {
          $message("距离太短", "warning");
          return;
        }
        this.points.push(point);
      }
    });

    this.handleContextMenu();
  }

  // 右键菜单
  handleContextMenu() {
    this.map.renderer.domElement.addEventListener("contextmenu", evt => {
      console.log(evt);
      if (!this.enabled) {
        return;
      }
      if (this.points.length === 0) return false;

      if (this.points.length < 2) {
        $message("少于二个点", "warning");
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
      $message("多边形不少于3个点", "warning");
      return;
    }
    let selectedArr = [];
    (this.map.status.floor || this.map.outerFloor).polygonLayer.children.map(i => {
      if (i.data.center) {
        let isSelected = isPolygonsOverlap(i.data.points, this.points);

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

  updateTempWall() {
    if (this.points.length < 1) return;

    let { point } = this.mouseRes;

    let points = [...this.points];

    points.push(point, this.points[0]);

    this.tempPoints = points;

    this.drawTempPolygon(points);
  }

  /**
   *
   * @param {Vector3[]} points
   * @memberof Edit
   */
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
};

// 1 判断相交
// 判断两多边形线段是否相交
function isSegmentsIntersectant(segA, segB) {
  // 线线
  const abc = (segA[0][0] - segB[0][0]) * (segA[1][1] - segB[0][1]) - (segA[0][1] - segB[0][1]) * (segA[1][0] - segB[0][0]);
  const abd = (segA[0][0] - segB[1][0]) * (segA[1][1] - segB[1][1]) - (segA[0][1] - segB[1][1]) * (segA[1][0] - segB[1][0]);
  if (abc * abd >= 0) {
    return false;
  }
  const cda = (segB[0][0] - segA[0][0]) * (segB[1][1] - segA[0][1]) - (segB[0][1] - segA[0][1]) * (segB[1][0] - segA[0][0]);
  const cdb = cda + abc - abd;
  return !(cda * cdb >= 0);
}

function isPolygonsIntersectant(plyA, plyB) {
  // 面面
  for (let i = 0, il = plyA.length; i < il; i++) {
    for (let j = 0, jl = plyB.length; j < jl; j++) {
      const segA = [plyA[i], plyA[i === il - 1 ? 0 : i + 1]];
      const segB = [plyB[j], plyB[j === jl - 1 ? 0 : j + 1]];
      if (isSegmentsIntersectant(segA, segB)) {
        return true;
      }
    }
  }
  return false;
}

// 2 判断包含
// 判断点是否在另一平面图中

function pointInPolygon(point, vs) {
  // https://github.com/substack/point-in-polygon

  const x = point[0];
  const y = point[1];

  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0];
    const yi = vs[i][1];
    const xj = vs[j][0];
    const yj = vs[j][1];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) {
      inside = !inside;
    }
  }
  return inside;
}

// 判断两多变形是否存在点与区域的包含关系(A的点在B的区域内或B的点在A的区域内)
function isPointInPolygonBidirectional(plyA, plyB) {
  // 面面
  let [a, b] = [false, false];
  a = plyA.some(item => pointInPolygon(item, plyB));
  if (!a) {
    b = plyB.some(item => pointInPolygon(item, plyA));
  }
  return a || b;
}

// 3 判断多边形是否重合
function isPolygonsOverlap(plyA, plyB) {
  plyA = plyA.map(i => [i.x, i.y]);
  plyB = plyB.map(i => [i.x, i.y]);
  return isPolygonsIntersectant(plyA, plyB) || isPointInPolygonBidirectional(plyA, plyB);
}
