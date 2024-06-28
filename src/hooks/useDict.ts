import { getDictDataByType } from "@/api/modules/system/dict";
import { ref } from "vue";
import { useDictStore } from "@/stores/modules/dict";
import { DictOptions } from "@/api/interface";

const getDictData = async (dictLabel: string): Promise<DictOptions[]> => {
  return new Promise((resolve, reject) => {
    getDictDataByType(dictLabel)
      .then(res => {
        const list = res.data.map(item => {
          return {
            label: item.dictLabel,
            value: item.dictValue,
            tagType: item.listClass,
            cssClass: item.cssClass
          };
        });
        resolve(list);
      })
      .catch(err => {
        reject(err);
      });
  });
};

/**
 * 获取字典数据
 */
export async function useDict(...args: string[]) {
  const res = ref<{ [key: string]: DictOptions[] }>({});
  const dictStore = useDictStore();

  await Promise.all(
    args.map(async dictType => {
      const dicts = dictStore.getDict(dictType);
      if (dicts) {
        res.value[dictType] = dicts.value;
      } else {
        res.value[dictType] = await getDictData(dictType);
        dictStore.setDict(dictType, res.value[dictType]);
      }
    })
  );
  return res.value;
}
