const express = require("express");
const app = express();
require("dotenv-flow").config();

const footsites = require("./sites/footsites");
const nike = require("./sites/nike");
const { testProxy } = require("./helpers/proxies");
const { sendEmail } = require("./helpers//email");

const guestCheckout = async (req, res) => {
  try {
    const site = req.body.site;
    const proxy = req.body.proxy || null;
    const url = req.body.url;
    const styleIndex = req.body.styleIndex;
    const size = req.body.size;
    const address = req.body.address;
    const shippingSpeedIndex = req.body.shippingSpeedIndex;

    if (proxy && !testProxy(proxy)) {
      throw new Error("The proxy is not working.");
    }

    let status = {};
    switch (site) {
      case "nike":
        status = await nike.guestCheckout(
          url,
          proxy,
          styleIndex,
          size,
          address,
          shippingSpeedIndex,
          address
        );
        break;
      case "footsites":
        status = await footsites.guestCheckout(
          url,
          proxy,
          styleIndex,
          size,
          address,
          shippingSpeedIndex,
          address
        );
        break;
    }

    let recipient = process.env.EMAIL_USERNAME;
    let subject;
    let text;
    if (status.hasCaptcha) {
      subject = "Checkout task unsuccessful";
      text = `The checkout task for ${url} size ${size} has a captcha. Please open the browser to check on it.`;
    } else if (status.isInCart && !status.checkoutComplete) {
      subject = "Checkout task unsuccessful";
      text = `The checkout task for ${url} size ${size} has a checkout error. Please open the browser to check on it.`;
    } else if (status.checkoutComplete) {
      subject = "Checkout task successful";
      text = `The checkout task for ${url} size ${size} has completed.`;
    }
    await sendEmail(recipient, subject, text);

    return res.status(200).json({
      success: false,
      message: "The task is complete",
      data: status
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.route("/guestCheckout").post(guestCheckout);

app.listen(8000, () => console.log("App listening on port 8000"));
