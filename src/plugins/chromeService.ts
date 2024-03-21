
export const sendChromeMessage = (msg: string, data?: any, callback?: any) => {


  console.log('msg', msg)
  console.log('chrome', chrome)
  chrome &&
    chrome.tabs &&
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabsArr: any) {
      chrome.tabs.sendMessage(tabsArr[0].id, { message: msg, data }, (res) => {

        console.log('msg', msg)
        callback && callback(res)
      });
    });
};
