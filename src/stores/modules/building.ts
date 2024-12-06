import { Building } from "@/api/interface/productDisplay/building";
import { defineStore } from "pinia";
import { BuildingState } from "../interface";

// BuildingStore
export const BuildingStore = defineStore({
  id: "BuildingState",
  state: (): BuildingState => ({
    buildingList: [],
    allBuildingList: []
  }),
  actions: {
    // getBuildingButtonList
    async setBuildingButtonList(data: Building.ResBuilding[]) {
      this.buildingList = data;
    },
    async setAllBuildingButtonList(data: Building.ResBuilding[]) {
      this.allBuildingList = data;
      this.buildingList = [];
    }
  }
});
