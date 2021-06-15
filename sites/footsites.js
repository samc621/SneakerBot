const { solveCaptcha } = require('../helpers/captcha');
const { sendEmail } = require('../helpers/email');
const { getCardDetailsByFriendlyName } = require('../helpers/credit-cards');

async function enterAddressDetails({ page, address }) {
  try {
    const firstNameSelector = 'input[name="firstName"]';
    const lastNameSelector = 'input[name="lastName"]';
    const address1Selector = 'input[name="line1"]';
    const address2Selector = 'input[name="line2"]';
    // const citySelector = 'input[name="town"]';
    // const stateSelector = 'select[name="region"]';
    const postalCodeSelector = 'input[name="postalCode"]';

    const firstNameHandle = await page.$(firstNameSelector);
    await firstNameHandle.click();
    await firstNameHandle.focus();
    await firstNameHandle.click({ clickCount: 3 });
    await firstNameHandle.press('Backspace');

    await page.waitForSelector(firstNameSelector);
    await page.type(firstNameSelector, address.first_name, {
      delay: 10
    });
    await page.waitForTimeout(2000);

    const lastNameHandle = await page.$(lastNameSelector);
    await lastNameHandle.click();
    await lastNameHandle.focus();
    await lastNameHandle.click({ clickCount: 3 });
    await lastNameHandle.press('Backspace');

    await page.waitForSelector(lastNameSelector);
    await page.type(lastNameSelector, address.last_name, {
      delay: 10
    });
    await page.waitForTimeout(2000);

    await page.waitForSelector(address1Selector);
    await page.type(address1Selector, address.address_line_1, {
      delay: 10
    });
    await page.waitForTimeout(2000);

    await page.waitForSelector(address2Selector);
    await page.type(address2Selector, address.address_line_2, {
      delay: 10
    });
    await page.waitForTimeout(2000);

    await page.waitForSelector(postalCodeSelector);
    await page.type(postalCodeSelector, address.postal_code, {
      delay: 10
    });
    await page.waitForTimeout(2000);

    // Prefilled by footsites

    // await page.waitForSelector(citySelector);
    // await page.type(citySelector, address.city, {
    //   delay: 10
    // });
    // await page.waitForTimeout(2000);

    // await page.waitForSelector(stateSelector);
    // await page.select(stateSelector, address.state);
    // await page.waitForTimeout(2000);
  } catch (err) {
    throw err;
  }
}

