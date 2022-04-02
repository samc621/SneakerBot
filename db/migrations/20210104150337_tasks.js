exports.up = function (knex) {
  knex.raw(`ALTER TABLE tasks ALTER COLUMN size TYPE varchar (255);`);
};

exports.down = function () {};
