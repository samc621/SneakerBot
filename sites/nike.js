import getCardDetailsByFriendlyName from '../helpers/credit-cards.js';

async function enterAddressDetails({ page, address }) {
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
}

async function checkout({ taskLogger, page, shippingAddress, shippingSpeedIndex, billingAddress, cardFriendlyName }) {
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

  // strange bug with Nike, frame.type() doesn't work on this field.
  // have to manually set the value
  await frame.evaluate(
    ({ creditCardNumberSelector: creditCardNumberSelectorStr, cardDetails: cardDetailsObj }) => {
      const fieldHandle = document.querySelector(creditCardNumberSelectorStr);
      fieldHandle.value = cardDetailsObj.cardNumber;
    },
    { creditCardNumberSelector, cardDetails }
  );
  await page.waitForTimeout(2000);

  await frame.click(creditCardNumberSelector);
  await page.waitForTimeout(2000);

  await frame.click(creditCardExpirationDateSelector);
  await page.waitForTimeout(2000);
  await frame.type(creditCardExpirationDateSelector, String(cardDetails.expirationMonth).concat(cardDetails.expirationYear), {
    delay: 10
  });
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
}

async function searchByProductCode({ taskLogger, page, productCode }) {
  taskLogger.info('Searching for product by product code');
  let searchResult;
  while (!searchResult) {
    await page.goto(`https://www.nike.com/w?q=${productCode}&vst=${productCode}`, { waitUntil: 'domcontentloaded' });
    try {
      searchResult = await page.waitForSelector('.product-grid .product-card__link-overlay', { timeout: 5 * 1000 });
    } catch (err) {
      // no-op
    }
  }
  taskLogger.info('Found search result, clicking');
  await searchResult.click();
}

const guestCheckout = async ({
  taskLogger,
  page,
  url,
  productCode,
  styleIndex,
  size,
  shippingAddress,
  shippingSpeedIndex,
  billingAddress,
  cardFriendlyName
}) => {
  if (productCode) {
    await searchByProductCode({ taskLogger, page, productCode });
  } else {
    taskLogger.info('No product code supplied, navigating to URL');
    await page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  let isInCart = false;
  let checkoutComplete = false;
  while (!isInCart) {
    // const productsPromise = new Promise((resolve) => {
    //   page.on('response', async (response) => {
    //     if (response.request().method() === 'POST' && new URL(response.url()).pathname.endsWith('/products')) {
    //       const responseJson = await response.json();
    //       if (responseJson && responseJson.products) {
    //         resolve(responseJson);
    //       }
    //     }
    //   });
    // });

    try {
      const stylesSelector = 'a.colorway-product-overlay';
      await page.waitForSelector(stylesSelector);
      const styles = await page.$$(stylesSelector);
      await styles[styleIndex].click();
      taskLogger.info('Selected style by index');
      await page.waitForTimeout(2000);
    } catch (err) {
      // no op if timeout waiting for style selector
    }

    // taskLogger.info('Waiting for products response');
    // const responseJson = await productsPromise;
    // taskLogger.info('Found products response');
    // const skuObj = responseJson.products[0].skuData.find((data) => data.size === size);
    // const { sku } = skuObj;

    // taskLogger.info('Attempting to add product to cart');
    // isInCart = await page.evaluate(async ({
    //   pathname, skuId
    // }) => {
    //   const data = {
    //     method: 'PATCH',
    //     headers: {
    //       Accept: 'application/json',
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify([{
    //       op: 'add',
    //       path: '/items',
    //       value: {
    //         itemData: { url: pathname },
    //         quantity: 1,
    //         skuId
    //       }
    //     }])
    //   };
    //   const response = await fetch('https://api.nike.com/buy/carts/v2/US/NIKE/NIKECOM?modifiers=VALIDATELIMITS,VALIDATEAVAILABILITY', data);
    //   return response.ok;
    // }, {
    //   pathname: new URL(page.url()).pathname, skuId: sku
    // });

    // sizes on Nike must be entered in US size, even if on a international site e.g. Nike EU
    const sizesSelector = 'div.mt2-sm div input, div.mt4 div input';
    // using timeout 0 in case we are waiting for product drop and then sizes are enabled
    await page.waitForSelector(sizesSelector, { timeout: 0 });
    taskLogger.info('Selecting size');
    await page.evaluate(
      (sizesSelectorText, sizeValue) => {
        const sizes = Array.from(document.querySelectorAll(sizesSelectorText));
        const matchingSize = sizes.find((sz) => sz.value.endsWith(sizeValue));
        if (matchingSize) {
          matchingSize.click();
        }
      },
      sizesSelector,
      size
    );

    const atcButtonSelector = 'button.add-to-cart-btn';
    await page.waitForSelector(atcButtonSelector);
    taskLogger.info('Clicking add to cart button');
    await page.evaluate((atcButtonSelectorText) => {
      const button = document.querySelector(atcButtonSelectorText);
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
      taskLogger,
      page,
      shippingAddress,
      shippingSpeedIndex,
      billingAddress,
      cardFriendlyName
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
};

export default guestCheckout;
