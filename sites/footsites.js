const puppeteer = require("puppeteer");

let page;

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

exports.addToCart = async (url, styleIndex, size) => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ["--start-maximized"]
    });
    page = await browser.newPage();
    await page.goto(url);
    await delay(5000);
    await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });

    let isInCart = false;
    let retries = 0;
    while (!isInCart && retries < 3) {
      const stylesSelector =
        "div.c-form-field.c-form-field--radio.SelectStyle.col";
      await page.waitForSelector(stylesSelector).then(() => {
        console.log("The styles were found.");
      });
      const styles = await page.$$(stylesSelector);
      await styles[styleIndex].click();
      await delay(10000);

      const sizesSelector = "div.c-form-field.c-form-field--radio.ProductSize";
      await page.waitForSelector(sizesSelector).then(() => {
        console.log("The sizes were found.");
      });
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
      await delay(10000);

      const atcButtonSelector =
        "button.Button.Button.ProductDetails-form__action";
      await page.waitForSelector(atcButtonSelector).then(() => {
        console.log("The ATC button was found.");
      });
      await page.click(atcButtonSelector);
      await delay(1000);

      const cartSelector = "span.CartCount-badge";
      let cart = await page.$$(cartSelector);
      cart = cart.pop();
      let cartCount = cart ? await cart.getProperty("innerText") : null;
      cartCount = cartCount ? await cartCount.jsonValue() : 0;
      if (cartCount == 1) {
        isInCart = true;
      } else {
        retries++;
      }
    }
    return isInCart;
  } catch (err) {
    throw new Error(err.message);
  }
};
