import request from "~/utils/request";

export const sendGiveawayActivity = (params) => {
  return request({
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    url: "/twitter/sendActivity",
    data: params,
    requireToken: true,
  });
};

export const getReward = () => {
  return request({
    method: "get",
    url: "/twitter/reward/findReward",
    requireToken: true,
  });
};

export const getEligibility = () => {
  return request({
    method: "get",
    url: "/twitter/eligibility/findEligibility",
    requireToken: true,
  });
};

export const getGaming = () => {
  return request({
    method: "get",
    url: "/twitter/queryGamingRecord",
    requireToken: true,
  });
};

export const getMission = () => {
  return request({
    method: "get",
    url: "/twitter/queryMissionRecord",
    requireToken: true,
  });
};

export const queryActivity = (params) => {
  return request({
    method: "get",
    url: "/twitter/findTwitterActivity",
    requireToken: true,
    params,
  });
};

export const saveParticipate = (params) => {
  return request({
    method: "post",
    url: "/twitter/saveParticipate",
    requireToken: true,
    params,
  });
};

export const checkUserTwitterTask = (params) => {
  return request({
    method: "get",
    url: "/twitter/checkUserTwitterTask",
    requireToken: true,
    params,
  });
};

export const saveUserQaRecord = (params) => {
  return request({
    method: "post",
    url: "/twitter/saveUserQaRecord",
    headers: {
      "Content-Type": "application/json",
    },
    requireToken: true,
    data: params,
  });
};

export const getGiveawayKey = (params) => {
  return request({
    method: "get",
    url: "/contract/whiteListToken/getKey/LifbCSs",
    params: params,
    requireToken: true,
  });
};
