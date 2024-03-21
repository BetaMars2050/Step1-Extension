
import { createApp } from 'vue'
import EntranceBtn from '../views/EntranceBtn.vue'
import AirdropIcon from '../views/AirdropIcon.vue'


export const injectStyleLink = () => {
    const styleLink: HTMLElement = document.createElement('link')
    styleLink.setAttribute('rel', 'stylesheet')
    styleLink.setAttribute('href', chrome.runtime.getURL('dist/contentScripts/style.css'))
    document.head.appendChild(styleLink)
}

export const injectEntranceBtn = () => {

    if (document.querySelector('#step1-btn')) return
    const ele: HTMLElement | null = document.querySelector("div.r-e7q0ms");
    if (ele) {
        const div: HTMLElement = document.createElement("div");
        div.setAttribute('style', 'width:100%')
        div.setAttribute("id", "step1-btn");
        ele?.parentNode?.appendChild(div);
        createApp(EntranceBtn).mount("#step1-btn");
    } else {
        setTimeout(() => {
            injectEntranceBtn()
        }, 200);
    }
}

export const injectApp = () => {
    if (document.querySelector('#step1-app')) return
    const iframe: HTMLIFrameElement = document.createElement('iframe')
    iframe.id = 'step1-app'
    iframe.style.display = 'none'
    iframe.src = chrome.runtime.getURL('dist/app/index.html')
    document.body.appendChild(iframe)
}

export const injectAirdropIcon = () => {
    if (document.querySelector('#step1-airdrop-icon')) return
    const div: HTMLElement = document.createElement("div");
    div.setAttribute("id", "step1-toolbar-icon");
    document.querySelector('div[data-testid="toolBar"]')?.children[0]?.appendChild(div)
    createApp(AirdropIcon).mount("#step1-toolbar-icon");
}

export const injectAirdropForm = () => {
    if (document.querySelector('#step1-airdrop')) return
    const iframe: HTMLIFrameElement = document.createElement('iframe')
    iframe.id = 'step1-airdrop'
    iframe.style.display = 'none'
    iframe.src = chrome.runtime.getURL('dist/airdrop/index.html')
    document.body.appendChild(iframe)
}

export const injectConnectWallet = () => {
    if (document.querySelector('#step1-connect-wallet')) return
    const iframe: HTMLIFrameElement = document.createElement('iframe')
    iframe.id = 'step1-connect-wallet'
    iframe.style.display = 'none'
    iframe.src = chrome.runtime.getURL('dist/connectwallet/index.html')
    document.body.appendChild(iframe)

}

export const injectaActivity = ({ id, ele }: { id: string, ele: HTMLElement }) => {
    const iframe: HTMLIFrameElement = document.createElement("iframe");
    const div: HTMLElement = ele.querySelector('div[role="group"]')
    iframe.id = "step1-activity-" + id;
    iframe.className = "step1-activity";
    iframe.setAttribute('scrolling', "no")
    iframe.setAttribute('style', "width: 400px;border:none;height:458px;")
    iframe.src = chrome.runtime.getURL(
        `dist/activity/index.html?activityId=${id}`
    );
    div?.parentNode.insertBefore(iframe, div);
}

const parseTweets = () => {
    let list = [];
    try {
        let content,
            domList = document.querySelectorAll("article") || [];
        for (let dom in domList) {
            content = domList[dom].innerText || "";
            try {
                if (typeof domList[dom] !== "object") break;
                if (
                    (content.includes("#step1") ||
                        compatibleMask(domList[dom], "#step1")) &&
                    !domList[dom]
                        .querySelector('div[role="group"]')
                        .parentNode.querySelector(".step1-activity") &&
                    domList[dom]
                        .querySelector('a[href*="https://t.co/"]')
                        ?.innerText.split("/")[2] === "test1.step1matrix.io"
                ) {
                    let urlArr = domList[dom]
                        .querySelector('a[href*="https://t.co/"]')
                        .innerText.split("/");
                    let id = urlArr[urlArr.length - 1].replace("…", "");
                    list.push({
                        dom: domList[dom],
                        id,
                    });
                }
            } catch (err) {
                console.log("err", err);
            }
        }
    } catch (err) {
        console.log(err);
    }

    return list;
}

const compatibleMask = (ele: HTMLElement, tags: string) => {
    let t = false;
    try {
        let n,
            r = ele.querySelectorAll("span") || [],
            a = [];
        r.forEach((ele) => {
            ele.shadowRoot && a.push(ele.shadowRoot);
        });
        for (let ele in a) {
            if (((n = a[ele].childNodes), t)) break;
            if (n)
                for (let ele in n)
                    if (n[ele].innerText && n[ele].innerText.includes(tags)) {
                        t = !0;
                        break;
                    }
        }
    } catch (n) { }
    return t;
}

const tweetsDomLoop = () => {
    setInterval(async () => {

        try {
            const list = await parseTweets();
            list.forEach((v) => {
                console.log(v);
                if (v.dom.querySelector("#step1-activity-" + v.id))
                    return;
                injectaActivity({ id: v.id, ele: v.dom })
            });
            injectAirdropIcon()

        } catch (err) {
            console.log(err);
        }

    }, 1000)
}

export const injectContent = () => {
    injectStyleLink()
    injectApp()
    injectAirdropForm()
    injectConnectWallet()
    tweetsDomLoop()
    injectEntranceBtn()
}
