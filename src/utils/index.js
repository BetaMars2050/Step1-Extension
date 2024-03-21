export const getUrlParams = (url) => {
  let arr = url.split("?");
  let res = arr[1].split("&");
  let items = {};
  for (let i = 0; i < res.length; i++) {
    let a = res[i].split("=");
    items[a[0]] = a[1];
  }
  return items;
};

export const checkChainId = (id) => {
  if (id !== 56 && id !== 1 && id !== 97) {
    return false;
  }
  return true;
};

export const getChainName = (id) => {
  if (id === 56) {
    return {
      fullName: "Binance Smart Chain Mainnet",
      chainName: "BSC",
    };
  } else if (id === 1) {
    return {
      fullName: "Ethereum Mainnet",
      chainName: "ETH",
    };
  } else if (id === 97) {
    return {
      fullName: "Binance Smart Chain Testnet",
      chainName: "BSC",
    };
  } else {
    return {
      chainName: "Network Error",
      fullName: "Network Error",
    };
  }
};
