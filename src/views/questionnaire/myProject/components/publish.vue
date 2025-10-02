<template>
  <div class="publish-page">
    <div class="content-card">
      <div class="survey-container" v-if="dialogForm.status === 2 || dialogForm.status === 3">
        <!-- 内网答卷地址 -->
        <div class="address-group">
          <h3>内网答卷地址</h3>
          <p>复制下面的问卷链接到QQ、Email等工具中直接发给被用户</p>
          <div class="address-input-group">
            <el-input style="width: 520px" v-model="intranetUrl" readonly></el-input>
            <el-button
              type="primary"
              style="margin: 0 20px"
              @click="copyAddress('intranet')"
              :icon="Connection"
              v-auth="['survey:project:add']"
              >复制地址</el-button
            >
            <el-button type="primary" style="margin: 0 20px 0 0" @click="openSurvey('intranet')" :icon="Link">打开问卷</el-button>
          </div>
        </div>
        <!-- 外网答卷地址 -->
        <!-- <div class="address-group">
          <h3>外网答卷地址</h3>
          <p>复制下面的问卷链接到QQ、Email等工具中直接发给被用户</p>
          <div class="address-input-group">
            <el-input style="width: 520px" size="large" v-model="extranetAddress" readonly></el-input>
            <el-button style="margin: 0 20px" size="large" @click="copyAddress('extranet')" :icon="Connection"
              >复制地址</el-button
            >
            <el-button style="margin: 0 20px 0 0" size="large" @click="openSurvey('extranet')" :icon="Link">打开问卷</el-button>
          </div>
        </div> -->
        <div class="qr-code-box">
          <!-- 内网二维码地址 -->
          <div class="qr-code-group">
            <h3>内网二维码地址</h3>
            <p>通过手机扫一扫，或下载二维码，即可进行问卷数据收集。</p>
            <div class="qr-code-wrapper">
              <QrCode v-if="intranetUrl" :value="intranetUrl" :size="240" class="qr-code" ref="intranetQrCodeRef" />
              <el-button
                type="primary"
                style="width: 120px; margin-left: 10px"
                @click="downloadQrCode('intranet')"
                :icon="Download"
                >下载二维码</el-button
              >
            </div>
          </div>
          <!-- 外网二维码地址 -->
          <!-- <div class="qr-code-group">
            <h3>外网二维码地址</h3>
            <p>通过手机扫一扫，或下载二维码，即可进行问卷数据收集。</p>
            <div class="qr-code-wrapper">
              <QrCode v-if="extranetUrl" :value="extranetUrl" :size="240" class="qr-code" ref="extranetQrCodeRef" />
              <el-button style="width: 120px; margin-left: 10px" size="large" @click="downloadQrCode('extranet')" :icon="Download"
                >下载二维码</el-button
              >
            </div>
          </div> -->
        </div>
      </div>
      <div class="survey-container" v-if="dialogForm.status === 1">
        <el-empty description="问卷尚未发布" :image="noDataImage" :image-size="500">
          <el-button @click="publishSurvey" size="large" type="primary" style="width: 320px" v-auth="['survey:project:saveAll']"
            >点击发布问卷</el-button
          >
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="publish">
import { ref, onMounted, reactive, nextTick } from "vue";
import QrCode from "@/views/productDisplay/order/components/QrCode.vue";
import { Connection, Link, Download } from "@element-plus/icons-vue";
import { getProjectDetail, publishProject } from "@/api/modules/questionnaire/myProject";
import { publishIntranetAddress, publishExtranetAddress } from "@/views/questionnaire/dynamicForm/components/compConfig";
import { useRoute } from "vue-router";
import noDataImage from "@/assets/images/form-editor/no_data.svg";
import { ElMessage, ElMessageBox } from "element-plus";

const route = useRoute();
const key = route.query.key;

// 地址数据
const intranetQrCodeRef = ref(null);
const extranetQrCodeRef = ref(null);
const intranetUrl = ref(publishIntranetAddress);
const extranetUrl = ref(publishExtranetAddress);
interface dialogFormType {
  status: number; // 1=未发布,2=收集中,3=停止发布
}
const dialogForm = reactive<dialogFormType>({
  status: -1
});

