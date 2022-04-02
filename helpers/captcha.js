import axios from 'axios';

const apiKey = process.env.API_KEY_2CAPTCHA;

async function submitCaptcha(googleKey, pageUrl) {
  const { data: responseJson } = await axios.post(
    `http://2captcha.com/in.php?key=${apiKey}&method=userrecaptcha&googlekey=${googleKey}&pageurl=${pageUrl}&json=1`
  );
  if (responseJson.status) {
    return responseJson;
  }

  throw new Error(responseJson.error_text);
}

async function getCaptchaResult(captchaId) {
  const { data: responseJson } = await axios.get(`http://2captcha.com/res.php?key=${apiKey}&action=get&id=${captchaId}&json=1`);
  if (responseJson.status) {
    return responseJson;
  }

  throw new Error(responseJson.error_text);
}

const solveCaptcha = async ({ taskLogger, page, captchaSelector, captchaIframeSelector }) => {
  taskLogger.info('Detected captcha, solving');

  if (!apiKey) {
    throw new Error('You must set an API_KEY_2CAPTCHA in your .env file.');
  }

  let context = page;
  if (captchaSelector && captchaIframeSelector) {
    const frameHandle = await page.$(captchaIframeSelector);
    context = await frameHandle.contentFrame();
  }

  const googleKey = await context.evaluate(
    ({ captchaSelector: captchaDivSelectorStr, captchaIframeSelector: captchaIframeSelectorStr }) => {
      const captchaDiv = captchaDivSelectorStr && document.querySelector(captchaDivSelectorStr);
      const iframe = captchaDiv ? captchaDiv.querySelector('iframe') : document.querySelector(captchaIframeSelectorStr);
      const iframeSrc = iframe.getAttribute('src');
      const iframeSrcParams = new URLSearchParams(iframeSrc);
      const kValue = iframeSrcParams.get('k');
      return kValue;
    },
    { captchaSelector, captchaIframeSelector }
  );
  taskLogger.info(`Extracted googleKey ${googleKey}`);

  const captcha = await submitCaptcha(googleKey, context.url());
  const captchaId = captcha.request;
  taskLogger.info(`Submitted captcha to 2captcha, got id ${captchaId}`);

  let solved = false;
  let captchaAnswer;
  while (!solved) {
    try {
      const result = await getCaptchaResult(captchaId);
      if (result && result.request) {
        captchaAnswer = result.request;
        solved = true;
      }
    } catch (err) {
      await page.waitForTimeout(1000);
    }
  }

  if (captchaAnswer) {
    taskLogger.info(`Got captcha result ${captchaAnswer} from 2captcha, submitting`);
    await context.evaluate((captchaAnswerText) => {
      function findRecaptchaClients() {
        if (typeof window.___grecaptcha_cfg !== 'undefined') {
          return Object.entries(window.___grecaptcha_cfg.clients).map(([cid, client]) => {
            const data = { id: cid, version: cid >= 10000 ? 'V3' : 'V2' };
            const objects = Object.entries(client).filter(([, value]) => value && typeof value === 'object');

            objects.forEach(([toplevelKey, toplevel]) => {
              const found = Object.entries(toplevel).find(([, value]) => value && typeof value === 'object' && 'sitekey' in value && 'size' in value);
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
        callbackFunction = window[callbackFunction];
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
};

export default solveCaptcha;
