export const twLogin = () => {
  window.open(
    "https://twitter.com/i/oauth2/authorize?response_type=code&client_id=TkE5Q25VSThyaURpbHgtd2NjaHA6MTpjaQ&redirect_uri=https://test1.step1matrix.io/auth&scope=tweet.read offline.access users.read follows.read space.read mute.read like.read list.read block.read bookmark.read&state=state&code_challenge=challenge&code_challenge_method=plain"
  );
};