onMounted(() => {
  nextTick(() => {
    queryProjectDetail();
    // 查询该问卷是否发布
    intranetUrl.value = `${intranetUrl.value}?projectKey=${key}`;
    extranetUrl.value = `${extranetUrl.value}?projectKey=${key}`;
  });
});

// 查询项目详情
const queryProjectDetail = async () => {
  if (key) {
    let res: any = await getProjectDetail(key);
    dialogForm.status = res?.data?.status;
    console.log(dialogForm);
  }
};

// 发布问卷
const publishSurvey = async () => {
  try {
    await ElMessageBox.confirm("确定要发布该问卷吗?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "稍后再发",
      type: "warning"
    });
    let res: any = await publishProject(key);
    if (res?.code == 200) {
      dialogForm.status = 2;
      ElMessage.success("发布问卷成功");
    }
  } catch (error) {
    console.log("取消");
  }
};

// 复制地址方法
const copyAddress = type => {
  let textToCopy = "";
  if (type === "intranet") {
    textToCopy = intranetUrl.value;
  } else if (type === "extranet") {
    textToCopy = extranetUrl.value;
  }
  navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      ElMessage.success("地址复制成功");
    })
    .catch(err => {
      console.error("复制失败：", err);
      ElMessage.success("地址复制失败，请手动复制");
    });
};

// 打开问卷方法
const openSurvey = type => {
  let url = "";
  if (type === "intranet") {
    url = intranetUrl.value;
  } else if (type === "extranet") {
    url = extranetUrl.value;
  }
  window.open(url, "_blank");
};

// 下载二维码方法（简单模拟，实际需结合后端或更完善的下载逻辑）
const downloadQrCode = type => {
  // 从QrCode组件的ref中获取生成的二维码dataURL
  let qrCodeDataURL = null;
  let fileName = "";
  if (type === "intranet") {
    qrCodeDataURL = intranetQrCodeRef.value.qrBase64; // 假设QrCode组件内用qrBase64存储dataURL
    fileName = "内网问卷二维码";
  } else if (type === "extranet") {
    qrCodeDataURL = extranetQrCodeRef.value.qrBase64; // 假设QrCode组件内用qrBase64存储dataURL
    fileName = "外网问卷二维码";
  }
  if (qrCodeDataURL) {
    const link = document.createElement("a");
    link.href = qrCodeDataURL;
    link.download = fileName; // 下载的文件名
    link.click();
  } else {
    console.error("未获取到二维码图片数据");
  }
};
</script>

<style lang="scss" scoped>
// 统一变量：便于维护
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
.publish-page {
  position: relative;
  display: flex;
  align-items: flex-start; // 改为顶部对齐，避免内容过长时垂直居中异常
  justify-content: center;
  min-height: 100%; // 使用最小高度，避免内容不足时背景异常
  margin: 0;
  overflow: hidden;
}
.publish-page::after {
  position: absolute;
  top: 56px;
  left: 0;
  z-index: -1;
  width: 100%;
  height: calc(100% - 56px);
  content: "";
  background-image: url("./images/bg.jpg");
  filter: blur(30px);
  background-repeat: round;
}
.content-card {
  width: 98%;
  min-height: 80%;
  margin-top: $spacing-lg;
  overflow: hidden;
  background: #ffffff;
}

// 卡片头部样式
.card-header {
  .header-title {
    margin: 0 0 $spacing-sm 0;
    font-size: 18px;
    font-weight: 500;
  }
  .header-desc {
    margin: 0;
    font-size: 14px;
    color: #606266;
  }
}
.survey-container {
  min-height: 595px;
  padding: 20px 40px;
  .address-group,
  .qr-code-group {
    margin-bottom: 30px;
  }
  h3 {
    font-size: 18px;
    color: #333333;
  }
  p {
    font-size: 14px;
    color: #666666;
  }
  .address-input-group {
    display: flex;
    align-items: center;
  }
  .qr-code-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    .qr-code-group {
      display: flex;
      flex: 1;
      flex-direction: column;
      .qr-code-wrapper {
        display: flex;
        align-items: center;
      }
    }
  }
}
</style>
