const express = require("express");
const app = express();
require("dotenv-flow").config();

const footsites = require("./sites/footsites");
const nike = require("./sites/nike");
const { testProxy } = require("./helpers/proxies");
const { sendEmail } = require("./helpers//email");

const addToCart = async (req, res) => {
  try {
    const site = req.body.site;
    const proxy = req.body.proxy || null;
    const url = req.body.url;
    const styleIndex = req.body.styleIndex;
    const size = req.body.size;

    if (proxy && !testProxy(proxy)) {
      throw new Error("The proxy is not working.");
    }

    let status = {};
    switch (site) {
      case "nike":
        status = await nike.addToCart(url, proxy, styleIndex, size);
        break;
      case "footsites":
        status = await footsites.addToCart(url, proxy, styleIndex, size);
        break;
    }

    let recipient = process.env.EMAIL_USERNAME;
    let subject;
    let text;
    if (status.hasCaptcha) {
      subject = "ATC task has captcha";
      text = `The ATC task for ${url} size ${size} has a captcha. Please open the browser to check on it.`;
    } else if (status.isInCart) {
      subject = "ATC task success";
      text = `The ATC task for ${url} size ${size} has succeeded.`;
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

app.route("/addToCart").post(addToCart);

app.listen(8000, () => console.log("App listening on port 8000"));
