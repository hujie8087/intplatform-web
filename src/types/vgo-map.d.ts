declare module "@/assets/js/VgoMap.umd.js" {
  class Map {
    constructor(options: Record<string, any>);
    [key: string]: any;
  }

  const VgoMap: {
    Map: typeof Map;
    [key: string]: any;
  };

  export { Map };
  export default VgoMap;
}

declare module "@/assets/js/DomMarker.js" {
  export class DomMarker {
    constructor(mapInstance: any, item: Record<string, any>, floorId: string, content: string);
    create(position: any): void;
    dispose(): void;
    on(eventName: string, handler: (...args: any[]) => void): void;
  }
}
