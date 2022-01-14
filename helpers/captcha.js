const rp = require('request-promise');

const apiKey = process.env.API_KEY_2CAPTCHA;

async function submitReCAPTCHAV2(googleKey, pageUrl) {
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
    throw err;
  }
}

async function submitGeeTest(gt, challenge, api_server, pageUrl) {
  try {
    const options = {
      uri: `
        http://2captcha.com/in.php?key=${apiKey}&method=geetest&gt=${gt}&challenge=${challenge}&api_server=${api_server}&pageurl=${pageUrl}&json=1
      `,
      method: 'POST'
    };

    const response = await rp(options);
    const responseJson = JSON.parse(response);
    if (responseJson.status) {
      return responseJson;
    }

    throw new Error(responseJson.error_text);
  } catch (err) {
    throw err;
  }
}

async function getCaptchaResult(captchaId) {
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
    throw err;
  }
}

exports.solveReCAPTCHAV2 = async ({
  taskLogger, page, captchaSelector, captchaIframeSelector
}) => {
  try {
    taskLogger.info('Detected captcha, solving');

    if (!apiKey) {
      throw new Error('You must set an API_KEY_2CAPTCHA in your .env file.');
    }

    let context = page;
    if (captchaSelector && captchaIframeSelector) {
      const frameHandle = await page.$(captchaIframeSelector);
      context = await frameHandle.contentFrame();
    }

    const googleKey = await context.evaluate(({ captchaSelector: captchaDivSelectorStr, captchaIframeSelector: captchaIframeSelectorStr }) => {
      const captchaDiv = captchaDivSelectorStr && document.querySelector(captchaDivSelectorStr);
      const iframe = captchaDiv ? captchaDiv.querySelector('iframe') : document.querySelector(captchaIframeSelectorStr);
      const iframeSrc = iframe.getAttribute('src');
      const iframeSrcParams = new URLSearchParams(iframeSrc);
      const kValue = iframeSrcParams.get('k');
      return kValue;
    }, { captchaSelector, captchaIframeSelector });
    taskLogger.info(`Extracted googleKey ${googleKey}`);

    const captcha = await submitReCAPTCHAV2(googleKey, context.url());
    const captchaId = captcha.request;
    taskLogger.info(`Submitted captcha to 2captcha, got id ${captchaId}`);

    let solved = false;
    let captchaAnswer;
    while (!solved) {
      try {
        const result = await getCaptchaResult(captchaId);
        if (result && result.request && result.status !== 0) {
          captchaAnswer = result.request;
          solved = true;
        }
      } catch (err) {
        // no-op
      }
      await page.waitForTimeout(1000);
    }

    if (captchaAnswer) {
      taskLogger.info(`Got captcha result ${captchaAnswer} from 2captcha, submitting`);
      await context.evaluate((captchaAnswerText) => {
        function findRecaptchaClients() {
          if (typeof (window.___grecaptcha_cfg) !== 'undefined') {
            return Object.entries(window.___grecaptcha_cfg.clients).map(([cid, client]) => {
              const data = { id: cid, version: cid >= 10000 ? 'V3' : 'V2' };
              const objects = Object.entries(client).filter(([, value]) => value && typeof value === 'object');

              objects.forEach(([toplevelKey, toplevel]) => {
                const found = Object.entries(toplevel).find(([, value]) => (
                  value && typeof value === 'object' && 'sitekey' in value && 'size' in value
                ));
                if (found) {
                  const [sublevelKey, sublevel] = found;

                  data.sitekey = sublevel.sitekey;
                  const callbackKey = data.version === 'V2' ? 'callback' : 'promise-callback';
                  const callback = sublevel[callbackKey];
                  if (!callback) {
                    data.callback = null;
                    data.function = null;
                  } else {
                    data.function = callback;
                    const keys = [cid, toplevelKey, sublevelKey, callbackKey].map((key) => `['${key}']`).join('');
                    data.callback = `___grecaptcha_cfg.clients${keys}`;
                  }
                }
              });
              return data;
            });
          }
          return [];
        }

        document.querySelector('#g-recaptcha-response').innerHTML = captchaAnswerText;
        const recaptchaClients = findRecaptchaClients();
        const defaultRecaptchaClient = recaptchaClients[0];
        let callbackFunction = defaultRecaptchaClient.callback;

        if (typeof callbackFunction === 'function') {
          callbackFunction(captchaAnswerText);
        } else if (typeof callbackFunction === 'string') {
          callbackFunction = eval(callbackFunction);
          if (typeof callbackFunction === 'function') {
            callbackFunction(captchaAnswerText);
          } else if (typeof callbackFunction === 'string') {
            window[callbackFunction](captchaAnswerText);
          }
        }

        return callbackFunction;
      }, captchaAnswer);
    }
    const submissionSucccess = true;
    return submissionSucccess;
  } catch (err) {
    throw err;
  }
};

exports.solveGeeTest = async ({ taskLogger, page, captchaIframeSelector }) => {
  try {
    taskLogger.info('Detected captcha, solving');

    if (!apiKey) {
      throw new Error('You must set an API_KEY_2CAPTCHA in your .env file.');
    }

    let context = page;
    if (captchaIframeSelector) {
      const frameHandle = await page.$(captchaIframeSelector);
      context = await frameHandle.contentFrame();
    }

    const iframeUrl = context.url();
    taskLogger.info(`Geetest iframe URL: ${iframeUrl}`);
    const pageHtml = await rp(iframeUrl);
    const [api_server, gt, challenge] = pageHtml
      .split('initGeetest({').pop().split('}, handlerEmbed')[0]
      .split(/:|,/)
      .filter((e, i) => i % 2 !== 0)
      .map((val) => val.trim().replace(/'/g, ''));
    taskLogger.info(`Extracted gt ${gt}, challenge ${challenge}, api_server ${api_server}, pageurl=${page.url()}`);

    const captcha = await submitGeeTest(gt, challenge, api_server, page.url());
    const captchaId = captcha.request;
    taskLogger.info(`Submitted captcha to 2captcha, got id ${captchaId}`);

    let solved = false;
    let captchaAnswer;
    while (!solved) {
      try {
        const result = await getCaptchaResult(captchaId);
        if (result && result.request && result.status !== 0) {
          captchaAnswer = result.request;
          solved = true;
        }
      } catch (err) {
        // no-op
      }
      await page.waitForTimeout(1000);
    }

    if (captchaAnswer) {
      taskLogger.info(`Got captcha result ${JSON.stringify(captchaAnswer)} from 2captcha, submitting`);

      await context.evaluate((captchaAnswerObj) => {
        window.geetestResponse = captchaAnswerObj;
        window.captchaCallback();
      }, captchaAnswer);
    }
    const submissionSucccess = true;
    return submissionSucccess;
  } catch (err) {
    throw err;
  }
};
