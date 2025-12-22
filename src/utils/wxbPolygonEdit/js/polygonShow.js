import { closestPointToPoint, createShortId, generateTexture, getPolygonAreaCenter, loadTexture, pointMagnet } from "./method.js";
import spotIcon from "../img/spot.png";

const { THREE, FatLine } = window.VgoMap;
const { MeshBasicMaterial, RepeatWrapping, Mesh, Shape, ExtrudeGeometry, SpriteMaterial, Sprite, MeshStandardMaterial, Color } =
  THREE;

let map = loadTexture(spotIcon);
let defaultMat = new SpriteMaterial({
  color: "blue",
  sizeAttenuation: false,
  depthTest: false,
  map
});
let newMat = new SpriteMaterial({
  sizeAttenuation: false,
  depthTest: false,
  color: "#9c0",
  map
});

let spriteBase = new Sprite(defaultMat);
spriteBase.scale.multiplyScalar(0.015);

let newSprite = spriteBase.clone();
newSprite.material = newMat;
newSprite.visible = false;

let polygonDataOrigin = null;
export class PolygonShow {
  map;
  enabled;
  markerList;
  tex;
  polygonEdit;
  Edit;
  constructor(map, Edit) {
    this.saveFun = null;
    this.clickFun = null;
    const { status, gui } = Edit;
    this.Edit = Edit;
    this.status = status;
    this.gui = gui;
    this.map = map;
    this.showGroup = new THREE.Object3D();
    this.markerList = [];
    this.enabled = true;

    map.object3d.add(this.showGroup);
    this.showGroup.name = "PolygonShow";

    this.controlsGroup = new THREE.Object3D();
    this.controlsGroup.name = "ControlsGroup";
    this.showGroup.add(this.controlsGroup);

    const buildOrFloorChangeFunction = () => {
      this.updateEditMeshItem();
      this.updatePolygon();
      this.cancel();
    };

    map.on("floorChange", buildOrFloorChangeFunction);
    this.updateControlSpriteScale = this._updateControlSpriteScale.bind(this);
    window.addEventListener("resize", this.updateControlSpriteScale);
    document.addEventListener("visibilitychange", this.updateControlSpriteScale);
    this.removeEvent = this.initEvent();
  }

  initEvent() {
    const pointermoveFun = evt => {
      let res = this.map.interact.intersectObjectsBy2D(evt, [this.map.interact.plane])[0];
      this.movePointFn && this.movePointFn(res);
    };

    const pointerupFun = () => {
      this.map.vmap.setStatus({
        dragEnable: true, // 地图是否可通过鼠标拖拽平移，默认为true
        keyboardEnable: false, // 地图是否可通过键盘控制，默认为true
        doubleClickZoom: false // 地图是否可通过双击鼠标放大地图，默认为true
      });
      if (!this.polygonInfoCopy) return;

      this.movePointFn = null;
    };

    const contextmenuFun = e => {
      if (!this.polygonInfoCopy) return;
      if (this._rightclickSprite) return;
      this.gui.open(
        {
          保存: () => {
            this.polygonInfoCopy.center = getPolygonAreaCenter(this.polygonInfoCopy.points);

            this.saveFun && this.saveFun(this.polygonInfoCopy);
            this.clickFun && this.clickFun(this.polygonInfoCopy, e);
            this.cancel();
          },
          // 删除: () => {
          //   this.removeItem(this.polygonInfoCopy)
          //   this.cancel()
          // },
          取消: () => {
            this.updateEditMeshItem();
            this.cancel();
          }
        },
        e.clientX,
        e.clientY
      );
    };

    window.document.addEventListener("pointermove", pointermoveFun);

    window.document.addEventListener("pointerup", pointerupFun);

    this.map.el.addEventListener("contextmenu", contextmenuFun);

    return function removeEventListener() {
      window.document.removeEventListener("pointermove", pointermoveFun);

      window.document.removeEventListener("pointerup", pointerupFun);

      this.map.el.removeEventListener("contextmenu", contextmenuFun);
    };
  }

  onSave(cb) {
    this.saveFun = cb;
  }

  onClick(cb) {
    this.clickFun = cb;
  }

