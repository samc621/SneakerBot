import getStateNameFromAbbreviation from '../helpers/states.js';
import getCardDetailsByFriendlyName from '../helpers/credit-cards.js';

async function enterAddressDetails({ page, address, type }) {
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

  try {
    await page.waitForSelector(stateSelector);
    await page.select(stateSelector, getStateNameFromAbbreviation(address.state));
    await page.waitForTimeout(2000);
  } catch (err) {
    // no op if timeout waiting for state selector
  }

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
}

async function checkout({ taskLogger, page, shippingAddress, shippingSpeedIndex, billingAddress, domain, cardFriendlyName }) {
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
    page,
    address: billingAddress,
    type: 'billing'
  });

  await page.waitForSelector(reviewAndPayButtonsSelector);
  await page.click(reviewAndPayButtonsSelector);
  await page.waitForTimeout(2000);

  taskLogger.info('Entering card details');
  await page.waitForSelector(creditCardNumberIframeSelector);
  const cardNumberFrameHandle = await page.$(creditCardNumberIframeSelector);
  const cardNumberFrame = await cardNumberFrameHandle.contentFrame();
  await cardNumberFrame.waitForSelector(creditCardNumberSelector);
  await cardNumberFrame.type(creditCardNumberSelector, cardDetails.cardNumber, {
    delay: 10
  });

  await page.waitForSelector(nameOnCardSelector);
  const nameOnCardHandle = await page.$(nameOnCardSelector);
  await nameOnCardHandle.click();
  await nameOnCardHandle.focus();
  await nameOnCardHandle.click({ clickCount: 3 });
  await nameOnCardHandle.press('Backspace');

  await page.type(nameOnCardSelector, cardDetails.nameOnCard, {
    delay: 10
  });
  await page.waitForTimeout(2000);

  await page.waitForSelector(creditCardExpirationDateSelector);
  await page.type(creditCardExpirationDateSelector, cardDetails.expirationMonth + cardDetails.expirationYear, {
    delay: 10
  });
  await page.waitForTimeout(2000);

  await page.waitForSelector(creditCardCVVIframeSelector);
  const cardCVVFrameHandle = await page.$(creditCardCVVIframeSelector);
  const cardCVVFrame = await cardCVVFrameHandle.contentFrame();
  await cardCVVFrame.type(creditCardCVVSelector, cardDetails.securityCode, {
    delay: 10
  });
  await page.waitForTimeout(2000);

  taskLogger.info('Clicking place order button');
  await page.waitForSelector(placeOrderButtonsSelector);
  await page.click(placeOrderButtonsSelector);
  await page.waitForTimeout(5000);

  await page.goto(`${domain}/payment`, { waitUntil: 'domcontentloaded' });
  if (page.url() === `${domain}/cart`) {
    checkoutComplete = true;
  }

  return checkoutComplete;
}

async function closeModal({ taskLogger, page }) {
  try {
    const modalCloseButtonSelector = 'button.gl-modal__close';
    await page.waitForSelector(modalCloseButtonSelector, { visible: true });
    taskLogger.info('Closing modal');
    await page.click(modalCloseButtonSelector);
  } catch (err) {
    // no-op
  }
}

async function searchByProductCode({ taskLogger, page, productCode, domain }) {
  taskLogger.info('Searching for product by product code');
  let searchResult;
  while (!searchResult) {
    await page.goto(`${domain}/search?q=${productCode}`, { waitUntil: 'domcontentloaded' });
    await Promise.all([
      (async () => {
        try {
          searchResult = await page.waitForSelector('div[class*="grid-item"] a[data-auto-id="glass-hockeycard-link"]', { timeout: 5 * 1000 });
          taskLogger.info('Found search result, clicking');
          await searchResult.click();
        } catch (err) {
          // no-op
        }
      })(),
      (async () => {
        try {
          searchResult = await page.waitForSelector('div[class*="product-description"]', { timeout: 5 * 1000 });
          taskLogger.info('Navigated to product details page');
        } catch (err) {
          // no-op
        }
      })()
    ]);
  }
}

const guestCheckout = async ({ taskLogger, page, url, productCode, size, shippingAddress, shippingSpeedIndex, billingAddress, cardFriendlyName }) => {
  const splitDomain = url.split('/').slice(0, 4);
  const sitePath = splitDomain[3];
  const domain = splitDomain.join('/');

  await page.setRequestInterception(true);
  const availablityPromise = new Promise((resolve) => {
    page.on('response', async (response) => {
      if (new URL(response.url()).pathname.endsWith('/availability')) {
        const responseJson = await response.json();
        resolve(responseJson);
      }
    });
  });

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

  const responseJson = await availablityPromise;
  taskLogger.info('Found product availability');
  const product_id = responseJson.id;
  const sizes = responseJson.variation_list;
  const product_variation_sku = sizes.find((sizeObj) => sizeObj.size === size).sku;

  await page.waitForTimeout(15 * 1000);

  let isInCart = false;
  while (!isInCart) {
    taskLogger.info('Attempting to add product to cart');
    isInCart = await page.evaluate(
      async ({ productId, productVariationSku, sizeStr, sitePathStr }) => {
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
            size: sizeStr,
            displaySize: sizeStr
          })
        };
        const response = await fetch(`/api/chk/baskets/-/items?sitePath=${sitePathStr}`, data);
        return response.ok;
      },
      {
        productId: product_id,
        productVariationSku: product_variation_sku,
        sizeStr: size,
        sitePathStr: sitePath
      }
    );

    if (!isInCart) {
      taskLogger.info('Got error while adding to cart from API, falling back to DOM');

      const selectedSize = await page.evaluate((sizeStr) => {
        const sizeButtons = Array.from(document.querySelectorAll('div[data-auto-id="size-selector"] button'));
        const sizeButton = sizeButtons.find((button) => button.innerText === sizeStr);
        if (sizeButton) {
          sizeButton.click();
          return true;
        }
        return false;
      }, size);

      if (selectedSize) {
        await page.waitForTimeout(2 * 1000);

        const atcButtonSelector = 'button[title="Add To Bag"]';
        await page.waitForSelector(atcButtonSelector);
        await page.click(atcButtonSelector);
        taskLogger.info('Selected size from DOM');

        const modal = await page.waitForSelector('div.gl-modal', { visible: true });
        isInCart = await modal.$eval('h5', (heading) => /SUCCESSFULLY ADDED TO BAG!/i.test(heading.innerText));
        taskLogger.info('Found success modal, continuing to checkout');
      }
    }
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
};

export default guestCheckout;
