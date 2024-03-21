<script setup lang="ts">

const showAirdrop = () => {

  chrome.storage.local.get(["st"], function (result) {
    console.log(result, "result");
    if (result?.st) {
      const app = document.querySelector("#step1-airdrop") as HTMLElement;
  app.style.display = "block";
    } else {
      window.open(
        "https://twitter.com/i/oauth2/authorize?response_type=code&client_id=TkE5Q25VSThyaURpbHgtd2NjaHA6MTpjaQ&redirect_uri=https://test1.step1matrix.io/auth&scope=tweet.read offline.access users.read follows.read space.read mute.read like.read list.read block.read bookmark.read&state=state&code_challenge=challenge&code_challenge_method=plain"
      );
    }
  });


};
</script>

<template>
  <div id="step1-airdrop-icon" @click.stop="showAirdrop">
    <span i-material-symbols-view-in-ar-outline-rounded></span>
  </div>
</template>
<style lang="scss" scoped>
#step1-airdrop-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;

  span {
    font-size: 18px;
    color: rgb(29, 155, 240);
  }
}

#step1-airdrop-icon:hover {
  background-color: rgba(29, 155, 240, 0.1);
}
</style>
