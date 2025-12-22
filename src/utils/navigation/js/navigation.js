const { THREE, TWEEN } = window.VgoMap;
const { MathUtils, Vector3, Vector2 } = THREE;
const { RAD2DEG } = MathUtils;

const arrowImg = new URL("../img/arrow.png", import.meta.url).href;
const startImg = new URL("../img/start.png", import.meta.url).href;
const endImg = new URL("../img/end.png", import.meta.url).href;
const wayImg = new URL("../img/way.png", import.meta.url).href;

function createArrowMarkDom() {
  let markerContent = `
<div class='custom-content-marker wxb-custom-marker'>
  <div class="custom-marker-icon arrow-marker">
    <img src="${arrowImg}" />
  </div>
</div>
  `;
  let dom = document.createElement("div");
  dom.innerHTML = markerContent;
  return dom;
}

const arrowDom = createArrowMarkDom();

export class Navigation {
  map;
  startMark = null;
  endMark = null;
  arrowMark = null;
  pathInstanceArr = [];
  oldAngle = 0;
  status = {
    isNaviDemo: false,
    speed: 1000,
    polygonDataAll: [],
    activeBuild: null,
    activeFloor: null,
    naviInfo: {
      totalDistance: 0,
      remainingDistance: 0,
      progressPercentage: 0
    }
  };
  lineDataOrigin = [];
  path = [];
  animate = null;
  curPath = null;

  group;
  constructor(map) {
    this.map = map;

    this.lineDataOrigin = [];
    this.path = [];
    this.animate = null;
    this.status.isNaviDemo = false;
    this.status.speed = 50; // 轨迹速度，值越小越快
    this.curPath = null;
    this.oldAngle = 0;
    // 初始化状态
    this.initMapStatusData();

    this.group = new THREE.Object3D();
    this.group.name = "navigationGroup";
    this.map.object3d.add(this.group);

    this.map.amap.on("viewchange", () => {
      if (this.arrowMark) {
        let mapAngle = this.map.amap.getRotation();
        mapAngle = parseFloat(mapAngle.toFixed(1));
        if (mapAngle === this.oldAngle) return false;
        let aoa = mapAngle - this.oldAngle;

        let monitorIocnDom = this.arrowMark.element.querySelector(".custom-content-marker");
        let rotateZ = monitorIocnDom?.getAttribute("data-rotatez") || 0;
        let direction = parseFloat(rotateZ) + aoa;
        direction = parseFloat(direction.toFixed(2));

        monitorIocnDom.style.transform = `rotateZ(${direction}deg)`;
        monitorIocnDom.setAttribute("data-rotatez", direction);
        this.oldAngle = mapAngle;
      }
    });

    const buildChangeHandler = () => {
      this.status.activeBuild = this.map.status?.build?.data || null;
      this.status.activeFloor = this.map.status?.build?.curentFloor.data || null;
    };
    const floorChangeHandler = () => {
      this.status.activeFloor = this.map.status?.build?.curentFloor.data || this.map.status?.floor?.data || null;

      if (!this.curPath || !this.arrowMark) return;
      if (this.curPath?.buidInfo?.floorId === "1" || this.curPath?.floorId === this.status.activeFloor?.id) {
        this.arrowMark.visible = true;
      } else {
        this.arrowMark.visible = false;
      }
    };

    // 初始化建筑/楼层默认值
    buildChangeHandler();
    floorChangeHandler();
    // 监听建筑切换事件
    this.map.on("buildChange", buildChangeHandler);
    this.map.on("floorChange", floorChangeHandler);
  }

  drawTrajectoryLine(lineData, type = "end") {
    if (!lineData?.length) return false;

    // this.destroyTrajectoryLine()

    this.lineDataOrigin = lineData;
    let copyLineData = lineData.map(i => {
      let buidInfo = this.getByFloorIdBuidInfoandfloorInfo(i.floorId || "1");
      let point = this.map.lngLatToCoord(i.lng, i.lat);
      return {
        ...i,
        buidInfo,
        point
      };
    });

    let lineSection = this.createLineSection(copyLineData);
    lineSection.forEach(sectionItem => {
      sectionItem = sectionItem.map(item => {
        let lineItem = { ...item };
        this.path.push({ ...lineItem.point, ...lineItem });

        return lineItem;
      });

      if (sectionItem?.length >= 1) {
        let pathInstance = this.map.addCustomNaviLine(
          sectionItem[0].buidInfo.floorId,
          sectionItem.map(i => i.point)
        );
        this.pathInstanceArr.push(pathInstance);
      }
    });

    this.status.naviInfo.totalDistance = 0;
    for (let i = 0; i < this.path.length; i++) {
      let cur = this.path[i];
      let next = this.path[i + 1];
      if (cur && next) {
        cur.nextDistance = new Vector2().copy(cur.point).distanceTo(next.point);
      } else {
        cur.nextDistance = 0;
      }

      this.status.naviInfo.totalDistance += cur.nextDistance;
    }

    this.map.fitPoints(
      copyLineData.map(i => i.point),
      50
    );
    this.map.amap.setPitch(0);
    this.createStartAndEndMarker(this.path, type);
  }