async function checkout({
  taskLogger,
  page,
  domain,
  shippingAddress,
  shippingSpeedIndex,
  billingAddress,
  cardFriendlyName
}) {
  try {
    let cardDetails = {
      cardNumber: process.env.CARD_NUMBER,
      nameOnCard: process.env.NAME_ON_CARD,
      expirationMonth: process.env.EXPIRATION_MONTH,
      expirationYear: process.env.EXPIRATION_YEAR,
      securityCode: process.env.SECURITY_CODE
    };
    if (cardFriendlyName) {
      cardDetails = getCardDetailsByFriendlyName(cardFriendlyName);
    }

    taskLogger.info('Navigating to checkout page');
    await page.goto(`${domain}/checkout`, { waitUntil: 'domcontentloaded' });

    const firstNameSelector = 'input[name="firstName"]';
    const lastNameSelector = 'input[name="lastName"]';
    const emailSelector = 'input[name="email"]';
    const phoneNumberSelector = 'input[name="phone"]';
    const submitButtonsSelector = 'button.Button';

    const shippingSpeedsAvailableSelector = 'button#DeliveryOptions_selectCustom_deliveryModeId';
    const shippingSpeedsSelector = 'li.SelectCustom-option';

    const cardNumberIframeSelector = 'span[data-cse=encryptedCardNumber] iframe';
    const creditCardNumberSelector = 'input#encryptedCardNumber';
    const cardExpMonthIframeSelector = 'span[data-cse=encryptedExpiryMonth] iframe';
    const creditCardExpirationMonthSelector = 'input#encryptedExpiryMonth';
    const cardExpYearIframeSelector = 'span[data-cse=encryptedExpiryYear] iframe';
    const creditCardExpirationYearSelector = 'input#encryptedExpiryYear';
    const cardCVVIframeSelector = 'span[data-cse=encryptedSecurityCode] iframe';
    const creditCardCVVSelector = 'input#encryptedSecurityCode';

    const differentBillingAddressSelector = 'label[for=ShippingAddress_checkbox_setAsBilling]';

    await page.waitForSelector(firstNameSelector);
    await page.type(firstNameSelector, shippingAddress.first_name, {
      delay: 10
    });
    await page.waitForTimeout(2000);

    await page.waitForSelector(lastNameSelector);
    await page.type(lastNameSelector, shippingAddress.last_name, {
      delay: 10
    });
    await page.waitForTimeout(2000);

    await page.waitForSelector(emailSelector);
    await page.type(emailSelector, shippingAddress.email_address, {
      delay: 10
    });
    await page.waitForTimeout(2000);

    await page.waitForSelector(phoneNumberSelector);
    await page.type(phoneNumberSelector, shippingAddress.phone_number, {
      delay: 10
    });
    await page.waitForTimeout(2000);

    await page.waitForSelector(submitButtonsSelector);
    const contactInformationSubmitButtonSelector = await page.$$(
      submitButtonsSelector
    );
    await contactInformationSubmitButtonSelector[0].click();
    await page.waitForTimeout(2000);

    taskLogger.info('Entering shipping details');
    await enterAddressDetails({ page, address: shippingAddress });

    await page.waitForSelector(differentBillingAddressSelector);
    await page.click(differentBillingAddressSelector);
    await page.waitForTimeout(2000);

    const shippingSpeedsAvailable = await page.$(
      shippingSpeedsAvailableSelector
    );
    if (shippingSpeedsAvailable) {
      taskLogger.info('Selecting desired shipping speed');
      await page.click(shippingSpeedsAvailableSelector);
      await page.waitForSelector(shippingSpeedsSelector);
      const shippingSpeeds = await page.$$(shippingSpeedsSelector);
      await shippingSpeeds[shippingSpeedIndex].click();
      await page.waitForTimeout(2000);
    }

    await page.waitForSelector(submitButtonsSelector);
    const shippingAddressSubmitButtonSelector = await page.$$(
      submitButtonsSelector
    );
    await shippingAddressSubmitButtonSelector[1].click();
    await page.waitForTimeout(2000);

    await page.waitForSelector(submitButtonsSelector);
    const shippingAddressSubmitButtonTwoSelector = await page.$$(
      submitButtonsSelector
    );
    await shippingAddressSubmitButtonTwoSelector[3].click();
    await page.waitForTimeout(2000);

    taskLogger.info('Entering card details');
    await page.waitForSelector(cardNumberIframeSelector);
    const cardNumberFrameHandle = await page.$(cardNumberIframeSelector);
    const cardNumberFrame = await cardNumberFrameHandle.contentFrame();
    await cardNumberFrame.waitForSelector(creditCardNumberSelector);
    await cardNumberFrame.type(
      creditCardNumberSelector,
      cardDetails.cardNumber,
      {
        delay: 10
      }
    );

    await page.waitForSelector(cardExpMonthIframeSelector);
    const cardExpirationMonthFrameHandle = await page.$(
      cardExpMonthIframeSelector
    );
    const cardExpirationMonthFrame = await cardExpirationMonthFrameHandle.contentFrame();
    await cardExpirationMonthFrame.waitForSelector(
      creditCardExpirationMonthSelector
    );
    await cardExpirationMonthFrame.type(
      creditCardExpirationMonthSelector,
      cardDetails.expirationMonth,
      {
        delay: 10
      }
    );
    await page.waitForTimeout(2000);

    await page.waitForSelector(cardExpYearIframeSelector);
    const cardExpirationYearFrameHandle = await page.$(
      cardExpYearIframeSelector
    );
    const cardExpirationYearFrame = await cardExpirationYearFrameHandle.contentFrame();
    await cardExpirationYearFrame.waitForSelector(
      creditCardExpirationYearSelector
    );
    await cardExpirationYearFrame.type(
      creditCardExpirationYearSelector,
      cardDetails.expirationYear,
      {
        delay: 10
      }
    );
    await page.waitForTimeout(2000);

    const cardCVVFrameHandle = await page.$(cardCVVIframeSelector);
    const cardCVVFrame = await cardCVVFrameHandle.contentFrame();
    await cardCVVFrame.type(creditCardCVVSelector, cardDetails.securityCode, {
      delay: 10
    });
    await page.waitForTimeout(2000);

    taskLogger.info('Entering billing details');
    await enterAddressDetails({ page, address: billingAddress });

    const billingAddressSubmitButtonSelector = await page.$$(
      submitButtonsSelector
    );
    await billingAddressSubmitButtonSelector[4].click();
    await page.waitForTimeout(2000);

    taskLogger.info('Clicking order submit button');
    const orderSubmitButtonSelector = await page.$$(submitButtonsSelector);
    await orderSubmitButtonSelector[2].click();
    await page.waitForTimeout(5000);
  } catch (err) {
    throw err;
  }
}

async function closeModal({ taskLogger, page }) {
  try {
    const modalSelector = 'div#bluecoreActionScreen';
    await page.waitForSelector(modalSelector, { visible: true });
    const modal = await page.$(modalSelector);
    taskLogger.info('Closing modal');
    await modal.evaluate(() => {
      document.querySelector('button.closeButtonWhite').click();
    });
  } catch (err) {
    throw err;
  }
}

async function searchByProductCode({
  taskLogger,
  page,
  productCode,
  domain
}) {
  taskLogger.info('Searching for product by product code');
  let searchResult;
  while (!searchResult) {
    await page.goto(`${domain}/search?query=${productCode}`, { waitUntil: 'domcontentloaded' });
    await Promise.all([
      (async () => {
        try {
          searchResult = await page.waitForSelector('.SearchResults .ProductCard a.ProductCard-link', { timeout: 5 * 1000 });
          taskLogger.info('Found search result, clicking');
          await searchResult.click();
        } catch (err) {
          // no-op
        }
      })(),
      (async () => {
        try {
          searchResult = await page.waitForSelector('#ProductDetails', { timeout: 5 * 1000 });
          taskLogger.info('Navigated to product details page');
        } catch (err) {
          // no-op
        }
      })()
    ]);
  }
}

