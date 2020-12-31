const puppeteer = require("puppeteer");
const useProxy = require("puppeteer-page-proxy");

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

exports.guestCheckout = async (
  url,
  proxy,
  styleIndex,
  size,
  shippingAddress,
  shippingSpeedIndex,
  billingAddress,
  cardDetails
) => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ["--start-maximized"]
    });
    const page = await browser.newPage();
    await useProxy(page, proxy);
    await page.goto(url);
    await delay(5000);
    await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
    await delay(5000);

    let isInCart = false;
    let hasCaptcha = false;
    let checkoutComplete = false;
    while (!isInCart && !hasCaptcha) {
      const stylesSelector =
        "div.c-form-field.c-form-field--radio.SelectStyle.col";
      await page.waitForSelector(stylesSelector);
      const styles = await page.$$(stylesSelector);
      await styles[styleIndex].click();
      await delay(5000);

      const sizesSelector = "div.c-form-field.c-form-field--radio.ProductSize";
      await page.waitForSelector(sizesSelector);
      const sizes = await page.$$(sizesSelector);
      for (var i = 0; i < sizes.length; i++) {
        const sizeValue = await sizes[i].$eval("input", el =>
          el.getAttribute("value")
        );
        if (sizeValue == size) {
          await sizes[i].click();
          break;
        }
      }
      await delay(5000);

      const atcButtonSelector =
        "button.Button.Button.ProductDetails-form__action";
      await page.waitForSelector(atcButtonSelector);
      await page.click(atcButtonSelector);
      await delay(1000);

      const catchaSelector =
        "div.ReactModal__Content.ReactModal__Content--after-open.FL.c-modal.large.c-backend-error-modal";
      if (await page.$(catchaSelector)) {
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
      await checkout(
        page,
        shippingAddress,
        shippingSpeedIndex,
        billingAddress,
        cardDetails
      );

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
  billingAddress,
  cardDetails
) {
  try {
    await page.goto("https://footlocker.com/checkout");

    const firstNameSelector = 'input[name="firstName"]';
    const lastNameSelector = 'input[name="lastName"]';
    const emailSelector = 'input[name="email"]';
    const phoneNumberSelector = 'input[name="address.phone"]';
    const submitButtonsSelector = "button.Button";

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
    await page.type(firstNameSelector, address.firstName, {
      delay: 10
    });
    await delay(2000);

    await page.waitForSelector(lastNameSelector);
    await page.type(lastNameSelector, address.lastName, {
      delay: 10
    });
    await delay(2000);

    await page.waitForSelector(emailSelector);
    await page.type(emailSelector, shippingAddress.email, {
      delay: 10
    });
    await delay(2000);

    await page.waitForSelector(phoneNumberSelector);
    await page.type(phoneNumberSelector, shippingAddress.phoneNumber, {
      delay: 10
    });
    await delay(2000);

    await page.waitForSelector(submitButtonsSelector);
    const contactInformationSubmitButtonSelector = await page.$$(
      submitButtonsSelector
    )[0];
    await contactInformationSubmitButtonSelector.click();
    await delay(2000);

    await enterAddressDetails(page, shippingAddress);

    await page.waitForSelector(differentBillingAddressSelector);
    await page.click(differentBillingAddressSelector);
    await delay(2000);

    await page.waitForSelector(shippingSpeedsSelector);
    const shippingSpeeds = await page.$$(shippingSpeedsSelector);
    await shippingSpeeds[shippingSpeedIndex].click();
    await delay(2000);

    const shippingAddressSubmitButtonSelector = await page.$$(
      submitButtonsSelector
    )[1];
    await shippingAddressSubmitButtonSelector.click();
    await delay(2000);

    await page.waitForSelector(cardNumberIframeSelector);
    const cardNumberFrameHandle = await page.$(cardNumberIframeSelector);
    const cardNumberFrame = await cardNumberFrameHandle.contentFrame();
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
    await cardExpirationMonthFrame.type(
      creditCardExpirationMonthSelector,
      String(cardDetails.expirationDate).substring(0, 2),
      {
        delay: 10
      }
    );
    await delay(2000);

    await page.waitForSelector(cardExpYearIframeSelector);
    const cardExpirationYearFrameHandle = await page.$(
      cardExpYearIframeSelector
    );
    const cardExpirationYearFrame = await cardExpirationYearFrameHandle.contentFrame();
    await cardExpirationYearFrame.type(
      creditCardExpirationYearSelector,
      String(cardDetails.expirationDate).substring(2, 4),
      {
        delay: 10
      }
    );
    await delay(2000);

    const cardCVVFrameHandle = await page.$(cardCVVIframeSelector);
    const cardCVVFrame = await cardCVVFrameHandle.contentFrame();
    await cardCVVFrame.type(creditCardCVVSelector, cardDetails.cvv, {
      delay: 10
    });
    await delay(2000);

    await enterAddressDetails(page, billingAddress);

    const billingAddressSubmitButtonSelector = await page.$$(
      submitButtonsSelector
    )[4];
    await billingAddressSubmitButtonSelector.click();
    await delay(2000);

    // const orderSubmitButtonSelector = await page.$$(
    //   submitButtonsSelector
    // )[2];
    // await orderSubmitButtonSelector.click();
    // await delay(2000);
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

    await page.waitForSelector(firstNameSelector);
    await page.type(firstNameSelector, address.firstName, {
      delay: 10
    });
    await delay(2000);

    await page.waitForSelector(lastNameSelector);
    await page.type(lastNameSelector, address.lastName, {
      delay: 10
    });
    await delay(2000);

    await page.waitForSelector(address1Selector);
    await page.type(address1Selector, address.address1, {
      delay: 10
    });
    await delay(2000);

    await page.waitForSelector(address2Selector);
    await page.type(address2Selector, address.address2, {
      delay: 10
    });
    await delay(2000);

    await page.waitForSelector(postalCodeSelector);
    await page.type(postalCodeSelector, address.postalCode, {
      delay: 10
    });
    await delay(2000);

    await page.waitForSelector(citySelector);
    await page.type(citySelector, address.city, {
      delay: 10
    });
    await delay(2000);

    await page.waitForSelector(stateSelector);
    await page.select(stateSelector, address.state);
    await delay(2000);
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
}
