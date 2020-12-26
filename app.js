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

    let added;
    switch (site) {
      case "nike":
        added = await nike.addToCart(url, styleIndex, size);
        break;
      case "footsites":
        added = await footsites.addToCart(url, styleIndex, size);
        break;
    }

    return res.status(200).json({
      success: false,
      message: "The task is complete",
      data: { added }
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
