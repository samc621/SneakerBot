import solveCaptcha from '../helpers/captcha.js';
import sendEmail from '../helpers/email.js';
import getCardDetailsByFriendlyName from '../helpers/credit-cards.js';

async function enterAddressDetails({ page, address, type }) {
  const firstNameSelector = `input#checkout_${type}_address_first_name`;
  const lastNameSelector = `input#checkout_${type}_address_last_name`;
  const address1Selector = `input#checkout_${type}_address_address1`;
  const address2Selector = `input#checkout_${type}_address_address2`;
  const citySelector = `input#checkout_${type}_address_city`;
  const stateSelector = `select#checkout_${type}_address_province`;
  const postalCodeSelector = `input#checkout_${type}_address_zip`;
  const phoneNumberSelector = `input#checkout_${type}_address_phone`;

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

  await page.waitForSelector(phoneNumberSelector);
  await page.type(phoneNumberSelector, 1 + address.phone_number, {
    delay: 10
  });
  await page.waitForTimeout(2000);
}

async function checkout({
  taskLogger,
  page,
  shippingAddress,
  shippingSpeedIndex,
  billingAddress,
  domain,
  autoSolveCaptchas,
  notificationEmailAddress,
  url,
  size,
  cardFriendlyName
}) {
  taskLogger.info('Navigating to checkout page');
  await page.goto(`${domain}/checkout`, { waitUntil: 'domcontentloaded' });

  let hasCaptcha = false;
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

  const emailSelector = 'input#checkout_email';
  const submitButtonsSelector = 'button#continue_button';

  const shippingSpeedsSelector = 'input[name="checkout[shipping_rate][id]"]';

  const cardFieldsIframeSelector = 'iframe.card-fields-iframe';
  const creditCardNumberSelector = 'input#number';
  const nameOnCardSelector = 'input#name';
  const creditCardExpirationDateSelector = 'input#expiry';
  const creditCardCVVSelector = 'input#verification_value';

  const differentBillingAddressSelector = 'input#checkout_different_billing_address_true';

  const captchaSelector = 'div#g-recaptcha';
  try {
    hasCaptcha = await page.waitForSelector(captchaSelector, { timeout: 5000 });
  } catch (err) {
    // no-op if timeout occurs
  }

  if (hasCaptcha) {
    if (autoSolveCaptchas) {
      const solved = await solveCaptcha({
        taskLogger,
        page,
        captchaSelector
      });
      if (solved) hasCaptcha = false;
    } else {
      taskLogger.info('Detected captcha for manual solving');
      const recipient = notificationEmailAddress;
      const subject = 'Checkout task unsuccessful';
      const text = `The checkout task for ${url} size ${size} has a captcha. Please open the browser and complete it within 5 minutes.`;
      await sendEmail({ recipient, subject, text });
      taskLogger.info(text);

      await Promise.race([
        new Promise(() => {
          setTimeout(() => {
            throw new Error('The captcha was not solved in time.');
          }, 5 * 60 * 1000);
        }),
        new Promise((resolve) => {
          const interval = setInterval(async () => {
            const solved = await page.evaluate(() => {
              return document.querySelector('#g-recaptcha-response').value.length > 0;
            });
            if (solved) {
              hasCaptcha = false;
              resolve();
              clearInterval(interval);
            }
          }, 1000);
        })
      ]);
    }
  }

  await page.waitForSelector(emailSelector);
  await page.type(emailSelector, shippingAddress.email_address, {
    delay: 10
  });
  await page.waitForTimeout(2000);

  taskLogger.info('Entering shipping details');
  await enterAddressDetails({ page, address: shippingAddress, type: 'shipping' });

  await page.waitForSelector(submitButtonsSelector);
  await page.click(submitButtonsSelector);
  await page.waitForTimeout(2000);

  taskLogger.info('Selecting desired shipping speed');
  await page.waitForSelector(shippingSpeedsSelector);
  const shippingSpeeds = await page.$$(shippingSpeedsSelector);
  await shippingSpeeds[shippingSpeedIndex].click();
  await page.waitForTimeout(2000);

  await page.waitForSelector(submitButtonsSelector);
  await page.click(submitButtonsSelector);
  await page.waitForTimeout(2000);

  taskLogger.info('Entering card details');
  await page.waitForSelector(cardFieldsIframeSelector);
  const cardFieldIframes = await page.$$(cardFieldsIframeSelector);

  const cardNumberFrameHandle = cardFieldIframes[0];
  const cardNumberFrame = await cardNumberFrameHandle.contentFrame();
  await cardNumberFrame.waitForSelector(creditCardNumberSelector);
  await cardNumberFrame.type(creditCardNumberSelector, cardDetails.cardNumber, {
    delay: 10
  });

  const nameOnCardFrameHandle = cardFieldIframes[1];
  const nameOnCardFrame = await nameOnCardFrameHandle.contentFrame();
  await nameOnCardFrame.waitForSelector(nameOnCardSelector);
  await nameOnCardFrame.type(nameOnCardSelector, cardDetails.nameOnCard, {
    delay: 10
  });
  await page.waitForTimeout(2000);

  const cardExpirationDateFrameHandle = cardFieldIframes[2];
  const cardExpirationDateFrame = await cardExpirationDateFrameHandle.contentFrame();
  await cardExpirationDateFrame.waitForSelector(creditCardExpirationDateSelector);
  await cardExpirationDateFrame.type(creditCardExpirationDateSelector, cardDetails.expirationMonth + cardDetails.expirationYear, {
    delay: 10
  });
  await page.waitForTimeout(2000);

  const cardCVVFrameHandle = cardFieldIframes[3];
  const cardCVVFrame = await cardCVVFrameHandle.contentFrame();
  await cardCVVFrame.type(creditCardCVVSelector, cardDetails.securityCode, {
    delay: 10
  });
  await page.waitForTimeout(2000);

  // some sites do not require billing address or do not allow a different billing address from shipping address
  try {
    await page.waitForSelector(differentBillingAddressSelector);
    await page.click(differentBillingAddressSelector);
    await page.waitForTimeout(2000);

    taskLogger.info('Entering billing details');
    await enterAddressDetails({
      page,
      address: billingAddress,
      type: 'billing'
    });
  } catch (err) {
    // no-op if timeout occurs
  }

  taskLogger.info('Clicking submit order button');
  await page.waitForSelector(submitButtonsSelector);
  await page.click(submitButtonsSelector);
  await page.waitForTimeout(5000);

  await page.goto(`${domain}/checkout`, { waitUntil: 'domcontentloaded' });
  if (page.url() === `${domain}/cart`) {
    checkoutComplete = true;
  }

  return checkoutComplete;
}

const guestCheckout = async ({
  taskLogger,
  page,
  url,
  size,
  shippingAddress,
  shippingSpeedIndex,
  billingAddress,
  autoSolveCaptchas,
  notificationEmailAddress,
  cardFriendlyName
}) => {
  const domain = url.split('/').slice(0, 3).join('/');

  taskLogger.info('Navigating to URL');
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const variantId = await page.evaluate((sizeStr) => {
    const { variants } = window.ShopifyAnalytics.meta.product;
    return variants.find((variant) => variant.name.endsWith(sizeStr)).id;
  }, size);

  let isInCart = false;
  while (!isInCart) {
    taskLogger.info('Attempting to add product to cart');
    isInCart = await page.evaluate(async (id) => {
      const item = { id, quantity: 1 };

      const data = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: [item]
        })
      };

      const response = await fetch('/cart/add.js', data);
      if (response.status === 200) return true;
      return false;
    }, variantId);
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
      autoSolveCaptchas,
      notificationEmailAddress,
      url,
      size,
      cardFriendlyName
    });
  }

  return checkoutComplete;
};

export default guestCheckout;
