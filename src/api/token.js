import request from "~/utils/request";

export const getBEP20TokenByAddress = () => {
  return request({
    method: "get",
    url: "/plug/getBEP20TokenByAddress",
    requireToken: true,

  });
};
