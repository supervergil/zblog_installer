import Vue from "vue";
import axios from "axios";
import { Message } from "element-ui";

import router from "@/router";

const httpPlugin = {};

const http = async (method, url, request) => {
  try {
    if (request) {
      if (request.warning !== false) {
        request.warning = true;
      }
      if (!request.contentType) {
        request.contentType = "application/json";
      }
    } else {
      request = {
        contentType: "application/json"
      };
    }
    const token = localStorage.getItem("client-token") || "";
    let user = localStorage.getItem("client-user");
    if (user === "null" || !user) {
      user = { id: "" };
    } else {
      user = JSON.parse(user);
    }
    const resp = await axios({
      method,
      url,
      data: request ? request.data : null,
      params: request ? request.params : null,
      timeout: 12000000,
      headers: {
        "Content-Type": request.contentType,
        "Access-Token": token,
        "User-Id": user.id,
        Secret: "ZBLOG"
      },
      withCredentials: true,
      responseType: request.responseType || null,
      validateStatus: () => {
        return true;
      }
    });
    const { status, data } = resp;
    if (status.toString().startsWith("20")) {
      if (request.responseType === "blob") {
        return {
          status: 1,
          data
        };
      }
      if (data.errno.toString() === "0") {
        return {
          status: 1,
          ...data
        };
      } else {
        if (!request || request.warning === true) {
          // 此处为一些逻辑错误 使用 Message.warning 弹出消息，并返回 data
          Message.warning(data.errmsg);
        }
        return {
          status: 2,
          ...data,
          data: data.errmsg
        };
      }
    } else {
      if (status.toString() === "401") {
        Message.warning("请重新登录！");
        router.push("/signin");
      } else {
        throw new Error(status);
      }
    }
  } catch (e) {
    if (e.toString().includes("Network Error")) {
      Message.error("服务器连接失败！");
    } else if (e.toString().includes("500")) {
      Message.error("服务器内部错误！");
    } else if (e.toString().includes("404")) {
      Message.error("api地址不存在！");
    } else if (e.toString().includes("401")) {
      Message.error("没有访问权限！");
    } else {
      Message.error(e.toString());
    }
    return {
      status: 3,
      returnCode: "0",
      data: e.toString()
    };
  }
};

httpPlugin.install = Vue => {
  Vue.prototype.$http = http;
};

Vue.use(httpPlugin);

export default http;
