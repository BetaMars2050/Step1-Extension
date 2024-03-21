<script setup  lang="ts" >
import { sendChromeMessage } from '../../plugins/chromeService'

const open = async () => {

  chrome.storage.local.get(["st"], function (result) {
    console.log(result, "result");
    if (result?.st) {
      const dialog = document.querySelector("#step1-connect-wallet") as HTMLElement;
      dialog.style.display = "block";
    } else {
      window.open(
        "https://twitter.com/i/oauth2/authorize?response_type=code&client_id=TkE5Q25VSThyaURpbHgtd2NjaHA6MTpjaQ&redirect_uri=https://test1.step1matrix.io/auth&scope=tweet.read offline.access users.read follows.read space.read mute.read like.read list.read block.read bookmark.read&state=state&code_challenge=challenge&code_challenge_method=plain"
      );
    }
  });

};

</script>

<template>
  <div class="step1-entrance" @click="open">Step1</div>
</template>

<style lang="scss" scoped>
.step1-entrance {
  width: 90%;
  height: 52px;
  text-align: center;
  line-height: 52px;
  margin-bottom: 4px;
  margin-top: 4px;
  background-image: linear-gradient(to right,
      rgba($color: #00ffbd, $alpha: 1) 0%,
      #3e97ff 100%);

  box-shadow: 0 4px 10px 0 rgba(49, 196, 190, 0.55);
  color: rgb(255, 255, 255);
  font-size: 17px;
  font-weight: 700;
  border-radius: 100px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
