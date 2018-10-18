const reCaptchaSiteKey = '6Lc7wXUUAAAAAMpnW8zzx9a5XCXSpgMZnzYsjejs';

const reCaptchaScript = document.createElement('script');
reCaptchaScript.setAttribute(
  'src',
  'https://www.google.com/recaptcha/api.js?render=' + reCaptchaSiteKey
);
document.head.appendChild(reCaptchaScript);

export const runReCaptcha = () => {
  // eslint-disable-next-line no-undef
  const g = grecaptcha;
  return new Promise(resolve => {
    g.ready(() =>
      g
        .execute(reCaptchaSiteKey, {
          action: 'sign_up'
        })
        .then(token => resolve(token))
    );
  });
};