  // 创建起点和终点标记 type： end / way
  createStartAndEndMarker(path, type = "end") {
    let startPoint = path[0];
    let endPoint = path[path.length - 1];

    this.startMark = this.map.addMarker(startPoint.buidInfo.floorId, {
      isCollision: false, // 是否有碰撞体积
      position: startPoint.point,
      scale: 0.2, // 缩放
      src: startImg,
      renderOrder: 9999
    });

    this.endMark = this.map.addMarker(endPoint.buidInfo.floorId, {
      isCollision: false, // 是否有碰撞体积
      position: endPoint.point,
      scale: 0.2, // 缩放
      src: type === "end" ? endImg : wayImg,
      renderOrder: type === "end" ? 9999 : 10000
    });

    if (startPoint.buidInfo?.buildId !== "1") {
      this.map.showIndoor(startPoint.buidInfo?.buildId, startPoint.buidInfo?.floorId);
    } else {
      this.map.amap.setZoom(17);
    }
  }

  createArrowMark(center) {
    if (this.arrowMark) {
      this.arrowMark.position.copy(center);
    } else {
      this.arrowMark = this.map.addDomMarker("1", arrowDom);
      this.arrowMark.position.copy(center);
      this.arrowMark.center.y = 0.5;
    }
    if (this.path.length >= 1) {
      let cur = this.path[0];
      let pos = this.path[1];
      let angle = this.map.getNaviRotation(cur, pos);
      let angleDEG = angle * RAD2DEG;
      let monitorIocnDom = this.arrowMark.element.querySelector(".custom-content-marker");
      let rotateZ = -(angleDEG - this.map.amap.getRotation());
      rotateZ = parseFloat(rotateZ.toFixed(2));
      monitorIocnDom.style.transform = `rotateZ(${rotateZ}deg)`;
      monitorIocnDom.setAttribute("data-rotatez", rotateZ);
    }
  }

  createLineSection(lineData) {
    let lineSection = [];
    let idx = 0;
    for (let i = 0; i < lineData.length; i++) {
      let cur = lineData[i];
      let next = lineData[i + 1];

      if (next && cur.buidInfo.floorId !== next?.buidInfo.floorId) {
        let arr = lineData.slice(idx, i + 1);

        idx = i + 1;
        lineSection.push(arr);
      }
    }

    let arr = lineData.slice(idx, lineData.length);
    lineSection.push(arr);
    return lineSection;
  }

