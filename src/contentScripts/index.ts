import { injectContent } from './scripts/inject'

import { messageListener } from './scripts/messageListener'

import { getUrlParams } from "../utils/index";

import { getTwitterAuthToken, socialLogin } from "../api/login";


import '~/styles'



(() => {

  window.onload = () => {

    setTimeout(async () => {
      injectContent()
      messageListener()
    }, 1000);

    chrome.storage.onChanged.addListener(function (changes, namespace) {
      console.log(changes, "content");
  
      if (changes?.twitterCode?.newValue) {
        let obj = {
          code: changes?.twitterCode?.newValue,
          grant_type: "authorization_code",
          redirect_uri: "https://test1.step1matrix.io/auth",
          code_verifier: "challenge",
          client_id: "TkE5Q25VSThyaURpbHgtd2NjaHA6MTpjaQ",
        };
  
        getTwitterAuthToken(obj)
          .then(async (res) => {
            console.log(res.access_token, "res.access_token");
            console.log(res.refresh_token, "refresh_token");
  
            let result = await socialLogin({
              socialName: "TWITTER",
              code: res.access_token + "_" + res.refresh_token,
            });
            console.log(result, "result");
  
            let twttierLoginTime = new Date().getTime();
            chrome.storage.local.set({
              st: result.data,
              twitterAuthToken: res.access_token,
              twitterAuthRefreshToken: res.refresh_token,
              twttierLoginTime: twttierLoginTime,
            });
          })
          .catch((err) => {
            console.log(err, "err");
          });
      }
    });

  }

  if (
    window.location.origin === "https://test1.step1matrix.io" &&
    window.location.search
  ) {
    let data = getUrlParams(window.location.search);
  
    if (data?.code && data?.state && data?.state === "state") {
      chrome.storage.local.set({ twitterCode: data?.code });
      window.close();
    }
  }
  

})()

