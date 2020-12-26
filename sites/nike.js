const puppeteer = require("puppeteer");
const useProxy = require("puppeteer-page-proxy");

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

exports.addToCart = async (url, proxy, styleIndex, size) => {
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

    let isInCart = false;
    let retries = 0;
    while (!isInCart && retries < 3) {
      const stylesSelector = "div.colorway-product-overlay.css-sa2cc9";
      await page.waitForSelector(stylesSelector).then(() => {
        console.log("The styles were found.");
      });
      const styles = await page.$$(stylesSelector);
      await styles[styleIndex].click();
      await delay(5000);

      const sizesSelector = "div.mt2-sm.css-1j3x2vp div";
      await page.waitForSelector(sizesSelector).then(() => {
        console.log("The sizes were found.");
      });
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
      await delay(5000);

      const atcButtonSelector =
        "button.ncss-btn-primary-dark.btn-lg.css-y0myut.add-to-cart-btn";
      await page.waitForSelector(atcButtonSelector).then(() => {
        console.log("The ATC button was found.");
      });
      await page.click(atcButtonSelector);
      await delay(1000);

      const cartSelector =
        "span.pre-jewel.pre-cart-jewel.text-color-primary-dark";
      let cart = await page.$$(cartSelector);
      cart = cart.pop();
      let cartCount = await cart.getProperty("innerText");
      cartCount = await cartCount.jsonValue();
      if (cartCount == 1) {
        isInCart = true;
      } else {
        retries++;
      }
    }
    return { isInCart };
  } catch (err) {
    console.log(err);
    throw new Error(err.message);
  }
};
