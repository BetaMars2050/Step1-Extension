import axios from "axios";
import { refreshTwAuthToken } from "~/api/login";

const service = axios.create({
  baseURL: "https://test1.step1matrix.io/api",
  timeout: 120000,
});
service.interceptors.request.use(
  async function (config) {
    if (config?.requireToken) {
      let result = await chrome.storage.local.get(["wt", "st"]);
      console.log(result, "require token");
      config.headers.st = result.st;
      config.headers.wt = result.wt;
    }

    if (config?.requireTwitterAuthToken) {
      let result = await chrome.storage.local.get([
        "twitterAuthToken",
        "twttierLoginTime",
      ]);
      let nowTime = new Date().getTime();
      if (Math.abs(result.twttierLoginTime - nowTime) > 6000000) {
        let twToken = await refreshTwitterToken();
        config.headers.Authorization = "Bearer " + twToken;
        chrome.storage.local.set({
          twitterAuthToken: twToken,
          twttierLoginTime: new Date().getTime(),
        });
      } else {
        console.log(result, "require twitter auth token");
        config.headers.Authorization = "Bearer " + result.twitterAuthToken;
      }
    }

    return config;
  },
  function (error) {
    console.log(error);
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  function (response) {
    console.log(response, "response");
    if (
      (response.data?.code && response.data.code === 200) ||
      (response.status === 200 && !response.data?.code)
    ) {
      const dataAxios = response.data;
      return dataAxios;
    } else if (response.data?.code === 401) {
      chrome.storage.local.set({
        twitterToken: null,
        token: null,
        address: null,
        chainId: null,
      });
    } else {
      return Promise.reject(response.data);
    }
  },
  async function (error) {
    console.log(error);
    return Promise.reject(error);
  }
);

const refreshTwitterToken = async () => {
  let res = await refreshTwAuthToken();
  return res.data;
};

export default service;
