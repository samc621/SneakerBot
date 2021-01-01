const express = require("express");
const app = express();
const routes = require("./routes");
require("dotenv-flow").config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/v1", routes);

var types = require("pg").types;
// Return numerics as Float (parsed from String)
types.setTypeParser(1700, val => {
  return parseFloat(val);
});

const port = process.env.PORT;
app.listen(port, () => console.log(`App listening at port ${port}`));
