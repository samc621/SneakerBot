const useProxy = require('puppeteer-page-proxy');
const { getCardDetailsByFriendlyName } = require('../helpers/credit-cards');

async function enterAddressDetails({ page, address }) {
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
    await page.waitForTimeout(2000);

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

    await page.waitForSelector(citySelector);
    await page.type(citySelector, address.city, {
      delay: 10
    });
    await page.waitForTimeout(2000);

    try {
      await page.waitForSelector(stateSelector);
      await page.select(stateSelector, address.state);
      await page.waitForTimeout(2000);
    } catch (err) {
      // no op if timeout waiting for state selector
    }

    await page.waitForSelector(postalCodeSelector);
    await page.type(postalCodeSelector, address.postal_code, {
      delay: 10
    });
    await page.waitForTimeout(2000);
  } catch (err) {
    throw err;
  }
}

async function checkout({
  taskLogger,
  page,
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
    await page.goto('https://nike.com/checkout', { waitUntil: 'domcontentloaded' });

    const enterAddressManuallyButtonSelector = 'a#addressSuggestionOptOut';
    const address2ExpandButtonSelector = 'button[aria-controls=address2]';
    const emailSelector = 'input[name="address.email"]';
    const phoneNumberSelector = 'input[name="address.phoneNumber"]';
    const shippingAddressSubmitButtonSelector = 'button.js-next-step.saveAddressBtn';

    const shippingSpeedsSelector = 'div.shippingOptionsSelectorContainer';
    const shippingSpeedSubmitButtonSelector = 'button.js-next-step.continuePaymentBtn';

    const cardDetailsIframeSelector = 'iframe.credit-card-iframe.mt1.u-full-width.prl2-sm';
    const creditCardNumberSelector = 'input#creditCardNumber';
    const creditCardExpirationDateSelector = 'input#expirationDate';
    const creditCardCVVSelector = 'input#cvNumber';

    const differentBillingAddressSelector = 'label[for=billingAddress]';
    const billingAddressSubmitButtonSelector = 'button[data-attr=continueToOrderReviewBtn]';

    const orderSubmitButtonSelector = 'button.d-lg-ib.d-sm-h.fs14-sm.ncss-brand.ncss-btn-accent.pb2-lg.pb3-sm.prl5-sm.pt2-lg.pt3-sm.u-uppercase';

    await page.waitForSelector(enterAddressManuallyButtonSelector);
    await page.click(enterAddressManuallyButtonSelector);
    await page.waitForTimeout(2000);

    await page.waitForSelector(address2ExpandButtonSelector);
    await page.click(address2ExpandButtonSelector);
    await page.waitForTimeout(2000);

    taskLogger.info('Entering shipping details');
    await enterAddressDetails({ page, address: shippingAddress });

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

    await page.waitForSelector(shippingAddressSubmitButtonSelector);
    await page.click(shippingAddressSubmitButtonSelector);
    await page.waitForTimeout(2000);

    taskLogger.info('Selecting desired shipping speed');
    await page.waitForSelector(shippingSpeedsSelector);
    const shippingSpeeds = await page.$$(shippingSpeedsSelector);
    await shippingSpeeds[shippingSpeedIndex].click();
    await page.waitForTimeout(2000);

    await page.waitForSelector(shippingSpeedSubmitButtonSelector);
    await page.click(shippingSpeedSubmitButtonSelector);
    await page.waitForTimeout(2000);

    taskLogger.info('Entering card details');
    await page.waitForSelector(cardDetailsIframeSelector);
    const frameHandle = await page.$(cardDetailsIframeSelector);
    const frame = await frameHandle.contentFrame();

    await frame.type(creditCardNumberSelector, cardDetails.cardNumber, {
      delay: 10
    });

    // strange bug with Nike, have to enter the last three digits of the card number twice
    // const last3 = String(cardDetails.cardNumber).substr(
    //   cardDetails.cardNumber.length - 3
    // );
    // await frame.type(creditCardNumberSelector, last3, {
    //   delay: 10
    // });
    await page.waitForTimeout(2000);

    await frame.type(
      creditCardExpirationDateSelector,
      String(cardDetails.expirationMonth).concat(cardDetails.expirationYear),
      {
        delay: 10
      }
    );
    await page.waitForTimeout(2000);

    await frame.type(creditCardCVVSelector, cardDetails.securityCode, {
      delay: 10
    });
    await page.waitForTimeout(2000);

    await page.waitForSelector(differentBillingAddressSelector);
    await page.click(differentBillingAddressSelector);
    await page.waitForTimeout(2000);

    taskLogger.info('Entering billing details');
    await enterAddressDetails({ page, address: billingAddress });

    await page.waitForSelector(billingAddressSubmitButtonSelector);
    await page.click(billingAddressSubmitButtonSelector);
    await page.waitForTimeout(2000);

    await page.waitForSelector(orderSubmitButtonSelector);
    await page.click(orderSubmitButtonSelector);
    await page.waitForTimeout(5000);
  } catch (err) {
    throw err;
  }
}

exports.guestCheckout = async ({
  taskLogger,
  page,
  url,
  proxyString,
  styleIndex,
  size,
  shippingAddress,
  shippingSpeedIndex,
  billingAddress,
  cardFriendlyName
}) => {
  try {
    await useProxy(page, proxyString);
    taskLogger.info('Navigating to URL');
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    let isInCart = false;
    let checkoutComplete = false;
    while (!isInCart) {
      try {
        const stylesSelector = 'a.colorway-product-overlay';
        await page.waitForSelector(stylesSelector);
        const styles = await page.$$(stylesSelector);
        await styles[styleIndex].click();
      } catch (err) {
        // no op if timeout waiting for style selector
      }

      const sizesSelector = 'div.mt2-sm div input';
      await page.waitForSelector(sizesSelector);
      await page.evaluate((sizesSelectorText, sizeValue) => {
        const sizes = Array.from(document.querySelectorAll(sizesSelectorText));
        const matchingSize = sizes.find((sz) => sz.value.endsWith(sizeValue));
        if (matchingSize) {
          matchingSize.click();
        }
      }, sizesSelector, size);

      const atcButtonSelector = 'button.ncss-btn-primary-dark.btn-lg.add-to-cart-btn';
      await page.waitForSelector(atcButtonSelector);
      await page.evaluate((atcButtonSelectorText) => {
        const buttons = Array.from(document.querySelectorAll(atcButtonSelectorText));
        const button = buttons.find((btn) => btn.innerText === 'Add to Bag');
        if (button) {
          button.click();
        }
      }, atcButtonSelector);
      await page.waitForTimeout(2000);

      const cartSelector = 'span.pre-jewel.pre-cart-jewel.text-color-primary-dark';
      await page.waitForSelector(cartSelector);
      const cartCount = await page.evaluate((cartTextSelector) => {
        return document.querySelector(cartTextSelector).innerText;
      }, cartSelector);

      if (parseInt(cartCount) === 1) {
        isInCart = true;
      }
      taskLogger.info('Not in cart, trying again');
    }

    if (isInCart) {
      await checkout({
        taskLogger, page, shippingAddress, shippingSpeedIndex, billingAddress, cardFriendlyName
      });

      const cartSelector = 'span.va-sm-m.fs12-sm.ta-sm-c';
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
