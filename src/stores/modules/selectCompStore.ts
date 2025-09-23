import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useSelectCompStore = defineStore("compEvent", () => {
  // 当前表单
  const globalFormConfig = ref({});
  // 当前组件配置
  const compConfig = ref<{ id: string; [key: string]: any }>({ id: "" });
  // 保存当前选中组件的唯一ID（用于强校验）
  const currentCompKey = ref(""); // 更新Key

  // init组件配置
  const initCurrentComp = (comp: { id: string; [key: string]: any }) => {
    if (!comp?.id) {
      console.warn("组件缺少唯一ID，无法初始化");
      return;
    }
    // 同步更新组件配置和当前ID
    compConfig.value = { ...comp };
    currentCompKey.value = comp.id;
    console.log(`已选中组件: ${comp.id}`);
  };

  // 安全更新组件数据（核心改进）
  const updateCurrentComp = (updateData: any) => {
    // 校验1：是否存在选中的组件
    if (!currentCompKey.value) {
      console.log("未选中任何组件，无法更新数据");
      return;
    }
    // 校验2：组件ID是否匹配（防止更新到已切换的组件）
    if (compConfig.value.id !== updateData.id) {
      console.log(`组件ID不匹配，更新失败！当前选中: ${currentCompKey.value}, 待更新: ${updateData.id}`);
      return;
    }
    // 执行安全更新
    compConfig.value = {
      ...compConfig.value,
      ...updateData
    };
    console.log(`组件 ${currentCompKey.value} 数据已更新`, compConfig.value);
  };

  // 当前组件配置
  const currentCompConfig = computed(() => compConfig.value);

  // 获取当前组件
  const getCurrentCompConfig = () => {
    return currentCompConfig;
  };

  // 初始化全局配置
  const initGlobalFormConfig = (config: any) => {
    globalFormConfig.value = { ...config };
    console.log("初始化全局配置", globalFormConfig.value);
  };

  const updateGlobalFormConfig = (updateData: any) => {
    console.log(updateData, "更新我");
    globalFormConfig.value = {
      ...globalFormConfig.value,
      ...updateData
    };
  };

  const currentGlobalFormConfig = computed(() => globalFormConfig.value);

  const getGlobalFormConfig = () => {
    return currentGlobalFormConfig;
  };

  const updateCurrentCompKey = (key: string) => {
    currentCompKey.value = key;
  };

  return {
    compConfig,
    currentCompConfig,
    globalFormConfig,
    currentGlobalFormConfig,
    initCurrentComp,
    updateCurrentComp,
    getCurrentCompConfig,
    initGlobalFormConfig,
    updateGlobalFormConfig,
    getGlobalFormConfig,
    currentCompKey,
    updateCurrentCompKey
  };
});