exports.guestCheckout = async ({
  taskLogger,
  page,
  url,
  productCode,
  styleIndex,
  size,
  shippingAddress,
  shippingSpeedIndex,
  billingAddress,
  autoSolveCaptchas,
  notificationEmailAddress,
  cardFriendlyName
}) => {
  try {
    let isInCart = false;
    let hasCaptcha = false;
    let checkoutComplete = false;

    const domain = url.split('/').slice(0, 3).join('/');

    closeModal({ taskLogger, page });

    if (productCode) {
      await searchByProductCode({
        taskLogger,
        page,
        productCode,
        domain
      });
    } else {
      taskLogger.info('No product code supplied, navigating to URL');
      await page.goto(url, { waitUntil: 'domcontentloaded' });
    }

    while (!isInCart && !hasCaptcha) {
      if (page.url() !== url) {
        await page.goto(url, { waitUntil: ['load', 'domcontentloaded'] });
      }

      // using timeout 0 in case we are caught in queue...will wait for the selector to appear
      taskLogger.info('Selecting style');
      const stylesSelector = 'div.c-form-field.c-form-field--radio.SelectStyle.col';
      await page.waitForSelector(stylesSelector, { timeout: 0 });
      const styles = await page.$$(stylesSelector);
      await styles[styleIndex].click();
      taskLogger.info('Selected style');
      await page.waitForTimeout(2000);

      taskLogger.info('Selecting size');
      const sizesSelector = 'div.c-form-field.c-form-field--radio.ProductSize';
      await page.waitForSelector(sizesSelector);
      await page.waitForFunction(({ selector, sizeStr }) => {
        const sizeDivs = Array.from(document.querySelectorAll(selector));
        const matchingSizeDiv = sizeDivs.find((el) => new RegExp(sizeStr, 'i').test(el.innerText));
        const matchingSizeInput = matchingSizeDiv && matchingSizeDiv.querySelector('input');
        if (matchingSizeInput) {
          matchingSizeInput.click();
          return true;
        }
        return false;
      }, {}, { selector: sizesSelector, sizeStr: size });
      taskLogger.info('Selected size');
      await page.waitForTimeout(2000);

      const atcButtonSelector = 'button.Button.Button.ProductDetails-form__action';
      await page.waitForSelector(atcButtonSelector, { timeout: 0 });
      await page.click(atcButtonSelector);
      await page.waitForTimeout(2000);

      const captchaIframeSelector = 'iframe#dataDomeCaptcha';
      const captchaSelector = 'div.g-recaptcha';
      const cartSelector = 'span.CartCount-badge';

      await Promise.race([
        (async () => {
          try {
            hasCaptcha = await page.waitForSelector(captchaIframeSelector, { timeout: 10 * 1000 });
          } catch (err) {
            // no-op if timeout occurs
          }
        })(),
        (async () => {
          try {
            await page.waitForSelector(cartSelector, { timeout: 5 * 1000 });
          } catch (err) {
            taskLogger.info('Retrying clicking ATC button');
            await page.click(atcButtonSelector);
            await page.waitForTimeout(2000);
          }

          taskLogger.info('Checking if ATC was successful');
          const cartCount = await page.evaluate((cartTextSelector) => {
            const elem = document.querySelector(cartTextSelector);
            return (elem && elem.innerText) || '0';
          }, cartSelector);

          if (parseInt(cartCount) === 1) {
            isInCart = true;
          }
        })()
      ]);

      if (hasCaptcha) {
        if (autoSolveCaptchas) {
          const solved = await solveCaptcha({
            taskLogger, page, captchaSelector, captchaIframeSelector
          });
          if (solved) hasCaptcha = false;
        } else {
          taskLogger.info('Detected captcha for manual solving');
          const recipient = notificationEmailAddress;
          const subject = 'Checkout task unsuccessful';
          const text = `The checkout task for ${url} size ${size} has a captcha. Please open the browser and complete it within 5 minutes.`;
          await sendEmail(recipient, subject, text);
          taskLogger.info(text);

          try {
            await page.waitForSelector(captchaIframeSelector, {
              hidden: true,
              timeout: 5 * 60 * 1000
            });
            hasCaptcha = false;
          } catch (err) {
            throw new Error('The captcha was not solved in time.');
          }
        }

        await page.waitForTimeout(2000);
        taskLogger.info('Need to restart task');
      }
    }

    if (isInCart) {
      await checkout({
        taskLogger, page, domain, shippingAddress, shippingSpeedIndex, billingAddress, cardFriendlyName
      });

      const cartSelector = 'span.CartCount-badge';
      await page.waitForSelector(cartSelector);
      const cartCount = await page.evaluate((cartTextSelector) => {
        return document.querySelector(cartTextSelector).innerText;
      }, cartSelector);

      if (parseInt(cartCount) === 0) {
        checkoutComplete = true;
      }
    }

    return checkoutComplete;
  } catch (err) {
    throw err;
  }
};
