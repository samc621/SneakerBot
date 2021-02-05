const rp = require('request-promise');

const apiKey = process.env.API_KEY_2CAPTCHA;

const submitCaptcha = async (googleKey, pageUrl) => {
  try {
    const options = {
      uri: `http://2captcha.com/in.php?key=${apiKey}&method=userrecaptcha&googlekey=${googleKey}&pageurl=${pageUrl}&json=1`,
      method: 'POST'
    };

    const response = await rp(options);
    const responseJson = JSON.parse(response);
    if (responseJson.status) {
      return responseJson;
    }

    throw new Error(responseJson.error_text);
  } catch (err) {
    throw new Error(err);
  }
};

const getCaptchaResult = async (captchaId) => {
  try {
    const options = {
      uri: `http://2captcha.com/res.php?key=${apiKey}&action=get&id=${captchaId}&json=1`,
      method: 'GET'
    };

    const response = await rp(options);
    const responseJson = JSON.parse(response);
    if (responseJson.status) {
      return responseJson;
    }

    throw new Error(responseJson.error_text);
  } catch (err) {
    throw new Error(err);
  }
};

exports.solveCaptcha = async (page, captchaSelector, captchaIframeSelector) => {
  try {
    console.log('detected captcha, solving');

    if (!apiKey) {
      throw new Error('You must set an API_KEY_2CAPTCHA in your .env file.');
    }

    let context = page;
    if (captchaIframeSelector) {
      const frameHandle = await page.$(captchaIframeSelector);
      context = await frameHandle.contentFrame();
    }

    const googleKey = await context.evaluate((captchaDivSelector) => {
      const captchaDiv = document.querySelector(captchaDivSelector);
      const iframe = captchaDiv.querySelector('iframe');
      const iframeSrc = iframe.getAttribute('src');
      const iframeSrcParams = new URLSearchParams(iframeSrc);
      const kValue = iframeSrcParams.get('k');
      return kValue;
    }, captchaSelector);
    console.log('extracted googleKey ', googleKey);

    const captcha = await submitCaptcha(googleKey, context.url());
    const captchaId = captcha.request;
    console.log('submitted captcha to 2captcha, got id ', captchaId);

    await new Promise((resolve) => {
      const interval = setInterval(async () => {
        let solvedCaptcha;
        try {
          solvedCaptcha = await getCaptchaResult(captchaId);
        } catch (err) {
          // no-op if captcha is still unsolved
        }
        const captchaAnswer = solvedCaptcha && solvedCaptcha.request;

        if (captchaAnswer) {
          console.log('got captcha result from 2captcha');
          await context.evaluate((captchaAnswerText) => {
            document.querySelector('#g-recaptcha-response').innerHTML = captchaAnswerText;
            const callbackFunction = ___grecaptcha_cfg.clients['0'].K.K.callback;
            if (typeof callbackFunction === 'function') {
              callbackFunction(captchaAnswerText);
            } else if (typeof callbackFunction === 'string') {
              window[callbackFunction](captchaAnswerText);
            }
          }, captchaAnswer);
          resolve();
          clearInterval(interval);
        }
      }, 1000);
    });

    const solved = true;
    return solved;
  } catch (err) {
    throw new Error(err.message);
  }
};