  // 创建多边形 mode: view|edit
  createPolygon(polygon, mode = "edit") {
    if (!this.tex) {
      this.tex = generateTexture(64);
      this.tex.wrapT = this.tex.wrapS = RepeatWrapping;
    }

    // let mat = [
    //   new MeshBasicMaterial({
    //     map: this.tex,
    //     color: polygon.color,
    //     transparent: true,
    //     opacity: 1,
    //     visible: true,
    //   }),
    //   new MeshBasicMaterial({
    //     map: this.tex,
    //     transparent: true,
    //     color: polygon.color,
    //     opacity: 1,
    //     side: 2,
    //   }),
    // ]

    let mat = [
      new MeshBasicMaterial({
        color: polygon.color,
        transparent: true,
        opacity: polygon.opacity || 1
        // map,
      }),
      new MeshStandardMaterial({
        color: new Color(polygon.color).multiplyScalar(1),
        // map: sideMap,
        transparent: true,
        opacity: polygon.opacity || 1
      })
    ];

    let mesh = new Mesh(this.createPolygonGeometry(polygon), mat);
    mesh.userData = polygon;
    mesh.userData.id = polygon?.id || createShortId();
    mesh.cursor = "pointer";
    mesh.position.z = 0;
    mesh.on("click", evt => {
      // evt.event 来自原生事件，0=左键 1=中键 2=右键
      if (evt?.event?.button !== 0) return;
      this.clickFun && this.clickFun(mesh.userData, evt);
    });
    // 右键编辑
    mesh.on("rightclick", evt => {
      if (mode === "view") return;

      this.oldStatusEditType = this.Edit.status.editType;
      this.Edit.status.editType = "editPolygon";
      if (this.polygonInfoCopy?.id === evt.object?.userData.id) return false;

      this._rightclickSprite = true;
      this.editPolygon(evt.object);
    });
    // mesh.material.forEach(i => {
    //   i.opacity = 0.7
    // })

    if (polygon.name) {
      this.createMarker(polygon);
    }
    this.showGroup.add(mesh);

    return mesh;
  }

  editPolygon(polygonMesh) {
    this.editMeshItem = polygonMesh;
    polygonDataOrigin = JSON.parse(JSON.stringify(polygonMesh.userData));
    this.polygonInfoCopy = JSON.parse(JSON.stringify(polygonMesh.userData));
    this.reAddControls();

    this._rightclickSprite = true;
    setTimeout(() => {
      this._rightclickSprite = false;
    }, 100);
  }

  createPolygonGeometry(polygon) {
    const shape = new Shape();
    shape.setFromPoints(polygon.points);

    const extrudeSettings = {
      steps: 2,
      depth: polygon.height,
      bevelEnabled: false
    };

    return new ExtrudeGeometry(shape, extrudeSettings);
  }

  updatePolygon() {
    console.log(this.showGroup.children, "this.showGroup.children");
    console.log(this.markerList, "this.markerList");
    this.showGroup.children.forEach(item => {
      item.visible = this.isShow(item.userData);
    });
  }

  // updatePolygonList (list) {
  //   this.polygonDataList = [...list]

  //   this.polygonDataList.forEach(item => {
  //     if (this.isShow(item)) {
  //       this.createPolygon(item)
  //     } else {
  //       let removeItem = this.showGroup.children.find(i => {
  //         return i.userData.id === item.id
  //       })

  //       removeItem?.dispose && removeItem.dispose()
  //       removeItem && this.showGroup.remove(removeItem)
  //     }
  //   })
  // }

  isShow(item) {
    if (!item.floorId) return true;
    if (this.status.activeFloor?.id) {
      return this.status.activeFloor.id === item.floorId;
    } else {
      return this.status.activeBuild?.id === item.floorId;
    }
  }

  removeItem(item) {
    let removeItem = this.showGroup.children.find(i => {
      return i.userData.id === item.id;
    });

    removeItem?.dispose && removeItem.dispose();
    removeItem && this.showGroup.remove(removeItem);

    this.removeMarker(item);
  }

  removeMarker(item) {
    let idx = this.markerList.findIndex(i => {
      return i.originData.id === item.id;
    });

    if (idx !== -1) {
      let removeMarker = this.markerList[idx];
      removeMarker && this.map.removeCustomMarker(removeMarker.id);
      this.markerList.splice(idx, 1);
    }
  }

  removeAll() {
    this.showGroup && this.showGroup.dispose();
    this.map.object3d.remove(this.showGroup);
    this.showGroup = new THREE.Object3D();
    this.map.object3d.add(this.showGroup);

    this.markerList.forEach(item => {
      this.map.removeCustomMarker(item.id);
    });
    this.markerList = [];
  }

  destroy() {
    this.map.object3d.remove(this.showGroup);
    this.showGroup && this.showGroup.dispose();
    this.cancel(true);
  }

  _updateControlSpriteScale() {
    this.controlsGroup.children.forEach((child, idx) => {
      console.log(idx);
      if (child.isSprite) {
        child.visible = false;
        setTimeout(() => {
          child.scale.setScalar(0.015);
          child.visible = true;
        }, 300);
      }
    });
  }

