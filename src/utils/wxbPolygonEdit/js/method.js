const THREE = window.VgoMap.THREE;
const { Vector3 } = THREE;
// const { MeshBasicMaterial, MeshLambertMaterial, RepeatWrapping, Mesh, Color, Shape, ExtrudeGeometry } = THREE
// 1 判断相交
// 判断两多边形线段是否相交
export function isSegmentsIntersectant(segA, segB) {
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

export function isPolygonsIntersectant(plyA, plyB) {
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

export function pointInPolygon(point, vs) {
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

/**
 * 创建材质图
 * @param size 尺寸为2的n次方
 * @param color 颜色
 * @returns {*}
 */
export function generateTexture(size = 64, color = "#ffffff") {
  let canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  let ctx = canvas.getContext("2d");
  let linearGradient = ctx.createLinearGradient(0, 0, 0, size);
  linearGradient.addColorStop(0.2, hexToRgba(color, 0.0));
  linearGradient.addColorStop(0.8, hexToRgba(color, 0.5));
  linearGradient.addColorStop(1.0, hexToRgba(color, 1.0));
  ctx.fillStyle = linearGradient;
  ctx.fillRect(0, 0, size, size);

  let texture = new THREE.Texture(canvas);
  texture.needsUpdate = true; // 必须
  return texture;
}

/**
 * 将十六进制的颜色值转成rgba
 * @param {String} hex
 * @param {number} opacity
 * @returns {string}
 */
function hexToRgba(hex, opacity = 1) {
  return (
    "rgba(" +
    parseInt("0x" + hex.slice(1, 3)) +
    "," +
    parseInt("0x" + hex.slice(3, 5)) +
    "," +
    parseInt("0x" + hex.slice(5, 7)) +
    "," +
    opacity +
    ")"
  );
}

export function getPolygonAreaCenter(points) {
  let sum_x = 0;
  let sum_y = 0;
  let sum_area = 0;
  let p1 = points[1];
  for (let i = 2; i < points.length; i++) {
    let p2 = points[i];
    let area = Area(points[0], p1, p2);
    sum_area += area;
    sum_x += (points[0].x + p1.x + p2.x) * area;
    sum_y += (points[0].y + p1.y + p2.y) * area;
    p1 = p2;
  }
  let xx = sum_x / sum_area / 3;
  let yy = sum_y / sum_area / 3;
  return new THREE.Vector3(xx, yy, 0);
}

function Area(p0, p1, p2) {
  let area = 0.0;
  area = p0.x * p1.y + p1.x * p2.y + p2.x * p0.y - p1.x * p0.y - p2.x * p1.y - p0.x * p2.y;
  return area / 2;
}

/**
 * 吸附
 *
 * @export pointMagnet
 * @param {Vector3} p1 组成线的点1
 * @param {Vector3} p2 组成线的点2
 * @param {Vector3} pm 要媳妇的点
 * @param {Number} magnetDis 吸附距离
 */
export function pointMagnet(p1, p2, pm, magnetDis = 0.19) {
  // 垂直于p12的单位向量
  let vp12 = getVertical(p1, p2);
  // 在p1处垂直的点
  let p1v = new Vector3().copy(p1).sub(vp12);
  // 在p2处垂直的点
  let p2v = new Vector3().copy(p2).sub(vp12);

  // let line1 = new Line3(p1, p2)
  // let line2 = new Line3(p1, p1v)
  // let line3 = new Line3(p2, p2v)
  let lp1 = closestPointToPoint(p1, p2, pm, false);
  let d1 = lp1.distanceTo(pm);

  let lp2 = closestPointToPoint(p1, p1v, pm, false);
  let d2 = lp2.distanceTo(pm);

  let lp3 = closestPointToPoint(p2, p2v, pm, false);
  let d3 = lp3.distanceTo(pm);

  if (d1 < magnetDis && d2 < magnetDis) {
    return {
      point: p1,
      lines: [
        [p1, p2],
        [p1, p1v]
      ]
    };
  }

  if (d1 < magnetDis && d3 < magnetDis) {
    return {
      point: p2,
      lines: [
        [p1, p2],
        [p2, p2v]
      ]
    };
  }

  if (d1 < magnetDis) {
    return { point: lp1, lines: [[p1, p2]] };
  }

  if (d2 < magnetDis) {
    return { point: lp2, lines: [[p1, p1v]] };
  }

  if (d3 < magnetDis) {
    return { point: lp3, lines: [[p2, p2v]] };
  }
}

/**
 * 获取垂直于p1,p2的标量
 *
 * @export getVertical
 * @param {Vector3} p1
 * @param {Vector3} p2
 * @return {Vector3} Vector3
 */
export function getVertical(p1, p2) {
  let dir = new Vector3().copy(p1).sub(p2);
  return dir.crossVectors(new Vector3(0, 0, 1), dir).normalize();
}

/**
 *
 * 获取四个点形成的角度(弧度)
 * @export getAngle
 * @param {Vector3} p1
 * @param {Vector3} p2
 * @param {Vector3} p3
 * @param {Vector3} p4
 * @return {Number} rad
 */
export function getAngle(p1, p2, p3, p4) {
  return p1.clone().sub(p2).angleTo(p3.clone().sub(p4));
}

/**
 * 返回线段上到point最近的点。如果参数 clampToLine 为true。返回值将会在线段之间。
 *  https://threejs.org/docs/index.html?q=line#api/zh/math/Line3.closestPointToPoint
 * @export
 * @param {THREE.Vector2 | THREE.Vector3} p1
 * @param {THREE.Vector2 | THREE.Vector3} p2
 * @param {THREE.Vector2 | THREE.Vector3} point
 * @param {boolean} [clampToLine=true]
 * @return {THREE.Vector2 | THREE.Vector3} THREE.Vector2 | THREE.Vector3
 */
export function closestPointToPoint(p1, p2, point, clampToLine = true) {
  if (p1.isVector2) {
    let v1 = new THREE.Vector3(p1.x, p1.y, 0);
    let v2 = new THREE.Vector3(p2.x, p2.y, 0);
    let v3 = new THREE.Vector3(point.x, point.y, 0);
    let v = new THREE.Line3(v1, v2).closestPointToPoint(v3, clampToLine, new THREE.Vector3());
    return new THREE.Vector2(v.x, v.y);
  }
  return new THREE.Line3(p1, p2).closestPointToPoint(point, clampToLine, new THREE.Vector3());
}

let loader = new window.VgoMap.THREE.TextureLoader();

export function handleResize(renderer, camera) {
  const canvas = renderer.domElement;
  // look up the size the canvas is being displayed
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  // adjust displayBuffer size to match
  if (canvas.width !== width || canvas.height !== height) {
    // you must pass false here or three.js sadly fights the browser
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
}

export const loadTexture = (...args) => loader.load(...args);

export function pointIsInPoly(p, polygon) {
  let isInside = false;
  let minX = polygon[0].x;
  let maxX = polygon[0].x;
  let minY = polygon[0].y;
  let maxY = polygon[0].y;
  for (let n = 1; n < polygon.length; n++) {
    let q = polygon[n];
    minX = Math.min(q.x, minX);
    maxX = Math.max(q.x, maxX);
    minY = Math.min(q.y, minY);
    maxY = Math.max(q.y, maxY);
  }

  if (p.x < minX || p.x > maxX || p.y < minY || p.y > maxY) {
    return false;
  }

  let i = 0;
  let j = polygon.length - 1;
  for (i, j; i < polygon.length; j = i++) {
    if (
      polygon[i].y > p.y !== polygon[j].y > p.y &&
      p.x < ((polygon[j].x - polygon[i].x) * (p.y - polygon[i].y)) / (polygon[j].y - polygon[i].y) + polygon[i].x
    ) {
      isInside = !isInside;
    }
  }

  return isInside;
}

// 判断两多变形是否存在点与区域的包含关系(A的点在B的区域内或B的点在A的区域内)
export function isPointInPolygonBidirectional(plyA, plyB) {
  // 面面
  let [a, b] = [false, false];
  a = plyA.some(item => pointInPolygon(item, plyB));
  if (!a) {
    b = plyB.some(item => pointInPolygon(item, plyA));
  }
  return a || b;
}

// 3 判断多边形是否重合
export function isPolygonsOverlap(plyA, plyB) {
  plyA = plyA.map(i => [i.x, i.y]);
  plyB = plyB.map(i => [i.x, i.y]);
  return isPolygonsIntersectant(plyA, plyB) || isPointInPolygonBidirectional(plyA, plyB);
}

export function createShortId() {
  return (Math.random() + new Date().getTime()).toString(32).slice(0, 8);
}
