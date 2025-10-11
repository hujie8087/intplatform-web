<template>
  <div class="setting-item h-42">
    <el-text class="mx-1" size="default">{{ $t("survey.form.titleComp.showTImg") }}</el-text>
    <el-switch v-model="comp.titleImageShow" size="default" @change="changeValue($event, 'titleImageShow')" />
  </div>
  <el-text class="mx-1" size="default">{{ $t("survey.form.titleComp.tImg") }}</el-text>
  <el-input
    size="default"
    class="mb-10"
    :placeholder="$t('survey.form.titleComp.tImgPlaceholder')"
    v-model="comp.titleImageUrl"
    @input="handleChangeInput($event, 'titleImageUrl')"
    :maxlength="400"
  ></el-input>
  <el-text class="mx-1" size="default">{{ $t("survey.form.titleComp.tName") }}</el-text>
  <el-input
    size="default"
    class="mb-10"
    :placeholder="$t('survey.form.titleComp.tNamePlaceHolder')"
    v-model="comp.titleValue"
    @input="handleChangeInput"
    :maxlength="30"
  ></el-input>
  <div class="setting-item h-50">
    <el-text class="mx-1" size="default">{{ $t("survey.form.titleComp.tSize") }}</el-text>
    <el-select
      size="default"
      clearable
      v-model="comp.titleSize"
      style="width: 120px"
      class="abs-r"
      @change="changeSelect($event, 'titleSize')"
    >
      <el-option
        :value="item.value"
        :label="$t(`survey.form.options.${item.label}`)"
        v-for="(item, index) in orientationList"
        :key="index"
      />
    </el-select>
  </div>
  <div class="setting-item h-42">
    <el-text class="mx-1" size="default">{{ $t("survey.form.titleComp.showTDesc") }}</el-text>
    <el-switch v-model="comp.titleDescriptionShow" size="default" @change="changeValue($event, 'titleDescriptionShow')" />
  </div>
  <el-text class="mx-1" size="default">{{ $t("survey.form.titleComp.tDesc") }}</el-text>
  <el-input
    class="mb-10 m-b-10"
    :placeholder="$t('main.inputPlaceholder')"
    size="default"
    v-model="comp.titleDescription"
    :autosize="{ minRows: 3, maxRows: 5 }"
    type="textarea"
    show-word-limit
    @input="handleChangeInput($event, 'titleDescription')"
    :maxlength="250"
  />
  <div class="setting-item h-50">
    <el-text class="mx-1" size="default">{{ $t("survey.form.titleComp.tPosition") }}</el-text>
    <el-select
      size="default"
      v-model="comp.titleDescriptionPosition"
      style="width: 70px"
      class="abs-r"
      @change="changeSelect($event, 'titleDescriptionPosition')"
    >
      <el-option
        :value="item.value"
        :label="$t(`survey.form.options.${item.label}`)"
        v-for="(item, index) in positionList"
        :key="index"
      />
    </el-select>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useSelectCompStore } from "@/stores/modules/selectCompStore";
import { optionData, textOrButtonSizeData } from "../settingConfigData";
import { delayTime } from "../../compConfig";

const orientationList = ref([...textOrButtonSizeData]);
const positionList = ref([...optionData]);
interface Props {
  comp: any;
}
const compStore: any = useSelectCompStore();
const changeValue = (event: any, param?: string) => {
  const data = event;
  setTimeout(() => {
    compStore.updateCurrentComp({
      [param || "buttonIconShowBool"]: data,
      id: comp.value.id
    });
  }, delayTime);
};

const handleChangeInput = (value: any, params?: string) => {
  const data = value;
  setTimeout(() => {
    compStore.updateCurrentComp({
      [params || "titleValue"]: data,
      id: comp.value.id
    });
  }, delayTime);
};

const changeSelect = (value: any, param?: string) => {
  const data = value;
  setTimeout(() => {
    compStore.updateCurrentComp({
      [param || "titleSize"]: data,
      id: comp.value.id
    });
  }, delayTime);
};

const props = defineProps<Props>();
const comp = ref(props.comp || null);
</script>

<style lang="scss" scoped>
.comp {
  padding: 10px;
  color: yellowgreen;
}
.mb-10 {
  margin-top: 8px;
  margin-bottom: 8px;
}
.h-42 {
  height: 42px;
  line-height: 42px;
}
.m-b-10 {
  margin-bottom: 10px;
}
.setting-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
</style>
