<template>
  <div class="publish-page">
    <div class="content-card">
      <div class="survey-container">
        <!-- 内网答卷地址 -->
        <div class="address-group">
          <h3>内网答卷地址</h3>
          <p>复制下面的问卷链接到QQ、Email等工具中直接发给被用户</p>
          <div class="address-input-group">
            <el-input style="width: 520px" size="large" v-model="intranetAddress" readonly></el-input>
            <el-button style="margin: 0 20px" size="large" @click="copyAddress('intranet')" :icon="Connection"
              >复制地址</el-button
            >
            <el-button style="margin: 0 20px 0 0" size="large" @click="openSurvey('intranet')" :icon="Link">打开问卷</el-button>
          </div>
        </div>

        <!-- 外网答卷地址 -->
        <div class="address-group">
          <h3>外网答卷地址</h3>
          <p>复制下面的问卷链接到QQ、Email等工具中直接发给被用户</p>
          <div class="address-input-group">
            <el-input style="width: 520px" size="large" v-model="extranetAddress" readonly></el-input>
            <el-button style="margin: 0 20px" size="large" @click="copyAddress('extranet')" :icon="Connection"
              >复制地址</el-button
            >
            <el-button style="margin: 0 20px 0 0" size="large" @click="openSurvey('extranet')" :icon="Link">打开问卷</el-button>
          </div>
        </div>

        <div class="qr-code-box">
          <!-- 内网二维码地址 -->
          <div class="qr-code-group">
            <h3>内网二维码地址</h3>
            <p>通过手机扫一扫，或下载二维码，即可进行问卷数据收集。</p>
            <div class="qr-code-wrapper">
              <QrCode :value="intranetAddress" :size="240" class="qr-code" ref="intranetQrCodeRef" />
              <el-button style="width: 120px; margin-left: 10px" size="large" @click="downloadQrCode('intranet')" :icon="Download"
                >下载二维码</el-button
              >
            </div>
          </div>
          <!-- 外网二维码地址 -->
          <div class="qr-code-group">
            <h3>外网二维码地址</h3>
            <p>通过手机扫一扫，或下载二维码，即可进行问卷数据收集。</p>
            <div class="qr-code-wrapper">
              <QrCode :value="extranetAddress" :size="240" class="qr-code" ref="extranetQrCodeRef" />
              <el-button style="width: 120px; margin-left: 10px" size="large" @click="downloadQrCode('extranet')" :icon="Download"
                >下载二维码</el-button
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="publish">
import { ref } from "vue";
import QrCode from "@/views/productDisplay/order/components/QrCode.vue";
import { Connection, Link, Download } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

// 地址数据
const intranetAddress = ref("http://10.46.236.8080/static/diaowen/answer-p.html?sid=en854serc");
const extranetAddress = ref("http://36.92.27.251:34040/static/diaowen/answer-p.html?sid=en854serc");
const intranetQrCodeRef = ref(null);
const extranetQrCodeRef = ref(null);
// 复制地址方法
const copyAddress = type => {
  let textToCopy = "";
  if (type === "intranet") {
    textToCopy = intranetAddress.value;
  } else if (type === "extranet") {
    textToCopy = extranetAddress.value;
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
    url = intranetAddress.value;
  } else if (type === "extranet") {
    url = extranetAddress.value;
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
  display: flex;
  align-items: flex-start; // 改为顶部对齐，避免内容过长时垂直居中异常
  justify-content: center;
  min-height: 100%; // 使用最小高度，避免内容不足时背景异常
  margin: 0;
  overflow: hidden;
  background-image: url("./images/bg.png");
  background-repeat: round;
}
.content-card {
  width: 94%;
  min-height: 80%;
  margin-top: $spacing-lg;
  overflow: hidden;
  background: #ffffff;
  ::v-deep .el-input__wrapper.is-focus {
    box-shadow: 0 0 0 1px #1677ff inset;
  }
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
  max-width: 1200px;
  padding: 10px 40px;
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
    button {
      padding: 8px 15px;
      color: #ffffff;
      cursor: pointer;
      background-color: #1677ff;
      border: none;
      border-radius: 4px;
      &:hover {
        background-color: #0f62d9;
      }
    }
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
        button {
          padding: 8px 15px;
          color: #ffffff;
          cursor: pointer;
          background-color: #1677ff;
          border: none;
          border-radius: 4px;
          &:hover {
            background-color: #0f62d9;
          }
        }
      }
    }
  }
}
</style>