  startNavigation(startIdx = 0) {
    if (this.path?.length <= 1 || this.status.isNaviDemo) return false;
    // 获取初始位置
    let startPos = new Vector3(this.path[startIdx].x, this.path[startIdx].y, 0);
    let center = this.map.coordsToLngLat(startPos);
    this.map.amap.setCenter(center);
    this.createArrowMark(startPos);

    // 创建动画函数
    let go = (idx, dir) => {
      let cur = this.path[idx];
      let pos = this.path[idx + dir];
      if (!pos) {
        this.oldAngle = this.map.amap.getRotation() % 360;
        setTimeout(() => {
          this.status.isNaviDemo = false;
        }, 500);
        return false;
      }

      let time = startPos.distanceTo(pos) / 5;
      let angle = this.map.getNaviRotation(cur, pos);
      let angleDEG = angle * RAD2DEG;

      this.animate = new TWEEN.Tween(startPos)
        .to(pos, time * this.status.speed)
        .onUpdate(() => {
          this.status.isNaviDemo = true;
          if (this.arrowMark) {
            let curPath = (this.curPath = this.path[idx]);

            let nextDis = new Vector2().copy(startPos).distanceTo(pos);
            let distanceCovered = this.path.slice(idx + 1).reduce((pre, item) => pre + item.nextDistance, 0);
            let remainingDistance = distanceCovered + nextDis;
            this.status.naviInfo.remainingDistance = remainingDistance;
            this.status.naviInfo.progressPercentage =
              ((this.status.naviInfo.totalDistance - remainingDistance) / this.status.naviInfo.totalDistance) * 100;

            if (this.map.status?.build && curPath?.buidInfo.floorId !== "1") {
              if (curPath.buidInfo.buildId !== this.status.activeBuild?.id) {
                this.map.showIndoor(curPath.buidInfo.buildId, curPath.buidInfo.floorId);
              } else {
                this.map.status.build.switchFloor(curPath.buidInfo.floorId);
              }
            }

            if (curPath.buidInfo.floorId === "1" || curPath.buidInfo.floorId === this.status.activeFloor?.id) {
              this.arrowMark.visible = true;
            } else {
              this.arrowMark.visible = false;
            }

            this.arrowMark.position.copy(startPos);
            let monitorIocnDom = this.arrowMark.element.querySelector(".custom-content-marker");
            let rotateZ = -(angleDEG - this.map.amap.getRotation());
            rotateZ = parseFloat(rotateZ.toFixed(2));
            monitorIocnDom.style.transform = `rotateZ(${rotateZ}deg)`;
            monitorIocnDom.setAttribute("data-rotatez", rotateZ);
          }
        })
        .onComplete(() => {
          go(idx + dir, dir);
        })
        .start();
    };

    // 开启动画函数
    go(startIdx, 1);
  }

  pause() {
    this.status.isNaviDemoPause = true;
    this.animate && this.animate.pause();
  }

  resume() {
    this.status.isNaviDemoPause = false;
    this.animate && this.animate.resume();
  }

  exit() {
    this.status.isNaviDemo = false;
    this.status.isNaviDemoPause = false;
    this.status.naviInfo = {
      totalDistance: 0,
      remainingDistance: 0,
      progressPercentage: 0
    };
    this.animate && this.animate.stop();
    if (this.arrowMark) {
      this.arrowMark.dispose();
      this.arrowMark = null;
    }
    this.curPath = null;
  }

  destroyTrajectoryLine() {
    this.exit();
    if (this.pathInstanceArr.length) {
      this.pathInstanceArr.forEach(instanceItem => {
        instanceItem && instanceItem.dispose();
      });
    }
    this.pathInstanceArr = [];

    this.removeStartAndEndMarker();
  }

  removeStartAndEndMarker() {
    if (this.startMark) {
      this.startMark.dispose();
    }
    if (this.endMark) {
      this.endMark.dispose();
    }
  }

  getByFloorIdBuidInfoandfloorInfo(floorId) {
    let mapData = this.map.mapData;
    let info = {
      buildName: "建筑外",
      buildId: "1",
      floorId: floorId || "1",
      floorName: "室外",
      floorDescribe: ""
    };

    if (floorId === mapData.id) {
      info.buildId = mapData.id;
      info.buildName = "建筑外";
      info.floorName = "室外";
    } else {
      let floorItem = this.status.floorDataMap[floorId];
      if (!floorItem) {
        info.floorId = "1";
        info.floorName = "未知建筑";
      } else {
        info.floorName = floorItem.name;
        info.floorDescribe = floorItem.describe || "";
        if (floorItem.parent?.parent?.id) {
          info.buildId = floorItem.parent.parent.id;
          info.buildName = floorItem.parent.parent.name;
        }
      }
    }

    return info;
  }

  initMapStatusData() {
    let mapData = this.map.mapData;
    let floorDataAll = [];
    let polygonDataAll = [];
    let floorDataMap = {};

    if (mapData.polygonData?.length) {
      polygonDataAll = [...mapData.polygonData];
    }

    mapData.build?.forEach(buildItem => {
      if (buildItem.floor?.length) {
        floorDataAll.push(...buildItem.floor);
      }

      buildItem.floor.forEach(fItem => {
        polygonDataAll.push(...fItem.polygonData);
      });
    });

    if (floorDataAll) {
      floorDataAll.forEach(floorItem => {
        floorDataMap[floorItem.id] = floorItem;
      });
    }

    this.status.polygonDataAll = polygonDataAll;
    this.status.floorDataMap = floorDataMap;
  }
}
