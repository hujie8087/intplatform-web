import { DictOptions } from "./../../api/interface/index";
import { defineStore } from "pinia";
import { DictState } from "../interface";
export const useDictStore = defineStore({
  id: "logistics-dict",
  state: (): DictState => ({
    dict: []
  }),
  actions: {
    // 获取字典
    getDict(_key: string | null) {
      if (_key == null && _key === "") {
        return null;
      }
      try {
        for (let i = 0; i < this.dict.length; i++) {
          if (this.dict[i].label === _key) {
            return this.dict[i];
          }
        }
      } catch (e) {
        return null;
      }
    },
    setDict(_key: string | null, value: DictOptions[]) {
      if (_key !== null && _key !== "") {
        this.dict.push({
          label: _key,
          value: value
        });
      }
    },
    removeDict(_key: any) {
      let bln = false;
      try {
        for (let i = 0; i < this.dict.length; i++) {
          if (this.dict[i].label === _key) {
            this.dict.splice(i, 1);
            return true;
          }
        }
      } catch (e) {
        bln = false;
      }
      return bln;
    },
    clearDict() {
      this.dict = [];
    }
  }
});
