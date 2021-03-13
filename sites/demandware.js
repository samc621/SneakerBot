const useProxy = require('puppeteer-page-proxy');
const { getStateNameFromAbbreviation } = require('../helpers/states');
const { getCardDetailsByFriendlyName } = require('../helpers/credit-cards');

async function enterAddressDetails({ page, address, type }) {
  try {
    const firstNameSelector = `input#${type}Address-firstName`;
    const lastNameSelector = `input#${type}Address-lastName`;
    const address1Selector = `input#${type}Address-address1`;
    const address2Selector = `input#${type}Address-address2`;
    const citySelector = `input#${type}Address-city`;
    const stateSelector = `select[data-auto-id="${type}Address-stateCode"]`;
    const postalCodeSelector = `input#${type}Address-zipcode`;
    const emailSelector = `input#${type}Address-emailAddress`;
    const phoneNumberSelector = `input#${type}Address-phoneNumber`;

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

    await page.waitForSelector(stateSelector);
    await page.select(stateSelector, getStateNameFromAbbreviation(address.state));
    await page.waitForTimeout(2000);

    await page.waitForSelector(postalCodeSelector);
    await page.type(postalCodeSelector, address.postal_code, {
      delay: 10
    });
    await page.waitForTimeout(2000);

    // no email address required for billing info
    try {
      await page.waitForSelector(emailSelector);
      await page.type(emailSelector, address.email_address, {
        delay: 10
      });
      await page.waitForTimeout(2000);
    } catch (err) {
      // no-op if timeout occurs
    }

    await page.waitForSelector(phoneNumberSelector);
    await page.type(phoneNumberSelector, address.phone_number, {
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
  domain,
  cardFriendlyName
}) {
  try {
    taskLogger.info('Navigating to checkout page');
    await page.goto(`${domain}/delivery`, { waitUntil: 'domcontentloaded' });

    let checkoutComplete = false;

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

    const shippingSpeedsSelector = 'div[data-auto-id="delivery-option"]';
    const manualAddressEntrySelector = 'a[aria-label="Enter address manually"]';
    const differentBillingAddressSelector = 'input[name="shouldUseShippingAddressForBilling"]';
    const reviewAndPayButtonsSelector = 'button[data-auto-id="review-and-pay-button"]';

    const creditCardNumberIframeSelector = 'iframe[aria-label="Card Number"]';
    const creditCardNumberSelector = 'input[aria-label="Card Number"]';
    const nameOnCardSelector = 'input[aria-label="Name on card"]';
    const creditCardExpirationDateSelector = 'input[aria-label="MM / YY"]';
    const creditCardCVVIframeSelector = 'iframe[aria-label="CVV"]';
    const creditCardCVVSelector = 'input[aria-label="CVV"]';
    const placeOrderButtonsSelector = 'button[data-auto-id="place-order-button"]';

    taskLogger.info('Selecting desired shipping speed');
    await page.waitForSelector(shippingSpeedsSelector);
    const shippingSpeeds = await page.$$(shippingSpeedsSelector);
    await shippingSpeeds[shippingSpeedIndex].click();
    await page.waitForTimeout(2000);

    await page.evaluate((manualAddressEntrySelectorStr) => {
      document.querySelector(manualAddressEntrySelectorStr).click();
    }, manualAddressEntrySelector);
    await page.waitForTimeout(2000);

    taskLogger.info('Entering shipping details');
    await enterAddressDetails({ page, address: shippingAddress, type: 'shipping' });

    await page.waitForSelector(differentBillingAddressSelector);
    await page.click(differentBillingAddressSelector);
    await page.waitForTimeout(2000);

    taskLogger.info('Entering billing details');
    await enterAddressDetails({
      page, address: billingAddress, type: 'billing'
    });

    await page.waitForSelector(reviewAndPayButtonsSelector);
    await page.click(reviewAndPayButtonsSelector);
    await page.waitForTimeout(2000);

    taskLogger.info('Entering card details');
    await page.waitForSelector(creditCardNumberIframeSelector);
    const cardNumberFrameHandle = await page.$(creditCardNumberIframeSelector);
    const cardNumberFrame = await cardNumberFrameHandle.contentFrame();
    await cardNumberFrame.waitForSelector(creditCardNumberSelector);
    await cardNumberFrame.type(
      creditCardNumberSelector,
      cardDetails.cardNumber,
      {
        delay: 10
      }
    );

    await page.waitForSelector(
      nameOnCardSelector
    );
    const nameOnCardHandle = await page.$(nameOnCardSelector);
    await nameOnCardHandle.click();
    await nameOnCardHandle.focus();
    await nameOnCardHandle.click({ clickCount: 3 });
    await nameOnCardHandle.press('Backspace');

    await page.type(
      nameOnCardSelector,
      cardDetails.nameOnCard,
      {
        delay: 10
      }
    );
    await page.waitForTimeout(2000);

    await page.waitForSelector(
      creditCardExpirationDateSelector
    );
    await page.type(
      creditCardExpirationDateSelector,
      cardDetails.expirationMonth + cardDetails.expirationYear,
      {
        delay: 10
      }
    );
    await page.waitForTimeout(2000);

    await page.waitForSelector(creditCardCVVIframeSelector);
    const cardCVVFrameHandle = await page.$(creditCardCVVIframeSelector);
    const cardCVVFrame = await cardCVVFrameHandle.contentFrame();
    await cardCVVFrame.type(creditCardCVVSelector, cardDetails.securityCode, {
      delay: 10
    });
    await page.waitForTimeout(2000);

    await page.waitForSelector(placeOrderButtonsSelector);
    await page.click(placeOrderButtonsSelector);
    await page.waitForTimeout(5000);

    await page.goto(`${domain}/payment`, { waitUntil: 'domcontentloaded' });
    if (page.url() === `${domain}/cart`) {
      checkoutComplete = true;
    }

    return checkoutComplete;
  } catch (err) {
    throw err;
  }
}

exports.guestCheckout = async ({
  taskLogger,
  page,
  url,
  proxyString,
  size,
  shippingAddress,
  shippingSpeedIndex,
  billingAddress,
  cardFriendlyName
}) => {
  try {
    const splitDomain = url.split('/').slice(0, 4);
    const sitePath = splitDomain[3];
    const domain = splitDomain.join('/');

    let responseJson;
    await page.setRequestInterception(true);
    page.on('response', async (response) => {
      if (response.url().includes('availability')) {
        responseJson = await response.json();
      }
    });
    await useProxy(page, proxyString);

    taskLogger.info('Navigating to URL');
    await page.goto(url, { waitUntil: 'networkidle2' });

    const product_id = responseJson.id;
    const sizes = responseJson.variation_list;
    const product_variation_sku = sizes.find((sizeObj) => sizeObj.size === size).sku;

    let isInCart = false;
    while (!isInCart) {
      isInCart = await page.evaluate(async ({
        productId, productVariationSku, sizeStr, sitePathStr
      }) => {
        const data = {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            product_id: productId,
            quantity: 1,
            product_variation_sku: productVariationSku,
            productId: productVariationSku,
            size: sizeStr
          })
        };

        const response = await fetch(`/api/baskets/-/items?sitePath=${sitePathStr}`, data);
        if (response.status === 200) return true;
        return false;
      }, {
        productId: product_id, productVariationSku: product_variation_sku, sizeStr: size, sitePathStr: sitePath
      });
    }

    let checkoutComplete = false;
    if (isInCart) {
      await page.waitForTimeout(2000);

      checkoutComplete = await checkout({
        taskLogger,
        page,
        shippingAddress,
        shippingSpeedIndex,
        billingAddress,
        domain,
        cardFriendlyName
      });
    }

    return checkoutComplete;
  } catch (err) {
    throw err;
  }
};
