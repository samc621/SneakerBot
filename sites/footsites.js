const useProxy = require("puppeteer-page-proxy");

exports.getCaptchaSelector = () => {
  return "div.ReactModal__Content.ReactModal__Content--after-open.FL.c-modal.large.c-backend-error-modal";
};

exports.guestCheckout = async (
  page,
  url,
  proxyString,
  styleIndex,
  size,
  shippingAddress,
  shippingSpeedIndex,
  billingAddress
) => {
  try {
    await useProxy(page, proxyString);
    await page.goto(url);
    await pageWait(5000);
    await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
    await pageWait(2000);

    let isInCart = false;
    let hasCaptcha = false;
    let checkoutComplete = false;
    while (!isInCart && !hasCaptcha) {
      const stylesSelector =
        "div.c-form-field.c-form-field--radio.SelectStyle.col";
      await page.waitForSelector(stylesSelector);
      const styles = await page.$$(stylesSelector);
      await styles[styleIndex].click();
      await pageWait(2000);

      const sizesSelector = "div.c-form-field.c-form-field--radio.ProductSize";
      await page.waitForSelector(sizesSelector);
      const sizes = await page.$$(sizesSelector);
      for (var i = 0; i < sizes.length; i++) {
        const sizeValue = await sizes[i].$eval("input", el =>
          el.getAttribute("value")
        );
        const parsedSize = isNaN(size) ? sizeValue : Number(sizeValue);
        if (parsedSize == size) {
          await sizes[i].click();
          break;
        }
      }
      await pageWait(2000);

      const atcButtonSelector =
        "button.Button.Button.ProductDetails-form__action";
      await page.waitForSelector(atcButtonSelector);
      await page.click(atcButtonSelector);
      await pageWait(2000);

      const captchaSelector = this.getCaptchaSelector();
      if (await page.$(captchaSelector)) {
        hasCaptcha = true;
        break;
      }

      const cartSelector = "span.CartCount-badge";
      let cart = await page.$$(cartSelector);
      cart = cart.pop();
      let cartCount = cart ? await cart.getProperty("innerText") : null;
      cartCount = cartCount ? await cartCount.jsonValue() : 0;
      if (cartCount == 1) {
        isInCart = true;
      }
    }

    if (isInCart) {
      await checkout(page, shippingAddress, shippingSpeedIndex, billingAddress);

      const cartSelector = "span.CartCount-badge";
      let cart = await page.$$(cartSelector);
      cart = cart.pop();
      let cartCount = cart ? await cart.getProperty("innerText") : null;
      cartCount = cartCount ? await cartCount.jsonValue() : 0;
      if (cartCount == 0) {
        checkoutComplete = true;
      }
    }

    return { isInCart, hasCaptcha, checkoutComplete };
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
};

async function checkout(
  page,
  shippingAddress,
  shippingSpeedIndex,
  billingAddress
) {
  try {
    const cardDetails = {
      cardNumber: process.env.CARD_NUMBER,
      expirationMonth: process.env.EXPIRATION_MONTH,
      expirationYear: process.env.EXPIRATION_YEAR,
      securityCode: process.env.SECURITY_CODE
    };

    await page.goto("https://footlocker.com/checkout");

    const firstNameSelector = 'input[name="firstName"]';
    const lastNameSelector = 'input[name="lastName"]';
    const emailSelector = 'input[name="email"]';
    const phoneNumberSelector = 'input[name="phone"]';
    const submitButtonsSelector = "button.Button";

    const shippingSpeedsAvailableSelector =
      "button#DeliveryOptions_selectCustom_deliveryModeId";
    const shippingSpeedsSelector = "li.SelectCustom-option";

    const cardNumberIframeSelector =
      "span[data-cse=encryptedCardNumber] iframe";
    const creditCardNumberSelector = "input#encryptedCardNumber";
    const cardExpMonthIframeSelector =
      "span[data-cse=encryptedExpiryMonth] iframe";
    const creditCardExpirationMonthSelector = "input#encryptedExpiryMonth";
    const cardExpYearIframeSelector =
      "span[data-cse=encryptedExpiryYear] iframe";
    const creditCardExpirationYearSelector = "input#encryptedExpiryYear";
    const cardCVVIframeSelector = "span[data-cse=encryptedSecurityCode] iframe";
    const creditCardCVVSelector = "input#encryptedSecurityCode";

    const differentBillingAddressSelector =
      "label[for=ShippingAddress_checkbox_setAsBilling]";

    await page.waitForSelector(firstNameSelector);
    await page.type(firstNameSelector, shippingAddress.first_name, {
      delay: 10
    });
    await pageWait(2000);

    await page.waitForSelector(lastNameSelector);
    await page.type(lastNameSelector, shippingAddress.last_name, {
      delay: 10
    });
    await pageWait(2000);

    await page.waitForSelector(emailSelector);
    await page.type(emailSelector, shippingAddress.email_address, {
      delay: 10
    });
    await pageWait(2000);

    await page.waitForSelector(phoneNumberSelector);
    await page.type(phoneNumberSelector, shippingAddress.phone_number, {
      delay: 10
    });
    await pageWait(2000);

    await page.waitForSelector(submitButtonsSelector);
    const contactInformationSubmitButtonSelector = await page.$$(
      submitButtonsSelector
    );
    await contactInformationSubmitButtonSelector[0].click();
    await pageWait(2000);

    await enterAddressDetails(page, shippingAddress);

    await page.waitForSelector(differentBillingAddressSelector);
    await page.click(differentBillingAddressSelector);
    await pageWait(2000);

    const shippingSpeedsAvailable = (await page.$(
      shippingSpeedsAvailableSelector
    ))
      ? true
      : false;
    if (shippingSpeedsAvailable) {
      await page.click(shippingSpeedsAvailableSelector);
      await page.waitForSelector(shippingSpeedsSelector);
      const shippingSpeeds = await page.$$(shippingSpeedsSelector);
      await shippingSpeeds[shippingSpeedIndex].click();
      await pageWait(2000);
    }

    await page.waitForSelector(submitButtonsSelector);
    const shippingAddressSubmitButtonSelector = await page.$$(
      submitButtonsSelector
    );
    await shippingAddressSubmitButtonSelector[1].click();
    await pageWait(2000);

    await page.waitForSelector(submitButtonsSelector);
    const shippingAddressSubmitButtonTwoSelector = await page.$$(
      submitButtonsSelector
    );
    await shippingAddressSubmitButtonTwoSelector[3].click();
    await pageWait(2000);

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
    await pageWait(2000);

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
    await pageWait(2000);

    const cardCVVFrameHandle = await page.$(cardCVVIframeSelector);
    const cardCVVFrame = await cardCVVFrameHandle.contentFrame();
    await cardCVVFrame.type(creditCardCVVSelector, cardDetails.securityCode, {
      delay: 10
    });
    await pageWait(2000);

    await enterAddressDetails(page, billingAddress);

    const billingAddressSubmitButtonSelector = await page.$$(
      submitButtonsSelector
    );
    await billingAddressSubmitButtonSelector[4].click();
    await pageWait(2000);

    const orderSubmitButtonSelector = await page.$$(submitButtonsSelector);
    await orderSubmitButtonSelector[2].click();
    await pageWait(5000);
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
}

async function enterAddressDetails(page, address) {
  try {
    const firstNameSelector = 'input[name="firstName"]';
    const lastNameSelector = 'input[name="lastName"]';
    const address1Selector = 'input[name="line1"]';
    const address2Selector = 'input[name="line2"]';
    const citySelector = 'input[name="town"]';
    const stateSelector = 'select[name="region"]';
    const postalCodeSelector = 'input[name="postalCode"]';

    const firstNameHandle = await page.$(firstNameSelector);
    await firstNameHandle.click();
    await firstNameHandle.focus();
    await firstNameHandle.click({ clickCount: 3 });
    await firstNameHandle.press("Backspace");

    await page.waitForSelector(firstNameSelector);
    await page.type(firstNameSelector, address.first_name, {
      delay: 10
    });
    await pageWait(2000);

    const lastNameHandle = await page.$(lastNameSelector);
    await lastNameHandle.click();
    await lastNameHandle.focus();
    await lastNameHandle.click({ clickCount: 3 });
    await lastNameHandle.press("Backspace");

    await page.waitForSelector(lastNameSelector);
    await page.type(lastNameSelector, address.last_name, {
      delay: 10
    });
    await pageWait(2000);

    await page.waitForSelector(address1Selector);
    await page.type(address1Selector, address.address_line_1, {
      delay: 10
    });
    await pageWait(2000);

    await page.waitForSelector(address2Selector);
    await page.type(address2Selector, address.address_line_2, {
      delay: 10
    });
    await pageWait(2000);

    await page.waitForSelector(postalCodeSelector);
    await page.type(postalCodeSelector, address.postal_code, {
      delay: 10
    });
    await pageWait(2000);

    // Prefilled by footsites

    // await page.waitForSelector(citySelector);
    // await page.type(citySelector, address.city, {
    //   delay: 10
    // });
    // await pageWait(2000);

    // await page.waitForSelector(stateSelector);
    // await page.select(stateSelector, address.state);
    // await pageWait(2000);
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
}
