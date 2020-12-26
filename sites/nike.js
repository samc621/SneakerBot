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
    // await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });

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
  } catch (err) {
    throw new Error(err.message);
  }
};
