import { ElMessage, ElNotification } from "element-plus";
import axios from "axios";
import { useUserStore } from "@/stores/modules/user";
const globalStore = useUserStore();
/**
 * @description 接收数据流生成 blob，创建链接，下载文件
 * @param {Function} api 导出表格的api方法 (必传)
 * @param {String} tempName 导出的文件名 (必传)
 * @param {Object} params 导出的参数 (默认{})
 * @param {Boolean} isNotify 是否有导出消息提示 (默认为 true)
 * @param {String} fileType 导出的文件格式 (默认为.xlsx)
 * */
export const useDownload = async (
  api: string,
  tempName: string,
  isNotify: boolean = true,
  fileType: string = ".xlsx",
  method: string = "get",
  params: Object = {}
) => {
  if (isNotify) {
    ElNotification({
      title: "温馨提示",
      message: "如果数据庞大会导致下载缓慢哦，请您耐心等待！",
      type: "info",
      duration: 0
    });
  }
  try {
    let res: any;
    if (method === "get") {
      res = await axios.get(api, {
        headers: { Authorization: "Bearer " + globalStore.token },
        responseType: "blob",
        params
      });
      console.log(res, params);
    } else if (method === "post") {
      res = await axios.post(api, params, {
        headers: { Authorization: "Bearer " + globalStore.token, "Content-Type": "application/x-www-form-urlencoded" },
        responseType: "blob"
      });
    }
    // const blob = new Blob([res], {
    // 	type: "application/vnd.ms-excel;charset=UTF-8"
    // });
    const resData = res.data;
    console.log(res);

    const fileReader = new FileReader();
    fileReader.onload = () => {
      if (resData.type === "application/json") {
        const jsonData = JSON.parse(fileReader.result as string);
        ElMessage.error(jsonData.message);
        ElNotification.closeAll();
      } else {
        const blob = new Blob([res.data], { type: "application/vnd.ms-excel;charset=UTF-8" });
        // 兼容 edge 不支持 createObjectURL 方法
        if ("msSaveOrOpenBlob" in navigator) return window.navigator.msSaveOrOpenBlob(blob, tempName + fileType);
        const blobUrl = window.URL.createObjectURL(blob);
        const exportFile = document.createElement("a");
        exportFile.style.display = "none";
        exportFile.download = `${tempName}${fileType}`;
        exportFile.href = blobUrl;
        document.body.appendChild(exportFile);
        exportFile.click();
        // 去除下载对 url 的影响
        document.body.removeChild(exportFile);
        window.URL.revokeObjectURL(blobUrl);
        ElNotification.closeAll();
      }
    };
    fileReader.readAsText(res.data);
  } catch (error) {
    ElNotification.closeAll();
    console.log(error);
  }
};
