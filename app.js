const express = require("express");
const app = express();
const footlocker = require("./sites/footlocker");

const footlockerAddToCart = async (req, res) => {
  try {
    const url = req.body.url;
    const styleIndex = req.body.styleIndex;
    const size = req.body.size;

    await footlocker.addToCart(url, styleIndex, size);

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

app.route("/footlocker/AddToCart").post(footlockerAddToCart);

app.listen(8000, () => console.log("App listening on port 8000"));
