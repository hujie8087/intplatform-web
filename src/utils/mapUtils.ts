declare global {
  interface Window {
    VgoMap?: any;
    __VGO_MAP_SDK_PROMISE__?: Promise<void>;
  }
}

// const SDK_CSS_URL = 'https://www.wxb3d.com/saas/sdk/v2.0/VgoMap.umd.css'
// const SDK_JS_URL = 'https://www.wxb3d.com/saas/sdk/v2.0/VgoMap.umd.js'
// 内网地图
const SDK_CSS_URL = "https://map-prod.iwipwedabay.com:32735/sdk/VgoMap.umd.css";
const SDK_JS_URL = "https://map-prod.iwipwedabay.com:32735/sdk/VgoMap.umd.js";
const DEFAULT_MAP_ID = "1902300333347049472";

const ensureCssLoaded = () => {
  if (document.querySelector(`link[href="${SDK_CSS_URL}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = SDK_CSS_URL;
  document.head.appendChild(link);
};

const ensureScriptLoaded = () => {
  if (window.VgoMap) return Promise.resolve();
  if (!window.__VGO_MAP_SDK_PROMISE__) {
    window.__VGO_MAP_SDK_PROMISE__ = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SDK_JS_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        window.__VGO_MAP_SDK_PROMISE__ = undefined;
        reject(new Error("Failed to load VgoMap SDK"));
      };
      document.body.appendChild(script);
    });
  }
  return window.__VGO_MAP_SDK_PROMISE__;
};

export interface CreateManufacturerMapOptions {
  el: HTMLElement | string;
  mapId?: string;
  lowPower?: boolean;
  testGps?: boolean;
  onLoaded?: () => void;
}

export type ManufacturerMapInstance = any;

export const createManufacturerMap = async (options: CreateManufacturerMapOptions): Promise<ManufacturerMapInstance> => {
  ensureCssLoaded();
  await ensureScriptLoaded();
  const VgoMap = window.VgoMap;
  if (!VgoMap) throw new Error("VgoMap SDK not available on window");
  const mapId = options.mapId ?? DEFAULT_MAP_ID;
  const instance = new VgoMap.Map({
    el: options.el,
    id: mapId,
    audioOptions: {
      defaultLanguage: "zh",
      volume: 1,
      muted: false
    }
  });
  if (options.onLoaded) {
    instance.on?.("loaded", options.onLoaded);
  }
  return instance;
};