  reAddControls() {
    this.controlsGroup.dispose();
    this.addControls();
    this.map.object3d.add(this.controlsGroup);
  }

  addControls() {
    const { points } = this.polygonInfoCopy;
    this.controlsGroup.add(newSprite);

    let lines = [];
    points.forEach((point, idx) => {
      // 添加点
      let sprite = spriteBase.clone();
      sprite.cursor = "pointer";
      sprite.position.copy(point).setZ(this.polygonInfoCopy.height || 10);

      this.controlsGroup.add(sprite);
      sprite.renderOrder = 1000;

      // 添加线
      let nextPoint = points[idx + 1] || points[0];
      let line = new FatLine(
        [point, nextPoint],
        { linewidth: 4, depthTest: false, depthWrite: false, transparent: true },
        this.map.renderer.domElement
      );
      this.controlsGroup.add(line);

      line.position.z = (this.polygonInfoCopy.height || 10) + 0.5;
      line.renderOrder = 1999;
      lines.push(line);
      line.cursor = "pointer";

      // 点编辑
      sprite.on("pointerdown", evt => {
        console.log(evt);
        this.map.vmap.setStatus({
          dragEnable: false, // 地图是否可通过鼠标拖拽平移，默认为true
          keyboardEnable: false, // 地图是否可通过键盘控制，默认为true
          doubleClickZoom: false // 地图是否可通过双击鼠标放大地图，默认为true
        });
        this.movePointFn = evt => {
          let mousep = evt.point;

          let magnetPoints = points.filter(i => i !== point);

          for (let i = 0; i < magnetPoints.length; i++) {
            let p = pointMagnet(magnetPoints[i - 1] || magnetPoints[magnetPoints.length - 1], magnetPoints[i], mousep);
            if (p) {
              mousep = p.point;
            }
          }

          sprite.position.copy(mousep).setZ(this.polygonInfoCopy.height || 10);
          point.x = mousep.x;
          point.y = mousep.y;

          this.editMeshItem.dispose();
          this.editMeshItem = this.createPolygon(this.polygonInfoCopy);

          lines.forEach(i => {
            i.update();
          });
        };
      });

      sprite.on("rightclick", e => {
        if (!this.polygonInfoCopy) return false;
        const { event } = e;
        this._rightclickSprite = true;
        setTimeout(() => {
          this._rightclickSprite = false;
        }, 100);

        this.gui.open(
          {
            删除点: () => {
              if (points.length <= 3) {
                alert("多边形不少于3个点!");
                return;
              }
              points.splice(idx, 1);
              this.reAddControls();
              this.editMeshItem.dispose();
              this.editMeshItem = this.createPolygon(this.polygonInfoCopy);
            }
          },
          event.clientX,
          event.clientY
        );
      });

      line.on("pointermove", evt => {
        let clsp = closestPointToPoint(point, nextPoint, evt.point);
        let newp = clsp.clone();
        // 近距离不允许添加点
        if (newp.distanceTo(point) < 0.2 || newp.distanceTo(nextPoint) < 0.2) {
          newSprite.visible = false;
          return;
        }

        newSprite.visible = true;
        newSprite.position.copy(clsp);
      });

      line.on("pointerout", () => {
        newSprite.visible = false;
      });

      line.on("leftclick", () => {
        if (!newSprite.visible) return;
        points.splice(idx + 1, 0, newSprite.position.clone().setZ(0));
        this.reAddControls();
      });
    });
  }

  updateEditMeshItem() {
    if (polygonDataOrigin) {
      this.editMeshItem.dispose();

      this.createPolygon(polygonDataOrigin);
    }
  }

  createMarker(polygon) {
    this.removeMarker(polygon);
    let marker = this.map.addCustomMarker(polygon.floorId || "1", {
      isCollision: false, // 是否有碰撞体积
      position: polygon.center,
      text: polygon.name, // 文本
      bgColor: null,
      strokeStyle: "#FFFFFF",
      zIndex: 0,
      fontSize: 16,
      fontWeight: 500,
      lineGap: 0.25,
      strokeWidth: 0.1,
      fillStyle: "#000",
      originData: polygon
    });

    this.markerList.push(marker);
  }

  cancel(isNoChangeEditType = false) {
    console.log(isNoChangeEditType);
    if (this.editMeshItem) {
      this.editMeshItem.dispose();
      this.editMeshItem = null;
    }
    polygonDataOrigin = null;
    this.controlsGroup.dispose();
    this.polygonInfoCopy = null;

    if (this.oldStatusEditType && this.oldStatusEditType !== this.Edit.status.editType) {
      this.Edit.status.editType = this.oldStatusEditType;
    }
  }
}
