import request from "~/utils/request";

export const getNonce = (params) => {
  return request({
    method: "get",
    url: "/plug/v1.0/auth/nonce/public",
    params,
  });
};

export const login = (params) => {
  return request({
    method: "post",
    url: "/plug/v1.0/auth/login/public",
    params,
  });
};

export const logout = (params) => {
  return request({
    method: "post",
    url: "/plug/v1.0/auth/logout/public",
    params,
  });
};

export const getTwitterAuthToken = (params) => {
  return request({
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    url: "https://api.twitter.com/2/oauth2/token",
    data: params,
  });
};

export const socialLogin = (params) => {
  return request({
    method: "get",
    url: "/plug/socialLogin/anon",
    params,
  });
};

export const bindToken = (params) => {
  return request({
    method: "get",
    url: "/plug/ba",
    params,
    requireToken: true,
  });
};

export const refreshTwAuthToken = () => {
  return request({
    method: "get",
    url: "/twitter/getNewestAccessToken",
    requireToken: true,
  });
};

export const findMainWallet = () => {
  return request({
    method: "get",
    url: "/plug/findMainWallet",
    requireToken: true,
  });
};

export const setMainWallet = (params) => {
  return request({
    method: "get",
    url: "/plug/setMainWallet",
    params,
    requireToken: true,
  });
};
