export class DomMarker {
  constructor(map, item, floorId, content) {
    this.currentTween = null;
    this.userData = item;
    this.floorId = floorId;
    this.content = content;
    this.marker = null;
    this.element = undefined;
    this.map = map;
  }

  create(position) {
    let dom = document.createElement("div");
    dom.innerHTML = this.content;
    this.marker = this.map.addDomMarker(this.floorId || "1", dom);

    this.marker.position.copy(position);
    this.marker.userData = this.userData;
    this.element = this.marker.element;
  }

  on(event, cb) {
    this.marker.element.addEventListener(event, cb, false);
  }

  dispose() {
    if (this.currentTween) {
      this.currentTween.stop();
    }
    if (this.marker) {
      this.marker.dispose();
    }
    this.marker = null;
  }

  setPosition(position) {
    if (this.marker.position) {
      this.marker.position.copy(position);
    }
  }

  setCenter(center) {
    this.marker.center = center;
  }

  setAngle(angle, className) {
    let childrenDom = className ? this.marker.element.querySelector(className) : this.marker.element.children[0];

    if (childrenDom) {
      angle = parseFloat(angle.toFixed(2));
      childrenDom.style.transform = `rotateZ(${angle}deg)`;
      childrenDom.setAttribute("data-rotatez", angle);
    }
  }

  getAngle(className) {
    let childrenDom = className ? this.marker.element.querySelector(className) : this.marker.element.children[0];
    let angle = childrenDom.getAttribute("data-rotatez");
    return isNaN(parseInt(angle)) ? 0 : angle;
  }
}
