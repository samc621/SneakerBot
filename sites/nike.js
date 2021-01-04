const useProxy = require("puppeteer-page-proxy");
const { delay } = require("../helpers/delay");

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
    await delay(2000);

    let isInCart = false;
    let checkoutComplete = false;
    while (!isInCart) {
      const stylesSelector = "div.colorway-product-overlay";
      await page.waitForSelector(stylesSelector);
      const styles = await page.$$(stylesSelector);
      await styles[styleIndex].click();
      await delay(2000);

      const sizesSelector = "div.mt2-sm div";
      await page.waitForSelector(sizesSelector);
      const sizes = await page.$$(sizesSelector);
      for (var i = 0; i < sizes.length; i++) {
        const sizeValue = await sizes[i].$eval("input", el =>
          el.getAttribute("value")
        );
        if (sizeValue.endsWith(size)) {
          await sizes[i].click();
          break;
        }
      }
      await delay(2000);

      const atcButtonSelector =
        "button.ncss-btn-primary-dark.btn-lg.add-to-cart-btn";
      await page.waitForSelector(atcButtonSelector);
      await page.click(atcButtonSelector);
      await delay(2000);

      const cartSelector =
        "span.pre-jewel.pre-cart-jewel.text-color-primary-dark";
      let cart = await page.$$(cartSelector);
      cart = cart.pop();
      let cartCount = await cart.getProperty("innerText");
      cartCount = await cartCount.jsonValue();
      if (cartCount == 1) {
        isInCart = true;
      }
    }

    if (isInCart) {
      await checkout(page, shippingAddress, shippingSpeedIndex, billingAddress);

      const cartSelector = "span.va-sm-m.fs12-sm.ta-sm-c";
      let cart = await page.$$(cartSelector);
      cart = cart.pop();
      let cartCount = cart ? await cart.getProperty("innerText") : null;
      cartCount = cartCount ? await cartCount.jsonValue() : 0;
      if (cartCount == 0) {
        checkoutComplete = true;
      }
    }

    return { isInCart, checkoutComplete };
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

    await page.goto("https://nike.com/checkout");

    const enterAddressManuallyButtonSelector = "a#addressSuggestionOptOut";
    const address2ExpandButtonSelector = "button[aria-controls=address2]";
    const emailSelector = 'input[name="address.email"]';
    const phoneNumberSelector = 'input[name="address.phoneNumber"]';
    const shippingAddressSubmitButtonSelector =
      "button.js-next-step.saveAddressBtn";

    const shippingSpeedsSelector = "div.shippingOptionsSelectorContainer";
    const shippingSpeedSubmitButtonSelector =
      "button.js-next-step.continuePaymentBtn";

    const cardDetailsIframeSelector =
      "iframe.credit-card-iframe.mt1.u-full-width.prl2-sm";
    const creditCardNumberSelector = "input#creditCardNumber";
    const creditCardExpirationDateSelector = "input#expirationDate";
    const creditCardCVVSelector = "input#cvNumber";

    const differentBillingAddressSelector = "label[for=billingAddress]";
    const billingAddressSubmitButtonSelector =
      "button[data-attr=continueToOrderReviewBtn]";

    const orderSubmitButtonSelector =
      "button.d-lg-ib.d-sm-h.fs14-sm.ncss-brand.ncss-btn-accent.pb2-lg.pb3-sm.prl5-sm.pt2-lg.pt3-sm.u-uppercase";

    await page.waitForSelector(enterAddressManuallyButtonSelector);
    await page.click(enterAddressManuallyButtonSelector);
    await delay(2000);

    await page.waitForSelector(address2ExpandButtonSelector);
    await page.click(address2ExpandButtonSelector);
    await delay(2000);

    await enterAddressDetails(page, shippingAddress);

    await page.waitForSelector(emailSelector);
    await page.type(emailSelector, shippingAddress.email_address, {
      delay: 10
    });
    await delay(2000);

    await page.waitForSelector(phoneNumberSelector);
    await page.type(phoneNumberSelector, shippingAddress.phone_number, {
      delay: 10
    });
    await delay(2000);

    await page.waitForSelector(shippingAddressSubmitButtonSelector);
    await page.click(shippingAddressSubmitButtonSelector);
    await delay(2000);

    await page.waitForSelector(shippingSpeedsSelector);
    const shippingSpeeds = await page.$$(shippingSpeedsSelector);
    await shippingSpeeds[shippingSpeedIndex].click();
    await delay(2000);

    await page.waitForSelector(shippingSpeedSubmitButtonSelector);
    await page.click(shippingSpeedSubmitButtonSelector);
    await delay(2000);

    await page.waitForSelector(cardDetailsIframeSelector);
    const frameHandle = await page.$(cardDetailsIframeSelector);
    const frame = await frameHandle.contentFrame();

    await frame.type(creditCardNumberSelector, cardDetails.cardNumber, {
      delay: 10
    });

    // strange bug with Nike, have to enter the last three digits of the card number twice
    const last3 = String(cardDetails.cardNumber).substr(
      cardDetails.cardNumber.length - 3
    );
    await frame.type(creditCardNumberSelector, last3, {
      delay: 10
    });
    await delay(2000);

    await frame.type(
      creditCardExpirationDateSelector,
      String(cardDetails.expirationMonth).concat(cardDetails.expirationYear),
      {
        delay: 10
      }
    );
    await delay(2000);

    await frame.type(creditCardCVVSelector, cardDetails.securityCode, {
      delay: 10
    });
    await delay(2000);

    await page.waitForSelector(differentBillingAddressSelector);
    await page.click(differentBillingAddressSelector);
    await delay(2000);

    await enterAddressDetails(page, billingAddress);

    await page.waitForSelector(billingAddressSubmitButtonSelector);
    await page.click(billingAddressSubmitButtonSelector);
    await delay(2000);

    await page.waitForSelector(orderSubmitButtonSelector);
    await page.click(orderSubmitButtonSelector);
    await delay(5000);
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
}

async function enterAddressDetails(page, address) {
  try {
    const firstNameSelector = 'input[name="address.firstName"]';
    const lastNameSelector = 'input[name="address.lastName"]';
    const address1Selector = 'input[name="address.address1"]';
    const address2Selector = 'input[name="address.address2"]';
    const citySelector = 'input[name="address.city"]';
    const stateSelector = 'select[name="address.state"]';
    const postalCodeSelector = 'input[name="address.postalCode"]';

    await page.waitForSelector(firstNameSelector);
    await page.type(firstNameSelector, address.first_name, {
      delay: 10
    });
    await delay(2000);

    await page.waitForSelector(lastNameSelector);
    await page.type(lastNameSelector, address.last_name, {
      delay: 10
    });
    await delay(2000);

    await page.waitForSelector(address1Selector);
    await page.type(address1Selector, address.address_line_1, {
      delay: 10
    });
    await delay(2000);

    await page.waitForSelector(address2Selector);
    await page.type(address2Selector, address.address_line_2, {
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

    await page.waitForSelector(postalCodeSelector);
    await page.type(postalCodeSelector, address.postal_code, {
      delay: 10
    });
    await delay(2000);
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
}
