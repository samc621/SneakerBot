const environment = process.env.NODE_ENV || "local";
const configuration = require("../../knexfile")[environment];
const knex = require("knex")(configuration);

let retries = 5;

function connectToDB() {
  while (retries > 0) {
    knex.raw("select 1+1 as result").catch(err => {
      console.error("Couldn't connect to DB: ", err);
      retries -= 1;
      console.log(`Retries left: ${retries}`);
      setTimeout(connectToDB, 5000);
    });
    break;
  }
}

connectToDB();

module.exports = knex;
