const express = require("express");
const app = express();
const footsites = require("./sites/footsites");
const nike = require("./sites/nike");

const addToCart = async (req, res) => {
  try {
    const site = req.body.site;
    const url = req.body.url;
    const styleIndex = req.body.styleIndex;
    const size = req.body.size;

    switch (site) {
      case "nike":
        await nike.addToCart(url, styleIndex, size);
        break;
      case "footsites":
        await footsites.addToCart(url, styleIndex, size);
        break;
    }

    return res.status(200).json({
      success: false,
      message: "The product has been added to your cart"
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
